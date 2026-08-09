// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/ArcaFactory.sol";
import "../src/AgentToken.sol";

/**
 * @title Deploy
 * @notice Deployment script for Arca V1 contracts
 * 
 * Usage:
 *   forge script script/Deploy.s.sol:Deploy --rpc-url <rpc> --broadcast --verify
 * 
 * Environment variables needed:
 *   - PRIVATE_KEY: Deployer private key
 *   - TREASURY: Platform treasury address
 *   - PLATFORM_TOKEN: Platform token address (or will deploy)
 *   - PLATFORM_ADMIN: Platform admin/multisig address
 *   - KEEPER: Platform keeper address
 *   - SWAP_ROUTER: DEX router address (optional)
 */
contract Deploy is Test {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address treasury = vm.envAddress("TREASURY");
        address platformAdmin = vm.envAddress("PLATFORM_ADMIN");
        address keeper = vm.envAddress("KEEPER");
        
        // Optional: deploy platform token or use existing
        address platformToken = vm.envOr("PLATFORM_TOKEN", address(0));
        address swapRouter = vm.envOr("SWAP_ROUTER", address(0));

        vm.startBroadcast(deployerPrivateKey);

        // Deploy platform token if not provided
        if (platformToken == address(0)) {
            emit log("Deploying platform token...");
            AgentToken token = new AgentToken(
                "Arca Platform Token",
                "ARCA",
                msg.sender
            );
            platformToken = address(token);
            emit log_named_address("Platform Token deployed at", platformToken);
        } else {
            emit log_named_address("Using existing Platform Token at", platformToken);
        }

        // Deploy factory
        emit log("Deploying ArcaFactory...");
        ArcaFactory factory = new ArcaFactory(
            treasury,
            platformToken,
            platformAdmin,
            keeper,
            swapRouter
        );

        emit log_named_address("ArcaFactory deployed at", address(factory));
        emit log_named_address("Treasury", treasury);
        emit log_named_address("Platform Admin", platformAdmin);
        emit log_named_address("Keeper", keeper);
        if (swapRouter != address(0)) {
            emit log_named_address("Swap Router", swapRouter);
        }

        vm.stopBroadcast();

        // Output deployment addresses
        emit log("=== Deployment Summary ===");
        emit log_named_address("Factory", address(factory));
        emit log_named_address("Platform Token", platformToken);
    }
}

/**
 * @title DeployAgent
 * @notice Script to deploy an agent using the factory
 * 
 * Usage:
 *   forge script script/Deploy.s.sol:DeployAgent --rpc-url <rpc> --broadcast
 * 
 * Environment variables needed:
 *   - PRIVATE_KEY: Deployer private key
 *   - FACTORY_ADDRESS: ArcaFactory address
 *   - TOKEN_NAME: Agent token name
 *   - TOKEN_SYMBOL: Agent token symbol
 *   - OPERATIONAL_WALLET: Agent operational wallet
 *   - RAISE_TARGET: Raise target in wei (e.g., 10000000000000000000 for 10 ETH)
 *   - MIN_TICKET: Minimum ticket in wei
 */
contract DeployAgent is Test {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address factoryAddress = vm.envAddress("FACTORY_ADDRESS");
        
        string memory tokenName = vm.envString("TOKEN_NAME");
        string memory tokenSymbol = vm.envString("TOKEN_SYMBOL");
        address operationalWallet = vm.envAddress("OPERATIONAL_WALLET");
        uint256 raiseTarget = vm.envUint("RAISE_TARGET");
        uint256 minTicket = vm.envUint("MIN_TICKET");

        // Optional parameters with defaults
        uint256 raiseThresholdBps = vm.envOr("RAISE_THRESHOLD_BPS", uint256(5000)); // 50%
        uint256 vestingCliff = vm.envOr("VESTING_CLIFF", uint256(30 days));
        uint256 vestingDuration = vm.envOr("VESTING_DURATION", uint256(365 days));

        vm.startBroadcast(deployerPrivateKey);

        ArcaFactory factory = ArcaFactory(factoryAddress);

        ArcaFactory.LaunchParams memory params = ArcaFactory.LaunchParams({
            tokenName: tokenName,
            tokenSymbol: tokenSymbol,
            operationalWallet: operationalWallet,
            raiseTarget: raiseTarget,
            raiseThresholdBps: raiseThresholdBps,
            minTicket: minTicket,
            vestingCliff: vestingCliff,
            vestingDuration: vestingDuration
        });

        emit log("Deploying agent...");
        uint256 agentId = factory.deployAgent(params);

        ArcaFactory.AgentLaunch memory launch = factory.getLaunch(agentId);

        emit log("=== Agent Deployed Successfully ===");
        emit log_named_uint("Agent ID", agentId);
        emit log_named_address("Token", launch.token);
        emit log_named_address("ICO", launch.ico);
        emit log_named_address("Buyback", launch.buyback);
        emit log_named_address("Locked Wallet", launch.lockedWallet);
        emit log_named_address("Fee Contract", launch.feeContract);

        vm.stopBroadcast();
    }
}
