// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StakeMatchV2 - Frontend Optimized
 * @notice Enhanced version with easy-to-query getter functions
 * @dev All stake data easily accessible for frontend
 */
contract StakeMatchV2 is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Stake status enumeration
    enum StakeStatus {
        None,       // 0: No stake exists
        Pending,    // 1: Stake placed, waiting for mutual stake
        Matched,    // 2: Both users have staked (matched)
        Refunded,   // 3: Stake was refunded after timeout
        Released    // 4: Stake was released after lock period
    }

    /// @notice Individual stake information
    struct Stake {
        uint256 amount;         // Amount staked
        uint256 timestamp;      // When the stake was created
        StakeStatus status;     // Current status
    }

    /// @notice Match information
    struct Match {
        address userA;
        address userB;
        uint256 matchedAt;
        bool released;
    }

    /// @notice Stake details for frontend (includes addresses)
    struct StakeInfo {
        address from;           // Who staked
        address to;             // Who was staked to
        uint256 amount;
        uint256 timestamp;
        StakeStatus status;
        bool matched;
        uint256 matchedAt;
    }

    /// @notice USDC token on Base Sepolia
    IERC20 public constant USDC = IERC20(0x036CbD53842c5426634e7929541eC2318f3dCF7e);

    /// @notice Platform fee wallet
    address public constant FEE_WALLET = 0x486b50e142037eBEFF08cB120D0F0462834Dd32c;

    /// @notice Constants
    uint256 public constant STAKE_AMOUNT = 1 * 1e6; // 1 USDC
    uint256 public constant REFUND_PERIOD = 2 days;
    uint256 public constant RELEASE_PERIOD = 7 days;
    uint256 public constant FEE_BPS = 100; // 1%
    uint256 public constant BPS_DENOMINATOR = 10000;

    /// @notice Storage
    mapping(address => mapping(address => Stake)) public stakes;
    mapping(bytes32 => Match) public matches;
    
    /// @notice Track all stakers for easy querying
    mapping(address => address[]) private userStakedTo;      // Who did user stake to
    mapping(address => address[]) private userStakedFrom;    // Who staked to user

    /// @notice Events
    event Staked(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 timestamp
    );

    event Matched(
        address indexed userA,
        address indexed userB,
        uint256 timestamp
    );

    event Refunded(
        address indexed from,
        address indexed to,
        uint256 amount
    );

    event Released(
        address indexed userA,
        address indexed userB,
        uint256 amount
    );

    /// @notice Errors
    error InvalidStakeAmount();
    error CannotStakeToSelf();
    error StakeAlreadyExists();
    error StakeDoesNotExist();
    error RefundPeriodNotElapsed();
    error StakeAlreadyMatched();
    error MatchDoesNotExist();
    error ReleasePeriodNotElapsed();
    error FundsAlreadyReleased();
    error StakeNotPending();
    error ZeroAddress();

    constructor() {}

    /**
     * @notice Stake USDC to connect with another user
     * @param target The address to connect with
     */
    function stakeToConnect(address target) external nonReentrant {
        if (target == address(0)) revert ZeroAddress();
        if (target == msg.sender) revert CannotStakeToSelf();
        if (stakes[msg.sender][target].status != StakeStatus.None) {
            revert StakeAlreadyExists();
        }

        // Transfer USDC
        USDC.safeTransferFrom(msg.sender, address(this), STAKE_AMOUNT);

        // Create stake
        stakes[msg.sender][target] = Stake({
            amount: STAKE_AMOUNT,
            timestamp: block.timestamp,
            status: StakeStatus.Pending
        });

        // Track for easy querying
        userStakedTo[msg.sender].push(target);
        userStakedFrom[target].push(msg.sender);

        emit Staked(msg.sender, target, STAKE_AMOUNT, block.timestamp);

        // Check for mutual stake
        if (stakes[target][msg.sender].status == StakeStatus.Pending) {
            _createMatch(msg.sender, target);
        }
    }

    /**
     * @notice Refund expired stake
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

        USDC.safeTransfer(msg.sender, refundAmount);

        emit Refunded(msg.sender, target, refundAmount);
    }

    /**
     * @notice Release stakes after lock period
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

        matchData.released = true;

        stakes[matchData.userA][matchData.userB].status = StakeStatus.Released;
        stakes[matchData.userB][matchData.userA].status = StakeStatus.Released;

        uint256 totalStaked = STAKE_AMOUNT * 2;
        uint256 feeAmount = (totalStaked * FEE_BPS) / BPS_DENOMINATOR;
        uint256 userAmount = (totalStaked - feeAmount) / 2;

        USDC.safeTransfer(FEE_WALLET, feeAmount);
        USDC.safeTransfer(matchData.userA, userAmount);
        USDC.safeTransfer(matchData.userB, userAmount);

        emit Released(matchData.userA, matchData.userB, userAmount);
    }

    // ============================================
    // FRONTEND-FRIENDLY GETTER FUNCTIONS
    // ============================================

    /**
     * @notice Get all incoming stakes for a user (who staked to them)
     * @param user The user address
     * @return Array of StakeInfo structs
     */
    function getIncomingStakes(address user) external view returns (StakeInfo[] memory) {
        address[] memory stakers = userStakedFrom[user];
        StakeInfo[] memory result = new StakeInfo[](stakers.length);
        
        for (uint256 i = 0; i < stakers.length; i++) {
            address staker = stakers[i];
            Stake memory stake = stakes[staker][user];
            
            // Check if matched
            (bool matched, uint256 matchedAt, ) = isMatched(staker, user);
            
            result[i] = StakeInfo({
                from: staker,
                to: user,
                amount: stake.amount,
                timestamp: stake.timestamp,
                status: stake.status,
                matched: matched,
                matchedAt: matchedAt
            });
        }
        
        return result;
    }

    /**
     * @notice Get all outgoing stakes for a user (who they staked to)
     * @param user The user address
     * @return Array of StakeInfo structs
     */
    function getOutgoingStakes(address user) external view returns (StakeInfo[] memory) {
        address[] memory targets = userStakedTo[user];
        StakeInfo[] memory result = new StakeInfo[](targets.length);
        
        for (uint256 i = 0; i < targets.length; i++) {
            address target = targets[i];
            Stake memory stake = stakes[user][target];
            
            // Check if matched
            (bool matched, uint256 matchedAt, ) = isMatched(user, target);
            
            result[i] = StakeInfo({
                from: user,
                to: target,
                amount: stake.amount,
                timestamp: stake.timestamp,
                status: stake.status,
                matched: matched,
                matchedAt: matchedAt
            });
        }
        
        return result;
    }

    /**
     * @notice Get all active (Pending or Matched) incoming stakes
     * @param user The user address
     * @return Array of active StakeInfo structs
     */
    function getActiveIncomingStakes(address user) external view returns (StakeInfo[] memory) {
        address[] memory stakers = userStakedFrom[user];
        
        // Count active stakes
        uint256 activeCount = 0;
        for (uint256 i = 0; i < stakers.length; i++) {
            StakeStatus status = stakes[stakers[i]][user].status;
            if (status == StakeStatus.Pending || status == StakeStatus.Matched) {
                activeCount++;
            }
        }
        
        // Build result array
        StakeInfo[] memory result = new StakeInfo[](activeCount);
        uint256 resultIndex = 0;
        
        for (uint256 i = 0; i < stakers.length; i++) {
            address staker = stakers[i];
            Stake memory stake = stakes[staker][user];
            
            if (stake.status == StakeStatus.Pending || stake.status == StakeStatus.Matched) {
                (bool matched, uint256 matchedAt, ) = isMatched(staker, user);
                
                result[resultIndex] = StakeInfo({
                    from: staker,
                    to: user,
                    amount: stake.amount,
                    timestamp: stake.timestamp,
                    status: stake.status,
                    matched: matched,
                    matchedAt: matchedAt
                });
                resultIndex++;
            }
        }
        
        return result;
    }

    /**
     * @notice Get all active (Pending or Matched) outgoing stakes
     * @param user The user address
     * @return Array of active StakeInfo structs
     */
    function getActiveOutgoingStakes(address user) external view returns (StakeInfo[] memory) {
        address[] memory targets = userStakedTo[user];
        
        // Count active stakes
        uint256 activeCount = 0;
        for (uint256 i = 0; i < targets.length; i++) {
            StakeStatus status = stakes[user][targets[i]].status;
            if (status == StakeStatus.Pending || status == StakeStatus.Matched) {
                activeCount++;
            }
        }
        
        // Build result array
        StakeInfo[] memory result = new StakeInfo[](activeCount);
        uint256 resultIndex = 0;
        
        for (uint256 i = 0; i < targets.length; i++) {
            address target = targets[i];
            Stake memory stake = stakes[user][target];
            
            if (stake.status == StakeStatus.Pending || stake.status == StakeStatus.Matched) {
                (bool matched, uint256 matchedAt, ) = isMatched(user, target);
                
                result[resultIndex] = StakeInfo({
                    from: user,
                    to: target,
                    amount: stake.amount,
                    timestamp: stake.timestamp,
                    status: stake.status,
                    matched: matched,
                    matchedAt: matchedAt
                });
                resultIndex++;
            }
        }
        
        return result;
    }

    /**
     * @notice Get stake status between two users
     * @param from Staker address
     * @param to Target address
     * @return status Current status
     * @return amount Stake amount
     * @return timestamp When stake was created
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
     * @param userA First user
     * @param userB Second user
     * @return matched True if matched
     * @return matchedAt Timestamp of match
     * @return released True if funds released
     */
    function isMatched(
        address userA,
        address userB
    ) public view returns (bool matched, uint256 matchedAt, bool released) {
        bytes32 matchId = _getMatchId(userA, userB);
        Match memory matchData = matches[matchId];

        if (matchData.userA == address(0)) {
            return (false, 0, false);
        }

        return (true, matchData.matchedAt, matchData.released);
    }

    /**
     * @notice Get count of incoming stakes
     * @param user The user address
     * @return count Number of incoming stakes
     */
    function getIncomingStakesCount(address user) external view returns (uint256) {
        return userStakedFrom[user].length;
    }

    /**
     * @notice Get count of outgoing stakes
     * @param user The user address
     * @return count Number of outgoing stakes
     */
    function getOutgoingStakesCount(address user) external view returns (uint256) {
        return userStakedTo[user].length;
    }

    // ============================================
    // INTERNAL FUNCTIONS
    // ============================================

    function _createMatch(address userA, address userB) internal {
        stakes[userA][userB].status = StakeStatus.Matched;
        stakes[userB][userA].status = StakeStatus.Matched;

        bytes32 matchId = _getMatchId(userA, userB);
        matches[matchId] = Match({
            userA: userA,
            userB: userB,
            matchedAt: block.timestamp,
            released: false
        });

        emit Matched(userA, userB, block.timestamp);
    }

    function _getMatchId(address userA, address userB) internal pure returns (bytes32) {
        (address addr1, address addr2) = userA < userB
            ? (userA, userB)
            : (userB, userA);
        return keccak256(abi.encodePacked(addr1, addr2));
    }
}
