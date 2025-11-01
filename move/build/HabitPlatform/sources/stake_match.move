/// Habit Platform - Mutual Staking on Aptos
/// 
/// This module implements a decentralized networking platform where users stake APT
/// to connect with each other. When both users stake for each other, they are matched
/// and can chat. Stakes can be refunded after 2 days if no match, or released after 7 days.
module habit::stake_match {
    use std::signer;
    use std::vector;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::event;

    // ========== ERROR CODES ==========
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_NO_STAKE_EXISTS: u64 = 3;
    const E_STAKE_ALREADY_EXISTS: u64 = 4;
    const E_INSUFFICIENT_BALANCE: u64 = 5;
    const E_REFUND_PERIOD_NOT_ELAPSED: u64 = 6;
    const E_RELEASE_PERIOD_NOT_ELAPSED: u64 = 7;
    const E_NOT_MATCHED: u64 = 8;
    const E_ALREADY_REFUNDED: u64 = 9;
    const E_ALREADY_RELEASED: u64 = 10;
    const E_INVALID_AMOUNT: u64 = 11;
    const E_UNAUTHORIZED: u64 = 12;

    // ========== CONSTANTS ==========
    const STAKE_AMOUNT: u64 = 10_000_000; // 0.1 APT (8 decimals)
    const REFUND_PERIOD: u64 = 172800; // 2 days in seconds
    const RELEASE_PERIOD: u64 = 604800; // 7 days in seconds
    const PLATFORM_FEE_BPS: u64 = 100; // 1% = 100 basis points
    const BPS_DIVISOR: u64 = 10000;

    // ========== STRUCTS ==========

    /// Status of a stake
    struct StakeStatus has store, copy, drop {
        pending: bool,
        matched: bool,
        refunded: bool,
        released: bool,
    }

    /// Individual stake record
    struct Stake has store, drop {
        staker: address,
        target: address,
        amount: u64,
        timestamp: u64,
        status: StakeStatus,
    }

    /// Global stake storage with escrow
    struct StakeRegistry has key {
        stakes: vector<Stake>,
        fee_wallet: address,
        escrow: coin::Coin<AptosCoin>,
    }

    /// Capability to manage the module (for admin functions)
    struct AdminCap has key {
        owner: address,
    }

    // ========== EVENTS ==========

    #[event]
    struct StakedEvent has drop, store {
        from: address,
        to: address,
        amount: u64,
        timestamp: u64,
    }

    #[event]
    struct MatchedEvent has drop, store {
        user_a: address,
        user_b: address,
        timestamp: u64,
    }

    #[event]
    struct RefundedEvent has drop, store {
        from: address,
        to: address,
        amount: u64,
        timestamp: u64,
    }

    #[event]
    struct ReleasedEvent has drop, store {
        user_a: address,
        user_b: address,
        amount: u64,
        timestamp: u64,
    }

    // ========== INITIALIZATION ==========

