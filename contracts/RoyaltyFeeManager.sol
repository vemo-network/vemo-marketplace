// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IERC165, IERC2981} from "@openzeppelin/contracts/interfaces/IERC2981.sol";

import {IRoyaltyFeeManager} from "./interfaces/IRoyaltyFeeManager.sol";
import {IRoyaltyFeeRegistry} from "./interfaces/IRoyaltyFeeRegistry.sol";

/**
 * @title RoyaltyFeeManager
 * @notice It handles the logic to check and transfer royalty fees (if any).
 */
contract RoyaltyFeeManager is
    Initializable,
    AccessControlUpgradeable,
    IRoyaltyFeeManager
{
    // https://eips.ethereum.org/EIPS/eip-2981
    bytes4 public constant INTERFACE_ID_ERC2981 = 0x2a55205a;

    IRoyaltyFeeRegistry public royaltyFeeRegistry;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize
     * @param _royaltyFeeRegistry address of the RoyaltyFeeRegistry
     */
    function initialize(
        address owner,
        address _royaltyFeeRegistry
    ) public initializer {
        __Context_init_unchained();
        __AccessControl_init_unchained();

        address defaultAdmin = _msgSender();
        if (owner != address(0)) {
            defaultAdmin = owner;
        }

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);

        royaltyFeeRegistry = IRoyaltyFeeRegistry(_royaltyFeeRegistry);
    }

    /**
     * @notice Calculate royalty fee and get recipient
     * @param collection address of the NFT contract
     * @param tokenId tokenId
     * @param amount amount to transfer
     */
    function calculateRoyaltyFeeAndGetRecipient(
        address collection,
        uint256 tokenId,
        uint256 amount
    ) external view override returns (address, uint256) {
        // 1. Check if there is a royalty info in the system
        (address receiver, uint256 royaltyAmount) = royaltyFeeRegistry
            .royaltyInfo(collection, amount);

        // 2. If the receiver is address(0), fee is null, check if it supports the ERC2981 interface
        if ((receiver == address(0)) || (royaltyAmount == 0)) {
            if (IERC165(collection).supportsInterface(INTERFACE_ID_ERC2981)) {
                (receiver, royaltyAmount) = IERC2981(collection).royaltyInfo(
                    tokenId,
                    amount
                );
            }
        }
        return (receiver, royaltyAmount);
    }
}
