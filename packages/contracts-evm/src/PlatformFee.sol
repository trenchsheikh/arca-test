// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./vendor/Ownable.sol";

/**
 * @title PlatformFee
 * @notice Splits platform fees 50/50 between treasury and deployer
 * @dev Treasury share MUST NOT auto-route to buyback contract
 */
contract PlatformFee is Ownable {
    /// @notice Arca treasury address (receives 50% of fees)
    address public treasury;

    /// @notice Agent deployer address (receives 50% of fees)
    address public deployer;

    /// @notice Total fees collected
    uint256 public totalFeesCollected;

    /// @notice Fees allocated to treasury
    uint256 public treasuryBalance;

    /// @notice Fees allocated to deployer
    uint256 public deployerBalance;

    event FeeCollected(uint256 amount, uint256 treasuryShare, uint256 deployerShare, address indexed payer);
    event FeesWithdrawn(address indexed recipient, uint256 amount);
    event TreasuryUpdated(address indexed previousTreasury, address indexed newTreasury);
    event DeployerUpdated(address indexed previousDeployer, address indexed newDeployer);

    error ZeroAddress();
    error NoFeesToWithdraw();
    error WithdrawalFailed();

    /**
     * @notice Creates a fee splitter
     * @param treasury_ Arca treasury address
     * @param deployer_ Agent deployer address
     */
    constructor(address treasury_, address deployer_) Ownable(msg.sender) {
        if (treasury_ == address(0) || deployer_ == address(0)) revert ZeroAddress();
        treasury = treasury_;
        deployer = deployer_;
    }

    /**
     * @notice Collect fees and split 50/50
     * @dev Anyone can send fees to this contract
     */
    receive() external payable {
        _collectFee(msg.value);
    }

    /**
     * @notice Collect fees explicitly
     */
    function collectFee() external payable {
        _collectFee(msg.value);
    }

    /**
     * @notice Internal fee collection and splitting
     * @param amount Amount of fees to collect
     */
    function _collectFee(uint256 amount) internal {
        require(amount > 0, "PlatformFee: zero amount");

        // 50/50 split
        uint256 treasuryShare = amount / 2;
        uint256 deployerShare = amount - treasuryShare; // Handle odd amounts

        totalFeesCollected += amount;
        treasuryBalance += treasuryShare;
        deployerBalance += deployerShare;

        emit FeeCollected(amount, treasuryShare, deployerShare, msg.sender);
    }

    /**
     * @notice Treasury withdraws their accumulated fees
     */
    function withdrawTreasury() external {
        require(msg.sender == treasury, "PlatformFee: not treasury");
        uint256 amount = treasuryBalance;
        if (amount == 0) revert NoFeesToWithdraw();

        treasuryBalance = 0;
        
        (bool success, ) = treasury.call{value: amount}("");
        if (!success) revert WithdrawalFailed();

        emit FeesWithdrawn(treasury, amount);
    }

    /**
     * @notice Deployer withdraws their accumulated fees
     */
    function withdrawDeployer() external {
        require(msg.sender == deployer, "PlatformFee: not deployer");
        uint256 amount = deployerBalance;
        if (amount == 0) revert NoFeesToWithdraw();

        deployerBalance = 0;
        
        (bool success, ) = deployer.call{value: amount}("");
        if (!success) revert WithdrawalFailed();

        emit FeesWithdrawn(deployer, amount);
    }

    /**
     * @notice Update treasury address
     * @param newTreasury New treasury address
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        address previousTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(previousTreasury, newTreasury);
    }

    /**
     * @notice Update deployer address
     * @param newDeployer New deployer address
     */
    function updateDeployer(address newDeployer) external onlyOwner {
        if (newDeployer == address(0)) revert ZeroAddress();
        address previousDeployer = deployer;
        deployer = newDeployer;
        emit DeployerUpdated(previousDeployer, newDeployer);
    }
}
