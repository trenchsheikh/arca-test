// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./vendor/Ownable.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title LockedAgentWallet
 * @notice Holds 20% of agent token supply permanently locked until release condition met
 * @dev Release only authorized after full operational capital deployed
 */
contract LockedAgentWallet is Ownable {
    /// @notice The agent token held by this wallet
    address public immutable agentToken;

    /// @notice Whether release has been authorized by admin
    bool public releaseAuthorized;

    /// @notice Admin role that can authorize release (typically multisig)
    address public admin;

    event ReleaseAuthorized(address indexed admin);
    event TokensReleased(address indexed token, address indexed to, uint256 amount);
    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);

    error NotAuthorized();
    error ReleaseNotAuthorized();
    error ZeroAddress();

    /**
     * @notice Creates a locked wallet for agent tokens
     * @param agentToken_ Address of the agent token
     * @param admin_ Admin address (multisig) that can authorize release
     */
    constructor(address agentToken_, address admin_) Ownable(msg.sender) {
        if (agentToken_ == address(0) || admin_ == address(0)) revert ZeroAddress();
        agentToken = agentToken_;
        admin = admin_;
    }

    /**
     * @notice Authorize release after operational capital fully deployed
     * @dev Can only be called once by admin
     */
    function authorizeRelease() external {
        if (msg.sender != admin) revert NotAuthorized();
        releaseAuthorized = true;
        emit ReleaseAuthorized(msg.sender);
    }

    /**
     * @notice Release tokens to specified address
     * @param to Address to receive the tokens
     * @dev Callable by owner or admin after release is authorized
     */
    function release(address to) external {
        if (msg.sender != owner() && msg.sender != admin) revert NotAuthorized();
        if (!releaseAuthorized) revert ReleaseNotAuthorized();
        if (to == address(0)) revert ZeroAddress();

        uint256 balance = IERC20(agentToken).balanceOf(address(this));
        require(balance > 0, "LockedAgentWallet: no tokens to release");

        IERC20(agentToken).transfer(to, balance);
        emit TokensReleased(agentToken, to, balance);
    }

    /**
     * @notice Transfer admin role to new address
     * @param newAdmin New admin address
     */
    function transferAdmin(address newAdmin) external {
        if (msg.sender != admin) revert NotAuthorized();
        if (newAdmin == address(0)) revert ZeroAddress();

        address previousAdmin = admin;
        admin = newAdmin;
        emit AdminTransferred(previousAdmin, newAdmin);
    }
}
