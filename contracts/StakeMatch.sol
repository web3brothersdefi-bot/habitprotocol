// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StakeMatch
 * @notice A fully automated mutual staking platform where users stake 1 USDC to connect
 * @dev Implements two-way staking with automatic matching, refunds, and time-locked releases
 * @dev No admin controls - platform fee automatically sent to fixed wallet address
 */
contract StakeMatch is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Stake status enumeration
    enum StakeStatus {
        None,       // No stake exists
        Pending,    // Stake placed, waiting for mutual stake
        Matched,    // Both users have staked (matched)
        Refunded,   // Stake was refunded after timeout
        Released    // Stake was released after lock period
    }

    /// @notice Individual stake information
    struct Stake {
        uint256 amount;         // Amount staked (should always be STAKE_AMOUNT)
        uint256 timestamp;      // When the stake was created
        StakeStatus status;     // Current status of the stake
    }

    /// @notice Match information for paired users
    struct Match {
        address userA;          // First user in the match
        address userB;          // Second user in the match
        uint256 matchedAt;      // Timestamp when match was created
        bool released;          // Whether funds have been released
    }

    /// @notice USDC token contract address on Base Sepolia
    /// @dev Base Sepolia USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
    IERC20 public constant USDC = IERC20(0x036CbD53842c5426634e7929541eC2318f3dCF7e);

    /// @notice Platform fee recipient address (receives 1% of matched stakes)
    address public constant FEE_WALLET = 0x486b50e142037eBEFF08cB120D0F0462834Dd32c;

    /// @notice Required stake amount (1 USDC with 6 decimals)
    uint256 public constant STAKE_AMOUNT = 1 * 1e6; // Changed from 10 to 1 USDC

    /// @notice Time period after which unmatched stakes can be refunded (2 days)
    uint256 public constant REFUND_PERIOD = 2 days;

    /// @notice Time period after which matched stakes can be released (7 days)
    uint256 public constant RELEASE_PERIOD = 7 days;

    /// @notice Platform fee in basis points (100 = 1%)
    uint256 public constant FEE_BPS = 100;

    /// @notice Basis points denominator
    uint256 public constant BPS_DENOMINATOR = 10000;

    /// @notice Mapping of stakes: staker => target => Stake
    mapping(address => mapping(address => Stake)) public stakes;

    /// @notice Mapping of matches: matchId => Match
    mapping(bytes32 => Match) public matches;

    /// @notice Emitted when a user stakes to connect with another user
    event Staked(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 timestamp
    );

    /// @notice Emitted when two users are matched
    event Matched(
        address indexed userA,
        address indexed userB,
        uint256 timestamp
    );

    /// @notice Emitted when a stake is refunded
    event Refunded(
        address indexed from,
        address indexed to,
        uint256 amount
    );

    /// @notice Emitted when matched stakes are released
    event Released(
        address indexed userA,
        address indexed userB,
        uint256 amount
    );

    /// @notice Error thrown when stake amount is incorrect
    error InvalidStakeAmount();

    /// @notice Error thrown when trying to stake to self
    error CannotStakeToSelf();

    /// @notice Error thrown when stake already exists
    error StakeAlreadyExists();

    /// @notice Error thrown when stake doesn't exist
    error StakeDoesNotExist();

    /// @notice Error thrown when refund period hasn't elapsed
    error RefundPeriodNotElapsed();

    /// @notice Error thrown when stake is already matched
    error StakeAlreadyMatched();

    /// @notice Error thrown when match doesn't exist
    error MatchDoesNotExist();

    /// @notice Error thrown when release period hasn't elapsed
    error ReleasePeriodNotElapsed();

    /// @notice Error thrown when funds have already been released
    error FundsAlreadyReleased();

    /// @notice Error thrown when stake is not in pending status
    error StakeNotPending();

    /// @notice Error thrown when zero address is provided
    error ZeroAddress();

    /**
     * @notice Contract constructor
     * @dev Fully automated - no admin controls needed
     */
    constructor() {
        // No initialization needed - fully automated contract
    }

    /**
     * @notice Stake USDC to connect with another user
     * @dev Automatically creates a match if both users have staked to each other
     * @param target The address of the user to connect with
     */
    function stakeToConnect(address target) external nonReentrant {
        if (target == address(0)) revert ZeroAddress();
        if (target == msg.sender) revert CannotStakeToSelf();
        if (stakes[msg.sender][target].status != StakeStatus.None) {
            revert StakeAlreadyExists();
        }

        // Transfer USDC from user to contract
        USDC.safeTransferFrom(msg.sender, address(this), STAKE_AMOUNT);

        // Create stake record
        stakes[msg.sender][target] = Stake({
            amount: STAKE_AMOUNT,
            timestamp: block.timestamp,
            status: StakeStatus.Pending
        });

        emit Staked(msg.sender, target, STAKE_AMOUNT, block.timestamp);

        // Check if target has also staked to msg.sender (mutual stake)
        if (stakes[target][msg.sender].status == StakeStatus.Pending) {
            _createMatch(msg.sender, target);
        }
    }

    /**
     * @notice Refund an expired stake that hasn't been matched
     * @dev Can only be called after REFUND_PERIOD has elapsed
     * @param target The address that was staked to
     */
    function refundExpiredStake(address target) external nonReentrant {
        Stake storage stake = stakes[msg.sender][target];

        if (stake.status == StakeStatus.None) revert StakeDoesNotExist();
        if (stake.status != StakeStatus.Pending) revert StakeNotPending();
        if (block.timestamp < stake.timestamp + REFUND_PERIOD) {
            revert RefundPeriodNotElapsed();
        }

        uint256 refundAmount = stake.amount;
        stake.status = StakeStatus.Refunded;

        // Transfer USDC back to user
        USDC.safeTransfer(msg.sender, refundAmount);

        emit Refunded(msg.sender, target, refundAmount);
    }

    /**
     * @notice Release stakes after the lock period has elapsed
     * @dev Automatically distributes 99% to each user and 1% fee to platform wallet
     * @param target The other user in the match
     */
    function releaseStakeAfterMatch(address target) external nonReentrant {
        bytes32 matchId = _getMatchId(msg.sender, target);
        Match storage matchData = matches[matchId];

        if (matchData.userA == address(0)) revert MatchDoesNotExist();
        if (matchData.released) revert FundsAlreadyReleased();
        if (block.timestamp < matchData.matchedAt + RELEASE_PERIOD) {
            revert ReleasePeriodNotElapsed();
        }

        // Mark as released
        matchData.released = true;

        // Update stake statuses
        stakes[matchData.userA][matchData.userB].status = StakeStatus.Released;
        stakes[matchData.userB][matchData.userA].status = StakeStatus.Released;

        // Calculate amounts: 1% fee, 99% to each user
        uint256 totalStaked = STAKE_AMOUNT * 2;
        uint256 feeAmount = (totalStaked * FEE_BPS) / BPS_DENOMINATOR;
        uint256 userAmount = (totalStaked - feeAmount) / 2;

        // Transfer fee to platform wallet automatically
        USDC.safeTransfer(FEE_WALLET, feeAmount);

        // Transfer funds to both users
        USDC.safeTransfer(matchData.userA, userAmount);
        USDC.safeTransfer(matchData.userB, userAmount);

        emit Released(matchData.userA, matchData.userB, userAmount);
    }

    /**
     * @notice Get the status of a stake
     * @param from The address that staked
     * @param to The address that was staked to
     * @return status The current status of the stake
     * @return amount The amount staked
     * @return timestamp The timestamp when stake was created
     */
    function getStakeStatus(
        address from,
        address to
    ) external view returns (StakeStatus status, uint256 amount, uint256 timestamp) {
        Stake memory stake = stakes[from][to];
        return (stake.status, stake.amount, stake.timestamp);
    }

    /**
     * @notice Check if two users are matched
     * @param userA First user address
     * @param userB Second user address
     * @return matched True if users are matched, false otherwise
     * @return matchedAt Timestamp when match was created (0 if not matched)
     * @return released True if funds have been released
     */
    function isMatched(
        address userA,
        address userB
    ) external view returns (bool matched, uint256 matchedAt, bool released) {
        bytes32 matchId = _getMatchId(userA, userB);
        Match memory matchData = matches[matchId];

        if (matchData.userA == address(0)) {
            return (false, 0, false);
        }

        return (true, matchData.matchedAt, matchData.released);
    }

    /**
     * @notice Internal function to create a match between two users
     * @param userA First user address
     * @param userB Second user address
     */
    function _createMatch(address userA, address userB) internal {
        // Update both stakes to Matched status
        stakes[userA][userB].status = StakeStatus.Matched;
        stakes[userB][userA].status = StakeStatus.Matched;

        // Create match record
        bytes32 matchId = _getMatchId(userA, userB);
        matches[matchId] = Match({
            userA: userA,
            userB: userB,
            matchedAt: block.timestamp,
            released: false
        });

        emit Matched(userA, userB, block.timestamp);
    }

    /**
     * @notice Generate a unique match ID from two addresses
     * @dev Uses sorted addresses to ensure consistent ID regardless of order
     * @param userA First user address
     * @param userB Second user address
     * @return matchId The unique match identifier
     */
    function _getMatchId(address userA, address userB) internal pure returns (bytes32) {
        // Sort addresses to ensure consistent match ID
        (address addr1, address addr2) = userA < userB
            ? (userA, userB)
            : (userB, userA);
        return keccak256(abi.encodePacked(addr1, addr2));
    }
}
