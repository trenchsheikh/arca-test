// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./vendor/Ownable.sol";

interface IAgentToken {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title Ico
 * @notice ICO contract for agent token launches
 * @dev Handles contributions, threshold enforcement, finalization, and refunds
 * 
 * Key features:
 * - Accept ETH contributions during raise window
 * - Track contributions per wallet
 * - Enforce minTicket
 * - Enforce raiseThresholdBps (of raiseTarget)
 * - Admin can pause/cancel (not deployer)
 * - Finalize: threshold met → success (ETH to operationalWallet); else failed → refunds
 * - Claim tokens when successful (10% presale bucket proportional)
 */
contract Ico is Ownable {
    /// @notice Agent token being raised for
    address public immutable agentToken;

    /// @notice Operational wallet to receive raised funds on success
    address public immutable operationalWallet;

    /// @notice Raise target in ETH (10% of FDV)
    uint256 public immutable raiseTarget;

    /// @notice Minimum threshold in basis points (5000 = 50%, up to 8000 = 80%)
    uint256 public immutable raiseThresholdBps;

    /// @notice Minimum ticket size in ETH
    uint256 public immutable minTicket;

    /// @notice Presale allocation (10% of total supply = 100M tokens)
    uint256 public immutable presaleAllocation;

    /// @notice Vesting cliff in seconds
    uint256 public immutable vestingCliff;

    /// @notice Vesting duration in seconds
    uint256 public immutable vestingDuration;

    /// @notice Admin address (can pause/cancel)
    address public admin;

    /// @notice ICO start time
    uint256 public startTime;

    /// @notice ICO end time
    uint256 public endTime;

    /// @notice Total amount raised
    uint256 public totalRaised;

    /// @notice Number of contributors
    uint256 public contributorCount;

    /// @notice Whether ICO has been finalized
    bool public finalized;

    /// @notice Whether ICO was successful
    bool public successful;

    /// @notice Whether ICO is paused
    bool public paused;

    /// @notice Whether ICO is cancelled
    bool public cancelled;

    /// @notice Contributions per wallet
    mapping(address => uint256) public contributions;

    /// @notice Whether wallet has claimed tokens
    mapping(address => bool) public claimed;

    /// @notice Whether wallet has refunded
    mapping(address => bool) public refunded;

    event Contribution(address indexed wallet, uint256 amount, uint256 timestamp);
    event Refund(address indexed wallet, uint256 amount, uint256 timestamp);
    event RaiseFinalized(bool success, uint256 totalRaised, uint256 timestamp);
    event TokensClaimed(address indexed wallet, uint256 amount);
    event Paused(address indexed admin);
    event Unpaused(address indexed admin);
    event Cancelled(address indexed admin);
    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);

    error NotAdmin();
    error NotStarted();
    error Ended();
    error Paused();
    error Cancelled();
    error AlreadyFinalized();
    error NotFinalized();
    error BelowMinTicket();
    error NoContribution();
    error AlreadyClaimed();
    error AlreadyRefunded();
    error NotEligibleForRefund();
    error TransferFailed();
    error ZeroAddress();

    /**
     * @notice Creates a new ICO
     * @param agentToken_ Agent token address
     * @param operationalWallet_ Wallet to receive funds on success
     * @param raiseTarget_ Target raise amount in ETH
     * @param raiseThresholdBps_ Minimum threshold (5000-8000 bps)
     * @param minTicket_ Minimum contribution in ETH
     * @param presaleAllocation_ Tokens allocated for presale (10% of supply)
     * @param vestingCliff_ Vesting cliff in seconds
     * @param vestingDuration_ Total vesting duration in seconds
     * @param admin_ Admin address
     */
    constructor(
        address agentToken_,
        address operationalWallet_,
        uint256 raiseTarget_,
        uint256 raiseThresholdBps_,
        uint256 minTicket_,
        uint256 presaleAllocation_,
        uint256 vestingCliff_,
        uint256 vestingDuration_,
        address admin_
    ) Ownable(msg.sender) {
        if (agentToken_ == address(0) || operationalWallet_ == address(0) || admin_ == address(0)) {
            revert ZeroAddress();
        }
        require(raiseTarget_ > 0, "Ico: zero raise target");
        require(raiseThresholdBps_ >= 5000 && raiseThresholdBps_ <= 8000, "Ico: invalid threshold");
        require(minTicket_ > 0, "Ico: zero min ticket");
        require(presaleAllocation_ > 0, "Ico: zero presale allocation");

        agentToken = agentToken_;
        operationalWallet = operationalWallet_;
        raiseTarget = raiseTarget_;
        raiseThresholdBps = raiseThresholdBps_;
        minTicket = minTicket_;
        presaleAllocation = presaleAllocation_;
        vestingCliff = vestingCliff_;
        vestingDuration = vestingDuration_;
        admin = admin_;
    }

