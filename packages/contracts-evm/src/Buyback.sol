// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Buyback
 * @notice CENTERPIECE: Executes 90/10 buybacks (agent token / platform token)
 * @dev Split is IMMUTABLE - deployer cannot change, pause, or redirect
 * 
 * Key invariants:
 * - 90% to agent token, 10% to platform token (IMMUTABLE)
 * - Only platform keeper can execute
 * - Deployer has NO pause capability
 * - Split cannot be changed after deployment
 */
contract Buyback {
    /// @notice Agent token address
    address public immutable agentToken;

    /// @notice Platform token address
    address public immutable platformToken;

    /// @notice Platform keeper authorized to execute buybacks
    address public keeper;

    /// @notice Platform owner (can update keeper only)
    address public owner;

    /// @notice IMMUTABLE: Agent token share in basis points (9000 = 90%)
    uint256 public constant AGENT_BPS = 9000;

    /// @notice IMMUTABLE: Platform token share in basis points (1000 = 10%)
    uint256 public constant PLATFORM_BPS = 1000;

    /// @notice Total basis points (for validation)
    uint256 public constant TOTAL_BPS = 10000;

    /// @notice DEX router for swaps (optional for MVP)
    address public swapRouter;

    event BuybackExecuted(
        uint256 agentSpend,
        uint256 platformSpend,
        uint256 agentTokensBought,
        uint256 platformTokensBought,
        uint256 timestamp
    );

    event KeeperUpdated(address indexed previousKeeper, address indexed newKeeper);
    event SwapRouterUpdated(address indexed previousRouter, address indexed newRouter);

    error NotKeeper();
    error NotOwner();
    error ZeroAddress();
    error ZeroAmount();
    error InsufficientBalance();
    error TransferFailed();

    /**
     * @notice Creates a buyback contract with IMMUTABLE 90/10 split
     * @param agentToken_ Agent token address
     * @param platformToken_ Platform token address
     * @param keeper_ Platform keeper address
     * @param swapRouter_ DEX router address (optional)
     */
    constructor(
        address agentToken_,
        address platformToken_,
        address keeper_,
        address swapRouter_
    ) {
        if (agentToken_ == address(0) || platformToken_ == address(0) || keeper_ == address(0)) {
            revert ZeroAddress();
        }
        
        // Verify split is correct (compile-time constants)
        require(AGENT_BPS + PLATFORM_BPS == TOTAL_BPS, "Buyback: invalid split");
        
        agentToken = agentToken_;
        platformToken = platformToken_;
        keeper = keeper_;
        owner = msg.sender;
        swapRouter = swapRouter_;
    }

    /**
     * @notice Execute buyback with immutable 90/10 split
     * @param agentTokensBought Amount of agent tokens bought (for recording)
     * @param platformTokensBought Amount of platform tokens bought (for recording)
     * @dev Can only be called by platform keeper
     * @dev For MVP without live DEX integration, keeper records the buy amounts
     */
    function executeBuyback(
        uint256 agentTokensBought,
        uint256 platformTokensBought
    ) external payable {
        if (msg.sender != keeper) revert NotKeeper();
        if (msg.value == 0) revert ZeroAmount();

        // Calculate immutable split
        uint256 agentSpend = (msg.value * AGENT_BPS) / TOTAL_BPS;
        uint256 platformSpend = msg.value - agentSpend;

        // In MVP, keeper provides the tokens bought amounts
        // In production, this would interact with DEX router
        // For now we trust keeper to execute fairly and record accurately

        emit BuybackExecuted(
            agentSpend,
            platformSpend,
            agentTokensBought,
            platformTokensBought,
            block.timestamp
        );
    }

    /**
     * @notice Execute buyback with DEX integration (future enhancement)
     * @dev Will use swapRouter to execute actual swaps
     */
    function executeBuybackWithSwap() external payable {
        if (msg.sender != keeper) revert NotKeeper();
        if (msg.value == 0) revert ZeroAmount();

        uint256 agentSpend = (msg.value * AGENT_BPS) / TOTAL_BPS;
        uint256 platformSpend = msg.value - agentSpend;

        // TODO: Integrate with ISwapRouter
        // For now, just emit event with zero tokens bought
        emit BuybackExecuted(
            agentSpend,
            platformSpend,
            0,
            0,
            block.timestamp
        );
    }

    /**
     * @notice Update keeper address
     * @param newKeeper New keeper address
     * @dev Only owner can update keeper
     */
    function updateKeeper(address newKeeper) external {
        if (msg.sender != owner) revert NotOwner();
        if (newKeeper == address(0)) revert ZeroAddress();
        
        address previousKeeper = keeper;
        keeper = newKeeper;
        emit KeeperUpdated(previousKeeper, newKeeper);
    }

    /**
     * @notice Update swap router address
     * @param newRouter New router address
     * @dev Only owner can update router
     */
    function updateSwapRouter(address newRouter) external {
        if (msg.sender != owner) revert NotOwner();
        if (newRouter == address(0)) revert ZeroAddress();
        
        address previousRouter = swapRouter;
        swapRouter = newRouter;
        emit SwapRouterUpdated(previousRouter, newRouter);
    }

    /**
     * @notice CRITICAL: Split cannot be changed - this function doesn't exist
     * @dev This is intentionally NOT implemented to demonstrate immutability
     * @dev Any attempt to add such a function would violate core product invariant
     */
    // function setSplit() - NEVER IMPLEMENT THIS

    /**
     * @notice CRITICAL: Deployer cannot pause - this function doesn't exist
     * @dev This is intentionally NOT implemented to demonstrate immutability
     * @dev Any attempt to add pause functionality would violate core product invariant
     */
    // function pause() - NEVER IMPLEMENT THIS

    /**
     * @notice Get current split configuration (immutable)
     * @return agentBps Agent token share in basis points
     * @return platformBps Platform token share in basis points
     */
    function getSplit() external pure returns (uint256 agentBps, uint256 platformBps) {
        return (AGENT_BPS, PLATFORM_BPS);
    }

    /**
     * @notice Receive ETH for buybacks
     */
    receive() external payable {}
}
