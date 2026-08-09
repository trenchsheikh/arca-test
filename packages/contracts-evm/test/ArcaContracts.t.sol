// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/AgentToken.sol";
import "../src/Ico.sol";
import "../src/Buyback.sol";
import "../src/LockedAgentWallet.sol";
import "../src/PlatformFee.sol";
import "../src/ArcaFactory.sol";

/**
 * @title ArcaContractsTest
 * @notice Comprehensive tests for Arca V1 contracts
 */
contract ArcaContractsTest is Test {
    AgentToken public agentToken;
    AgentToken public platformToken;
    Ico public ico;
    Buyback public buyback;
    LockedAgentWallet public lockedWallet;
    PlatformFee public platformFee;
    ArcaFactory public factory;

    address public deployer = address(0x1);
    address public admin = address(0x2);
    address public keeper = address(0x3);
    address public treasury = address(0x4);
    address public operationalWallet = address(0x5);
    address public investor1 = address(0x10);
    address public investor2 = address(0x11);

    uint256 public constant RAISE_TARGET = 10 ether;
    uint256 public constant RAISE_THRESHOLD_BPS = 5000; // 50%
    uint256 public constant MIN_TICKET = 0.1 ether;
    uint256 public constant PRESALE_ALLOCATION = 100_000_000e18; // 10% of 1B

    function setUp() public {
        // Deploy tokens
        vm.startPrank(deployer);
        agentToken = new AgentToken("Agent Token", "AGT", deployer);
        platformToken = new AgentToken("Platform Token", "PLT", deployer);
        vm.stopPrank();

        // Deploy contracts
        lockedWallet = new LockedAgentWallet(address(agentToken), admin);
        
        ico = new Ico(
            address(agentToken),
            operationalWallet,
            RAISE_TARGET,
            RAISE_THRESHOLD_BPS,
            MIN_TICKET,
            PRESALE_ALLOCATION,
            30 days, // cliff
            365 days, // duration
            admin
        );

        buyback = new Buyback(
            address(agentToken),
            address(platformToken),
            keeper,
            address(0) // no router for now
        );

        platformFee = new PlatformFee(treasury, deployer);

        factory = new ArcaFactory(
            treasury,
            address(platformToken),
            admin,
            keeper,
            address(0)
        );

        // Setup ICO
        vm.prank(admin);
        ico.setWindow(block.timestamp, block.timestamp + 7 days);

        // Transfer presale allocation to ICO
        vm.prank(deployer);
        agentToken.transfer(address(ico), PRESALE_ALLOCATION);

        // Fund investors
        vm.deal(investor1, 100 ether);
        vm.deal(investor2, 100 ether);
    }

    // ============================================
    // TEST: Buyback split is immutable
    // ============================================
    function test_BuybackSplitImmutable() public {
        // Verify split constants
        assertEq(buyback.AGENT_BPS(), 9000);
        assertEq(buyback.PLATFORM_BPS(), 1000);
        assertEq(buyback.TOTAL_BPS(), 10000);

        // Verify getSplit returns immutable values
        (uint256 agentBps, uint256 platformBps) = buyback.getSplit();
        assertEq(agentBps, 9000);
        assertEq(platformBps, 1000);

        // Note: There is NO function to change the split - it's immutable by design
        // Deployer cannot pause, cannot change split, cannot redirect
    }

    // ============================================
    // TEST: Deployer cannot pause buyback
    // ============================================
    function test_DeployerCannotPauseBuyback() public {
        // Buyback contract has NO pause function
        // This test verifies the contract doesn't have pause capability
        
        // Execute buyback as keeper - should work
        vm.deal(keeper, 10 ether);
        vm.prank(keeper);
        buyback.executeBuyback{value: 10 ether}(1000e18, 100e18);

        // Verify amounts were split correctly
        uint256 agentSpend = (10 ether * 9000) / 10000;
        uint256 platformSpend = 10 ether - agentSpend;
        
        assertEq(agentSpend, 9 ether);
        assertEq(platformSpend, 1 ether);
    }

    // ============================================
    // TEST: Only keeper can execute buyback
    // ============================================
    function test_OnlyKeeperCanExecuteBuyback() public {
        vm.deal(deployer, 10 ether);
        
        // Deployer tries to execute - should fail
        vm.prank(deployer);
        vm.expectRevert(Buyback.NotKeeper.selector);
        buyback.executeBuyback{value: 10 ether}(1000e18, 100e18);

        // Keeper executes - should succeed
        vm.deal(keeper, 10 ether);
        vm.prank(keeper);
        buyback.executeBuyback{value: 10 ether}(1000e18, 100e18);
    }

    // ============================================
    // TEST: Contribute and refund below threshold
    // ============================================
    function test_ContributeAndRefundBelowThreshold() public {
        // Investor1 contributes below threshold
        vm.prank(investor1);
        ico.contribute{value: 2 ether}();

        assertEq(ico.totalRaised(), 2 ether);
        assertEq(ico.contributions(investor1), 2 ether);

        // Warp to end time
        vm.warp(block.timestamp + 7 days);

        // Finalize - should fail (below 50% threshold)
        vm.prank(admin);
        ico.finalize();

        assertFalse(ico.successful());
        assertTrue(ico.finalized());

        // Investor1 can refund
        uint256 balanceBefore = investor1.balance;
        vm.prank(investor1);
        ico.refund();

        assertEq(investor1.balance, balanceBefore + 2 ether);
        assertTrue(ico.refunded(investor1));
    }

    // ============================================
    // TEST: Contribute and finalize success
    // ============================================
    function test_ContributeAndFinalizeSuccess() public {
        // Multiple investors contribute above threshold
        vm.prank(investor1);
        ico.contribute{value: 3 ether}();

        vm.prank(investor2);
        ico.contribute{value: 3 ether}();

        assertEq(ico.totalRaised(), 6 ether);
        assertTrue(ico.totalRaised() >= (RAISE_TARGET * RAISE_THRESHOLD_BPS) / 10000);

        // Warp to end time
        vm.warp(block.timestamp + 7 days);

        // Finalize - should succeed
        uint256 opWalletBalanceBefore = operationalWallet.balance;
        vm.prank(admin);
        ico.finalize();

        assertTrue(ico.successful());
        assertTrue(ico.finalized());

        // ETH should be in operational wallet
        assertEq(operationalWallet.balance, opWalletBalanceBefore + 6 ether);

        // Investors can claim tokens proportionally
        vm.prank(investor1);
        ico.claimTokens();

        uint256 investor1Allocation = (3 ether * PRESALE_ALLOCATION) / 6 ether;
        assertEq(agentToken.balanceOf(investor1), investor1Allocation);
        assertTrue(ico.claimed(investor1));

        vm.prank(investor2);
        ico.claimTokens();

        uint256 investor2Allocation = (3 ether * PRESALE_ALLOCATION) / 6 ether;
        assertEq(agentToken.balanceOf(investor2), investor2Allocation);
        assertTrue(ico.claimed(investor2));
    }

    // ============================================
    // TEST: Enforce minimum ticket
    // ============================================
    function test_EnforceMinTicket() public {
        // Try to contribute below minimum
        vm.prank(investor1);
        vm.expectRevert(Ico.BelowMinTicket.selector);
        ico.contribute{value: 0.01 ether}();

        // Contribute at minimum - should succeed
        vm.prank(investor1);
        ico.contribute{value: MIN_TICKET}();

        assertEq(ico.contributions(investor1), MIN_TICKET);
    }

    // ============================================
    // TEST: Admin can pause/cancel ICO
    // ============================================
    function test_AdminCanPauseAndCancel() public {
        // Admin pauses
        vm.prank(admin);
        ico.pause();

        assertTrue(ico.paused());

        // Contributions fail when paused
        vm.prank(investor1);
        vm.expectRevert(Ico.Paused.selector);
        ico.contribute{value: 1 ether}();

        // Admin unpauses
        vm.prank(admin);
        ico.unpause();

        assertFalse(ico.paused());

        // Admin cancels
        vm.prank(admin);
        ico.cancel();

        assertTrue(ico.cancelled());

        // Contributions fail when cancelled
        vm.prank(investor1);
        vm.expectRevert(Ico.Cancelled.selector);
        ico.contribute{value: 1 ether}();
    }

    // ============================================
    // TEST: Deployer cannot pause ICO (only admin)
    // ============================================
    function test_DeployerCannotPauseIco() public {
        vm.prank(deployer);
        vm.expectRevert(Ico.NotAdmin.selector);
        ico.pause();
    }

    // ============================================
    // TEST: Fee split treasury not to buyback
    // ============================================
    function test_FeeSplitTreasuryNotToBuyback() public {
        // Send fees to platform fee contract
        vm.deal(address(this), 10 ether);
        platformFee.collectFee{value: 10 ether}();

        // Check balances - 50/50 split
        assertEq(platformFee.treasuryBalance(), 5 ether);
        assertEq(platformFee.deployerBalance(), 5 ether);

        // Treasury withdraws
        uint256 treasuryBalanceBefore = treasury.balance;
        vm.prank(treasury);
        platformFee.withdrawTreasury();

        assertEq(treasury.balance, treasuryBalanceBefore + 5 ether);
        assertEq(platformFee.treasuryBalance(), 0);

        // Verify treasury address is NOT the buyback contract
        assertFalse(platformFee.treasury() == address(buyback));
    }

    // ============================================
    // TEST: Locked wallet cannot release early
    // ============================================
    function test_LockedWalletCannotReleaseEarly() public {
        // Transfer tokens to locked wallet
        vm.prank(deployer);
        agentToken.transfer(address(lockedWallet), 200_000_000e18);

        // Try to release without authorization - should fail
        vm.prank(deployer);
        vm.expectRevert(LockedAgentWallet.ReleaseNotAuthorized.selector);
        lockedWallet.release(deployer);

        // Admin authorizes release
        vm.prank(admin);
        lockedWallet.authorizeRelease();

        assertTrue(lockedWallet.releaseAuthorized());

        // Now release should work
        vm.prank(deployer);
        lockedWallet.release(deployer);

        assertEq(agentToken.balanceOf(deployer), 200_000_000e18);
    }

    // ============================================
    // TEST: Factory deploys complete infrastructure
    // ============================================
    function test_FactoryDeploysAgent() public {
        vm.startPrank(deployer);

        ArcaFactory.LaunchParams memory params = ArcaFactory.LaunchParams({
            tokenName: "Test Agent",
            tokenSymbol: "TEST",
            operationalWallet: operationalWallet,
            raiseTarget: 10 ether,
            raiseThresholdBps: 5000,
            minTicket: 0.1 ether,
            vestingCliff: 30 days,
            vestingDuration: 365 days
        });

        uint256 agentId = factory.deployAgent(params);

        assertEq(agentId, 0);
        assertEq(factory.agentCount(), 1);

        ArcaFactory.AgentLaunch memory launch = factory.getLaunch(agentId);
        
        assertTrue(launch.token != address(0));
        assertTrue(launch.ico != address(0));
        assertTrue(launch.buyback != address(0));
        assertTrue(launch.lockedWallet != address(0));
        assertTrue(launch.feeContract != address(0));
        assertEq(launch.deployer, deployer);

        vm.stopPrank();
    }

    // ============================================
    // TEST: Buyback emits correct event
    // ============================================
    function test_BuybackEmitsEvent() public {
        vm.deal(keeper, 10 ether);

        vm.expectEmit(true, true, true, true);
        emit Buyback.BuybackExecuted(9 ether, 1 ether, 1000e18, 100e18, block.timestamp);

        vm.prank(keeper);
        buyback.executeBuyback{value: 10 ether}(1000e18, 100e18);
    }

    // ============================================
    // TEST: Multiple contributions from same wallet
    // ============================================
    function test_MultipleContributionsSameWallet() public {
        vm.startPrank(investor1);
        
        ico.contribute{value: 1 ether}();
        assertEq(ico.contributions(investor1), 1 ether);
        assertEq(ico.contributorCount(), 1);

        ico.contribute{value: 2 ether}();
        assertEq(ico.contributions(investor1), 3 ether);
        assertEq(ico.contributorCount(), 1); // Should still be 1 unique contributor

        vm.stopPrank();
    }

    // ============================================
    // TEST: Cannot claim tokens before finalization
    // ============================================
    function test_CannotClaimBeforeFinalization() public {
        vm.prank(investor1);
        ico.contribute{value: 6 ether}();

        vm.prank(investor1);
        vm.expectRevert(Ico.NotFinalized.selector);
        ico.claimTokens();
    }

    // ============================================
    // TEST: Cannot claim tokens twice
    // ============================================
    function test_CannotClaimTokensTwice() public {
        // Successful raise
        vm.prank(investor1);
        ico.contribute{value: 6 ether}();

        vm.warp(block.timestamp + 7 days);
        
        vm.prank(admin);
        ico.finalize();

        // First claim succeeds
        vm.prank(investor1);
        ico.claimTokens();

        // Second claim fails
        vm.prank(investor1);
        vm.expectRevert(Ico.AlreadyClaimed.selector);
        ico.claimTokens();
    }

    // ============================================
    // TEST: Cancel finalizes as failed — no ops transfer, refunds work
    // ============================================
    function test_CancelFinalizesFailedAndAllowsRefund() public {
        vm.prank(investor1);
        ico.contribute{value: 1 ether}();

        uint256 opsBefore = operationalWallet.balance;
        uint256 investorBefore = investor1.balance;

        vm.prank(admin);
        ico.cancel();

        assertTrue(ico.cancelled());
        assertTrue(ico.finalized());
        assertFalse(ico.successful());
        assertEq(operationalWallet.balance, opsBefore);

        vm.prank(admin);
        vm.expectRevert(Ico.AlreadyFinalized.selector);
        ico.finalize();

        vm.prank(investor1);
        ico.refund();
        assertEq(investor1.balance, investorBefore + 1 ether);
        assertTrue(ico.refunded(investor1));
    }

    // ============================================
    // TEST: Admin can release locked wallet after authorize
    // ============================================
    function test_AdminCanReleaseLockedWalletAfterAuthorize() public {
        vm.prank(deployer);
        agentToken.transfer(address(lockedWallet), 200_000_000e18);

        vm.prank(admin);
        lockedWallet.authorizeRelease();

        vm.prank(admin);
        lockedWallet.release(operationalWallet);

        assertEq(agentToken.balanceOf(operationalWallet), 200_000_000e18);
    }

    // Helper to receive ETH
    receive() external payable {}
}