    /**
     * @notice Set ICO window
     * @param startTime_ Start timestamp
     * @param endTime_ End timestamp
     */
    function setWindow(uint256 startTime_, uint256 endTime_) external {
        if (msg.sender != admin) revert NotAdmin();
        require(startTime_ < endTime_, "Ico: invalid window");
        require(!finalized, "Ico: already finalized");

        startTime = startTime_;
        endTime = endTime_;
    }

    /**
     * @notice Contribute to ICO
     */
    function contribute() external payable {
        if (block.timestamp < startTime) revert NotStarted();
        if (block.timestamp >= endTime) revert Ended();
        if (paused) revert Paused();
        if (cancelled) revert Cancelled();
        if (msg.value < minTicket) revert BelowMinTicket();

        if (contributions[msg.sender] == 0) {
            contributorCount++;
        }

        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;

        emit Contribution(msg.sender, msg.value, block.timestamp);
    }

    /**
     * @notice Finalize ICO
     * @dev Can be called by admin or owner after end time
     */
    function finalize() external {
        require(msg.sender == admin || msg.sender == owner(), "Ico: unauthorized");
        require(block.timestamp >= endTime || cancelled, "Ico: not ended");
        if (finalized) revert AlreadyFinalized();
        // Cancelled raises always fail — never send funds to ops or mark successful
        if (cancelled) {
            finalized = true;
            successful = false;
            emit RaiseFinalized(false, totalRaised, block.timestamp);
            return;
        }

        finalized = true;

        // Check if threshold met
        uint256 threshold = (raiseTarget * raiseThresholdBps) / 10000;
        successful = totalRaised >= threshold;

        if (successful) {
            // Send ETH to operational wallet
            (bool sent, ) = operationalWallet.call{value: totalRaised}("");
            if (!sent) revert TransferFailed();
        }

        emit RaiseFinalized(successful, totalRaised, block.timestamp);
    }

    /**
     * @notice Claim tokens after successful raise
     * @dev Proportional to contribution within 10% presale bucket
     */
    function claimTokens() external {
        if (!finalized) revert NotFinalized();
        require(successful, "Ico: not successful");
        if (claimed[msg.sender]) revert AlreadyClaimed();

        uint256 contribution = contributions[msg.sender];
        if (contribution == 0) revert NoContribution();

        claimed[msg.sender] = true;

        // Calculate proportional allocation
        uint256 tokenAmount = (contribution * presaleAllocation) / totalRaised;

        IAgentToken(agentToken).transfer(msg.sender, tokenAmount);

        emit TokensClaimed(msg.sender, tokenAmount);
    }

    /**
     * @notice Refund contribution after failed raise or cancellation
     */
    function refund() external {
        if (!finalized && !cancelled) revert NotEligibleForRefund();
        if (successful) revert NotEligibleForRefund();
        if (refunded[msg.sender]) revert AlreadyRefunded();

        uint256 contribution = contributions[msg.sender];
        if (contribution == 0) revert NoContribution();

        refunded[msg.sender] = true;

        (bool sent, ) = msg.sender.call{value: contribution}("");
        if (!sent) revert TransferFailed();

        emit Refund(msg.sender, contribution, block.timestamp);
    }

    /**
     * @notice Pause ICO (admin only)
     */
    function pause() external {
        if (msg.sender != admin) revert NotAdmin();
        paused = true;
        emit Paused(admin);
    }

    /**
     * @notice Unpause ICO (admin only)
     */
    function unpause() external {
        if (msg.sender != admin) revert NotAdmin();
        paused = false;
        emit Unpaused(admin);
    }

    /**
     * @notice Cancel ICO and enable refunds (admin only)
     */
    function cancel() external {
        if (msg.sender != admin) revert NotAdmin();
        require(!finalized, "Ico: already finalized");
        cancelled = true;
        // Immediately finalize as failed so refunds are enabled without a second call race
        finalized = true;
        successful = false;
        emit Cancelled(admin);
        emit RaiseFinalized(false, totalRaised, block.timestamp);
    }

    /**
     * @notice Transfer admin role
     * @param newAdmin New admin address
     */
    function transferAdmin(address newAdmin) external {
        if (msg.sender != admin) revert NotAdmin();
        if (newAdmin == address(0)) revert ZeroAddress();

        address previousAdmin = admin;
        admin = newAdmin;
        emit AdminTransferred(previousAdmin, newAdmin);
    }

    /**
     * @notice Get minimum threshold amount
     */
    function getThresholdAmount() external view returns (uint256) {
        return (raiseTarget * raiseThresholdBps) / 10000;
    }

    /**
     * @notice Check if threshold is met
     */
    function isThresholdMet() external view returns (bool) {
        uint256 threshold = (raiseTarget * raiseThresholdBps) / 10000;
        return totalRaised >= threshold;
    }

    /**
     * @notice Get allocation for a wallet
     * @param wallet Wallet address
     */
    function getAllocation(address wallet) external view returns (uint256) {
        if (totalRaised == 0) return 0;
        return (contributions[wallet] * presaleAllocation) / totalRaised;
    }
}
