// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./AgentToken.sol";
import "./Ico.sol";
import "./Buyback.sol";
import "./LockedAgentWallet.sol";
import "./PlatformFee.sol";
import "./vendor/Ownable.sol";

/**
 * @title ArcaFactory
 * @notice Orchestrates deployment of all agent launch components
 * @dev Deploys and wires: token, ICO, buyback, locked wallet, fee splitter
 */
contract ArcaFactory is Ownable {
    /// @notice Platform treasury address
    address public treasury;

    /// @notice Platform token address
    address public platformToken;

    /// @notice Platform admin (multisig)
    address public platformAdmin;

    /// @notice Platform keeper for buybacks
    address public keeper;

    /// @notice Swap router for DEX integration
    address public swapRouter;

    /// @notice Counter for deployed agents
    uint256 public agentCount;

    struct AgentLaunch {
        address token;
        address ico;
        address buyback;
        address lockedWallet;
        address feeContract;
        address deployer;
        uint256 launchTime;
    }

    /// @notice Mapping of agent ID to launch addresses
    mapping(uint256 => AgentLaunch) public launches;

    /// @notice Mapping of token address to agent ID
    mapping(address => uint256) public tokenToAgentId;

    event AgentLaunched(
        uint256 indexed agentId,
        address indexed deployer,
        address token,
        address ico,
        address buyback,
        address lockedWallet,
        address feeContract
    );

    event TreasuryUpdated(address indexed previousTreasury, address indexed newTreasury);
    event PlatformTokenUpdated(address indexed previousToken, address indexed newToken);
    event KeeperUpdated(address indexed previousKeeper, address indexed newKeeper);
    event SwapRouterUpdated(address indexed previousRouter, address indexed newRouter);

    error ZeroAddress();

    /**
     * @notice Creates a new factory
     * @param treasury_ Platform treasury address
     * @param platformToken_ Platform token address
     * @param platformAdmin_ Platform admin (multisig)
     * @param keeper_ Platform keeper
     * @param swapRouter_ Swap router address
     */
    constructor(
        address treasury_,
        address platformToken_,
        address platformAdmin_,
        address keeper_,
        address swapRouter_
    ) Ownable(msg.sender) {
        if (
            treasury_ == address(0) ||
            platformToken_ == address(0) ||
            platformAdmin_ == address(0) ||
            keeper_ == address(0)
        ) {
            revert ZeroAddress();
        }

        treasury = treasury_;
        platformToken = platformToken_;
        platformAdmin = platformAdmin_;
        keeper = keeper_;
        swapRouter = swapRouter_;
    }

    struct LaunchParams {
        string tokenName;
        string tokenSymbol;
        address operationalWallet;
        uint256 raiseTarget;
        uint256 raiseThresholdBps;
        uint256 minTicket;
        uint256 vestingCliff;
        uint256 vestingDuration;
    }

    /**
     * @notice Deploy complete agent launch infrastructure
     * @param params Launch parameters
     * @return agentId ID of the launched agent
     */
    function deployAgent(LaunchParams calldata params) external returns (uint256 agentId) {
        if (params.operationalWallet == address(0)) revert ZeroAddress();

        agentId = agentCount++;

        // 1. Deploy AgentToken with 1B supply
        AgentToken token = new AgentToken(
            params.tokenName,
            params.tokenSymbol,
            address(this) // Factory holds tokens initially
        );

        // Token allocations (1B total):
        // - 50% (500M) to open market/LP
        // - 20% (200M) to locked agent wallet
        // - 20% (200M) to deployer (vesting)
        // - 10% (100M) to presale participants

        uint256 totalSupply = AgentToken(address(token)).TOTAL_SUPPLY();
        uint256 presaleAllocation = totalSupply / 10; // 10%
        uint256 lockedAllocation = (totalSupply * 20) / 100; // 20%
        uint256 deployerAllocation = (totalSupply * 20) / 100; // 20%
        uint256 openMarketAllocation = totalSupply - presaleAllocation - lockedAllocation - deployerAllocation; // 50%

        // 2. Deploy LockedAgentWallet for 20% locked supply
        LockedAgentWallet lockedWallet = new LockedAgentWallet(
            address(token),
            platformAdmin
        );
        // Platform admin (multisig) owns release execution after authorizeRelease
        lockedWallet.transferOwnership(platformAdmin);

        // 3. Deploy ICO contract
        Ico ico = new Ico(
            address(token),
            params.operationalWallet,
            params.raiseTarget,
            params.raiseThresholdBps,
            params.minTicket,
            presaleAllocation,
            params.vestingCliff,
            params.vestingDuration,
            platformAdmin
        );

        // 4. Deploy Buyback contract with IMMUTABLE 90/10 split
        Buyback buyback = new Buyback(
            address(token),
            platformToken,
            keeper,
            swapRouter
        );

        // 5. Deploy PlatformFee contract
        PlatformFee feeContract = new PlatformFee(
            treasury,
            msg.sender // deployer gets 50% of fees
        );

        // 6. Distribute tokens
        token.transfer(address(ico), presaleAllocation); // 10% to ICO
        token.transfer(address(lockedWallet), lockedAllocation); // 20% to locked wallet
        token.transfer(msg.sender, deployerAllocation); // 20% to deployer (handle vesting separately)
        // 50% remains in factory for LP seeding (handle externally)

        // 7. Store launch info
        launches[agentId] = AgentLaunch({
            token: address(token),
            ico: address(ico),
            buyback: address(buyback),
            lockedWallet: address(lockedWallet),
            feeContract: address(feeContract),
            deployer: msg.sender,
            launchTime: block.timestamp
        });

        tokenToAgentId[address(token)] = agentId;

        emit AgentLaunched(
            agentId,
            msg.sender,
            address(token),
            address(ico),
            address(buyback),
            address(lockedWallet),
            address(feeContract)
        );

        return agentId;
    }

    /**
     * @notice Get launch info by agent ID
     * @param agentId Agent ID
     */
    function getLaunch(uint256 agentId) external view returns (AgentLaunch memory) {
        return launches[agentId];
    }

    /**
     * @notice Get agent ID by token address
     * @param token Token address
     */
    function getAgentIdByToken(address token) external view returns (uint256) {
        return tokenToAgentId[token];
    }

    /**
     * @notice Withdraw remaining open market tokens for LP seeding
     * @param agentId Agent ID
     * @param to Address to receive tokens
     */
    function withdrawOpenMarketTokens(uint256 agentId, address to) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        
        AgentLaunch memory launch = launches[agentId];
        require(launch.token != address(0), "ArcaFactory: invalid agent");

        AgentToken token = AgentToken(launch.token);
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "ArcaFactory: no tokens");

        token.transfer(to, balance);
    }

    /**
     * @notice Update treasury address
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        address previous = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(previous, newTreasury);
    }

    /**
     * @notice Update platform token
     */
    function updatePlatformToken(address newToken) external onlyOwner {
        if (newToken == address(0)) revert ZeroAddress();
        address previous = platformToken;
        platformToken = newToken;
        emit PlatformTokenUpdated(previous, newToken);
    }

    /**
     * @notice Update keeper
     */
    function updateKeeper(address newKeeper) external onlyOwner {
        if (newKeeper == address(0)) revert ZeroAddress();
        address previous = keeper;
        keeper = newKeeper;
        emit KeeperUpdated(previous, newKeeper);
    }

    /**
     * @notice Update swap router
     */
    function updateSwapRouter(address newRouter) external onlyOwner {
        if (newRouter == address(0)) revert ZeroAddress();
        address previous = swapRouter;
        swapRouter = newRouter;
        emit SwapRouterUpdated(previous, newRouter);
    }
}