    /// Initialize the module (call this once after deployment)
    public entry fun initialize(admin: &signer, fee_wallet: address) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<StakeRegistry>(admin_addr), E_ALREADY_INITIALIZED);

        // Create stake registry with empty escrow
        move_to(admin, StakeRegistry {
            stakes: vector::empty<Stake>(),
            fee_wallet,
            escrow: coin::zero<AptosCoin>(),
        });

        // Create admin capability
        move_to(admin, AdminCap {
            owner: admin_addr,
        });
    }

    // ========== PUBLIC FUNCTIONS ==========

    /// Stake APT to connect with another user
    public entry fun stake_to_connect(
        staker: &signer,
        target: address,
        registry_address: address,
    ) acquires StakeRegistry {
        let staker_addr = signer::address_of(staker);
        assert!(exists<StakeRegistry>(registry_address), E_NOT_INITIALIZED);
        
        let registry = borrow_global_mut<StakeRegistry>(registry_address);
        
        // Check if stake already exists
        let existing_stake_index = find_stake(&registry.stakes, staker_addr, target);
        assert!(existing_stake_index == vector::length(&registry.stakes), E_STAKE_ALREADY_EXISTS);

        // Transfer stake amount to registry escrow
        let stake_coins = coin::withdraw<AptosCoin>(staker, STAKE_AMOUNT);
        coin::merge(&mut registry.escrow, stake_coins);

        // Create stake record
        let now = timestamp::now_seconds();
        let stake = Stake {
            staker: staker_addr,
            target,
            amount: STAKE_AMOUNT,
            timestamp: now,
            status: StakeStatus {
                pending: true,
                matched: false,
                refunded: false,
                released: false,
            },
        };

        vector::push_back(&mut registry.stakes, stake);

        // Emit event
        event::emit(StakedEvent {
            from: staker_addr,
            to: target,
            amount: STAKE_AMOUNT,
            timestamp: now,
        });

        // Check if mutual stake exists (match)
        let mutual_stake_index = find_stake(&registry.stakes, target, staker_addr);
        let stakes_len = vector::length(&registry.stakes);
        if (mutual_stake_index < stakes_len) {
            // Check if mutual stake is pending
            let mutual_stake = vector::borrow(&registry.stakes, mutual_stake_index);
            if (mutual_stake.status.pending && !mutual_stake.status.matched) {
                // Both users have staked - create match!
                // Update mutual stake first
                let mutual_stake_mut = vector::borrow_mut(&mut registry.stakes, mutual_stake_index);
                mutual_stake_mut.status.pending = false;
                mutual_stake_mut.status.matched = true;
                
                // Update this stake (last one)
                let this_stake_index = stakes_len - 1;
                let this_stake_mut = vector::borrow_mut(&mut registry.stakes, this_stake_index);
                this_stake_mut.status.pending = false;
                this_stake_mut.status.matched = true;

                // Emit match event
                event::emit(MatchedEvent {
                    user_a: staker_addr,
                    user_b: target,
                    timestamp: now,
                });
            };
        };
    }

    /// Refund stake if no mutual stake after refund period
    public entry fun refund_expired_stake(
        staker: &signer,
        target: address,
        registry_address: address,
    ) acquires StakeRegistry {
        let staker_addr = signer::address_of(staker);
        assert!(exists<StakeRegistry>(registry_address), E_NOT_INITIALIZED);
        
        let registry = borrow_global_mut<StakeRegistry>(registry_address);
        
        let stake_index = find_stake(&registry.stakes, staker_addr, target);
        assert!(stake_index < vector::length(&registry.stakes), E_NO_STAKE_EXISTS);
        
        let stake = vector::borrow_mut(&mut registry.stakes, stake_index);
        
        // Validations
        assert!(stake.status.pending && !stake.status.matched, E_NOT_MATCHED);
        assert!(!stake.status.refunded, E_ALREADY_REFUNDED);
        
        let now = timestamp::now_seconds();
        assert!(now >= stake.timestamp + REFUND_PERIOD, E_REFUND_PERIOD_NOT_ELAPSED);

        // Update status
        stake.status.pending = false;
        stake.status.refunded = true;

        // Transfer stake back from escrow
        let refund_coins = coin::extract(&mut registry.escrow, STAKE_AMOUNT);
        coin::deposit(staker_addr, refund_coins);

        // Emit event
        event::emit(RefundedEvent {
            from: staker_addr,
            to: target,
            amount: STAKE_AMOUNT,
            timestamp: now,
        });
    }

    /// Release matched stakes after release period (with platform fee)
    public entry fun release_stake_after_match(
        user: &signer,
        other_user: address,
        registry_address: address,
    ) acquires StakeRegistry {
        let user_addr = signer::address_of(user);
        assert!(exists<StakeRegistry>(registry_address), E_NOT_INITIALIZED);
        
        let registry = borrow_global_mut<StakeRegistry>(registry_address);
        
        // Find both stakes
        let stake1_index = find_stake(&registry.stakes, user_addr, other_user);
        let stake2_index = find_stake(&registry.stakes, other_user, user_addr);
        
        assert!(stake1_index < vector::length(&registry.stakes), E_NO_STAKE_EXISTS);
        assert!(stake2_index < vector::length(&registry.stakes), E_NO_STAKE_EXISTS);
        
        // Validate with immutable borrows first
        let stake1 = vector::borrow(&registry.stakes, stake1_index);
        let stake2 = vector::borrow(&registry.stakes, stake2_index);
        
        // Validations
        assert!(stake1.status.matched && stake2.status.matched, E_NOT_MATCHED);
        assert!(!stake1.status.released && !stake2.status.released, E_ALREADY_RELEASED);
        
        let now = timestamp::now_seconds();
        assert!(now >= stake1.timestamp + RELEASE_PERIOD, E_RELEASE_PERIOD_NOT_ELAPSED);

        // Calculate amounts (1% platform fee)
        let total_amount = STAKE_AMOUNT * 2;
        let fee = (total_amount * PLATFORM_FEE_BPS) / BPS_DIVISOR;
        let user_amount = (total_amount - fee) / 2;

        // Update statuses (mutable borrows sequentially)
        let stake1_mut = vector::borrow_mut(&mut registry.stakes, stake1_index);
        stake1_mut.status.released = true;
        
        let stake2_mut = vector::borrow_mut(&mut registry.stakes, stake2_index);
        stake2_mut.status.released = true;

        // Transfer to users (99% each) from escrow
        let user1_coins = coin::extract(&mut registry.escrow, user_amount);
        let user2_coins = coin::extract(&mut registry.escrow, user_amount);
        let fee_coins = coin::extract(&mut registry.escrow, fee);
        
        coin::deposit(user_addr, user1_coins);
        coin::deposit(other_user, user2_coins);
        coin::deposit(registry.fee_wallet, fee_coins);

        // Emit event
        event::emit(ReleasedEvent {
            user_a: user_addr,
            user_b: other_user,
            amount: user_amount,
            timestamp: now,
        });
    }

    // ========== VIEW FUNCTIONS ==========

    #[view]
    public fun get_stake_status(
        registry_address: address,
        staker: address,
        target: address,
    ): (bool, bool, bool, bool) acquires StakeRegistry {
        if (!exists<StakeRegistry>(registry_address)) {
            return (false, false, false, false)
        };
        
        let registry = borrow_global<StakeRegistry>(registry_address);
        let stake_index = find_stake(&registry.stakes, staker, target);
        
        if (stake_index >= vector::length(&registry.stakes)) {
            return (false, false, false, false)
        };
        
        let stake = vector::borrow(&registry.stakes, stake_index);
        (stake.status.pending, stake.status.matched, stake.status.refunded, stake.status.released)
    }

    #[view]
    public fun is_matched(
        registry_address: address,
        user_a: address,
        user_b: address,
    ): bool acquires StakeRegistry {
        if (!exists<StakeRegistry>(registry_address)) {
            return false
        };
        
        let registry = borrow_global<StakeRegistry>(registry_address);
        let stake1_index = find_stake(&registry.stakes, user_a, user_b);
        let stake2_index = find_stake(&registry.stakes, user_b, user_a);
        
        if (stake1_index >= vector::length(&registry.stakes) || 
            stake2_index >= vector::length(&registry.stakes)) {
            return false
        };
        
        let stake1 = vector::borrow(&registry.stakes, stake1_index);
        let stake2 = vector::borrow(&registry.stakes, stake2_index);
        
        stake1.status.matched && stake2.status.matched
    }

    #[view]
    public fun get_stake_amount(): u64 {
        STAKE_AMOUNT
    }

    // ========== HELPER FUNCTIONS ==========

    /// Find stake index in vector
    fun find_stake(stakes: &vector<Stake>, staker: address, target: address): u64 {
        let len = vector::length(stakes);
        let i = 0;
        
        while (i < len) {
            let stake = vector::borrow(stakes, i);
            if (stake.staker == staker && stake.target == target) {
                return i
            };
            i = i + 1;
        };
        
        len
    }

    // ========== TESTS ==========

    #[test_only]
    use aptos_framework::account::create_account_for_test;

    #[test(admin = @habit, user1 = @0x123, user2 = @0x456)]
    public fun test_stake_and_match(
        admin: &signer,
        user1: &signer,
        user2: &signer,
    ) acquires StakeRegistry {
        // Setup
        let admin_addr = signer::address_of(admin);
        let user1_addr = signer::address_of(user1);
        let user2_addr = signer::address_of(user2);
        
        create_account_for_test(admin_addr);
        create_account_for_test(user1_addr);
        create_account_for_test(user2_addr);
        
        // Initialize
        initialize(admin, admin_addr);
        
        // Both users stake
        stake_to_connect(user1, user2_addr, admin_addr);
        stake_to_connect(user2, user1_addr, admin_addr);
        
        // Should be matched
        assert!(is_matched(admin_addr, user1_addr, user2_addr), 0);
    }
}
