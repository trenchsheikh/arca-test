// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./vendor/ERC20.sol";
import "./vendor/Ownable.sol";

/**
 * @title AgentToken
 * @notice ERC20 token for Arca agents with fixed 1 billion supply
 * @dev Total supply: 1,000,000,000 tokens (1e9 * 1e18)
 */
contract AgentToken is ERC20, Ownable {
    /// @notice Fixed total supply of 1 billion tokens (18 decimals)
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000e18;

    /**
     * @notice Creates a new AgentToken with fixed supply
     * @param name_ Token name
     * @param symbol_ Token symbol
     * @param recipient Address to receive the initial supply
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address recipient
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        require(recipient != address(0), "AgentToken: zero address");
        _mint(recipient, TOTAL_SUPPLY);
    }
}
