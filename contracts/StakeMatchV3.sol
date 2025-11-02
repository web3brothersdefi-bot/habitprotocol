// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StakeMatchV3 - Fully On-Chain with IPFS
 * @notice Users stored on-chain, images on IPFS, only chat on Supabase
 * @dev Complete decentralized solution
 */
contract StakeMatchV3 is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice User profile stored on-chain
    struct UserProfile {
        string name;
        string role;            // "builder", "investor", "advisor"
        string bio;
        string imageIPFS;       // IPFS hash for profile image
        string[] skills;        // Array of skills
        string company;
        string twitter;
        string linkedin;
        uint256 registeredAt;
        bool exists;
    }

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
        uint256 amount;
        uint256 timestamp;
        StakeStatus status;
    }

    /// @notice Match information
    struct Match {
        address userA;
        address userB;
        uint256 matchedAt;
        bool released;
    }

    /// @notice Complete stake info for frontend
    struct StakeInfo {
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
        StakeStatus status;
        bool matched;
        uint256 matchedAt;
        UserProfile fromProfile;    // Include full profile
        UserProfile toProfile;      // Include full profile
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
    mapping(address => UserProfile) public users;
    mapping(address => mapping(address => Stake)) public stakes;
    mapping(bytes32 => Match) public matches;
    
    /// @notice Track all users and stakes
    address[] public allUsers;
    mapping(address => address[]) private userStakedTo;
    mapping(address => address[]) private userStakedFrom;
    mapping(address => uint256) private userIndex;

    /// @notice Events
    event UserRegistered(
        address indexed user,
        string name,
        string role,
        uint256 timestamp
    );

    event UserUpdated(
        address indexed user,
        string name,
        string imageIPFS
    );

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
    error UserAlreadyExists();
    error UserDoesNotExist();
    error InvalidName();
    error InvalidRole();
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
    error TargetNotRegistered();

    constructor() {}

    // ============================================
    // USER MANAGEMENT
    // ============================================

    /**
     * @notice Register a new user
     * @param name User's name
     * @param role User's role (builder/investor/advisor)
     * @param bio User's bio
     * @param imageIPFS IPFS hash for profile image
     * @param skills Array of skills
     * @param company Company name
     * @param twitter Twitter handle
     * @param linkedin LinkedIn URL
     */
    function registerUser(
        string memory name,
        string memory role,
        string memory bio,
        string memory imageIPFS,
        string[] memory skills,
        string memory company,
        string memory twitter,
        string memory linkedin
    ) external {
        if (users[msg.sender].exists) revert UserAlreadyExists();
        if (bytes(name).length == 0) revert InvalidName();
        if (bytes(role).length == 0) revert InvalidRole();

        users[msg.sender] = UserProfile({
            name: name,
            role: role,
            bio: bio,
            imageIPFS: imageIPFS,
            skills: skills,
            company: company,
            twitter: twitter,
            linkedin: linkedin,
            registeredAt: block.timestamp,
            exists: true
        });

        userIndex[msg.sender] = allUsers.length;
        allUsers.push(msg.sender);

        emit UserRegistered(msg.sender, name, role, block.timestamp);
    }

    /**
     * @notice Update user profile
     * @param name New name
     * @param bio New bio
     * @param imageIPFS New IPFS hash
     * @param skills New skills array
     * @param company New company
     * @param twitter New twitter
     * @param linkedin New linkedin
     */
    function updateProfile(
        string memory name,
        string memory bio,
        string memory imageIPFS,
        string[] memory skills,
        string memory company,
        string memory twitter,
        string memory linkedin
    ) external {
        if (!users[msg.sender].exists) revert UserDoesNotExist();
        if (bytes(name).length == 0) revert InvalidName();

        UserProfile storage user = users[msg.sender];
        user.name = name;
        user.bio = bio;
        user.imageIPFS = imageIPFS;
        user.skills = skills;
        user.company = company;
        user.twitter = twitter;
        user.linkedin = linkedin;

        emit UserUpdated(msg.sender, name, imageIPFS);
    }

    // ============================================
    // STAKING FUNCTIONS
    // ============================================

    /**
     * @notice Stake USDC to connect with another user
     * @param target The address to connect with
     */
    function stakeToConnect(address target) external nonReentrant {
        if (target == address(0)) revert ZeroAddress();
        if (target == msg.sender) revert CannotStakeToSelf();
        if (!users[msg.sender].exists) revert UserDoesNotExist();
        if (!users[target].exists) revert TargetNotRegistered();
        if (stakes[msg.sender][target].status != StakeStatus.None) {
            revert StakeAlreadyExists();
        }

        USDC.safeTransferFrom(msg.sender, address(this), STAKE_AMOUNT);

        stakes[msg.sender][target] = Stake({
            amount: STAKE_AMOUNT,
            timestamp: block.timestamp,
            status: StakeStatus.Pending
        });

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
    // GETTER FUNCTIONS - OPTIMIZED FOR FRONTEND
    // ============================================

    /**
     * @notice Get all registered users
     * @return Array of user addresses
     */
    function getAllUsers() external view returns (address[] memory) {
        return allUsers;
    }

    /**
     * @notice Get all users with their profiles
     * @return profiles Array of UserProfile structs
     * @return addresses Array of user addresses
     */
    function getAllUsersWithProfiles() external view returns (
        UserProfile[] memory profiles,
        address[] memory addresses
    ) {
        uint256 length = allUsers.length;
        profiles = new UserProfile[](length);
        addresses = new address[](length);

        for (uint256 i = 0; i < length; i++) {
            addresses[i] = allUsers[i];
            profiles[i] = users[allUsers[i]];
        }

        return (profiles, addresses);
    }

    /**
     * @notice Get users by role
     * @param role The role to filter by
     * @return profiles Array of matching profiles
     * @return addresses Array of matching addresses
     */
    function getUsersByRole(string memory role) external view returns (
        UserProfile[] memory profiles,
        address[] memory addresses
    ) {
        // Count matching users
        uint256 count = 0;
        for (uint256 i = 0; i < allUsers.length; i++) {
            if (keccak256(bytes(users[allUsers[i]].role)) == keccak256(bytes(role))) {
                count++;
            }
        }

        // Build result arrays
        profiles = new UserProfile[](count);
        addresses = new address[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < allUsers.length; i++) {
            address userAddr = allUsers[i];
            if (keccak256(bytes(users[userAddr].role)) == keccak256(bytes(role))) {
                addresses[index] = userAddr;
                profiles[index] = users[userAddr];
                index++;
            }
        }

        return (profiles, addresses);
    }

    /**
     * @notice Get user profile
     * @param user User address
     * @return UserProfile struct
     */
    function getUserProfile(address user) external view returns (UserProfile memory) {
        return users[user];
    }

    /**
     * @notice Get active incoming stakes with full profiles
     * @param user The user address
     * @return Array of StakeInfo with profiles
     */
    function getActiveIncomingStakes(address user) external view returns (StakeInfo[] memory) {
        address[] memory stakers = userStakedFrom[user];
        
        // Count active
        uint256 activeCount = 0;
        for (uint256 i = 0; i < stakers.length; i++) {
            StakeStatus status = stakes[stakers[i]][user].status;
            if (status == StakeStatus.Pending || status == StakeStatus.Matched) {
                activeCount++;
            }
        }
        
        // Build result
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
                    matchedAt: matchedAt,
                    fromProfile: users[staker],
                    toProfile: users[user]
                });
                resultIndex++;
            }
        }
        
        return result;
    }

    /**
     * @notice Get active outgoing stakes with full profiles
     * @param user The user address
     * @return Array of StakeInfo with profiles
     */
    function getActiveOutgoingStakes(address user) external view returns (StakeInfo[] memory) {
        address[] memory targets = userStakedTo[user];
        
        // Count active
        uint256 activeCount = 0;
        for (uint256 i = 0; i < targets.length; i++) {
            StakeStatus status = stakes[user][targets[i]].status;
            if (status == StakeStatus.Pending || status == StakeStatus.Matched) {
                activeCount++;
            }
        }
        
        // Build result
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
                    matchedAt: matchedAt,
                    fromProfile: users[user],
                    toProfile: users[target]
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
     * @notice Get total number of registered users
     * @return count Total users
     */
    function getUserCount() external view returns (uint256) {
        return allUsers.length;
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
