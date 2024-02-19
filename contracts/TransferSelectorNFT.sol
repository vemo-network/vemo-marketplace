// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import {ITransferSelectorNFT} from "./interfaces/ITransferSelectorNFT.sol";

/**
 * @title TransferSelectorNFT
 * @notice It selects the NFT transfer manager based on a collection address.
 */
contract TransferSelectorNFT is
    Initializable,
    AccessControlUpgradeable,
    ITransferSelectorNFT
{
    // ERC721 interfaceID
    bytes4 public constant INTERFACE_ID_ERC721 = 0x80ac58cd;
    // ERC1155 interfaceID
    bytes4 public constant INTERFACE_ID_ERC1155 = 0xd9b67a26;

    // Address of the transfer manager contract for ERC721 tokens
    address public TRANSFER_MANAGER_ERC721;

    // Address of the transfer manager contract for ERC1155 tokens
    address public TRANSFER_MANAGER_ERC1155;

    // Map collection address to transfer manager address
    mapping(address => address) public transferManagerSelectorForCollection;

    event CollectionTransferManagerAdded(
        address indexed collection,
        address indexed transferManager
    );
    event CollectionTransferManagerRemoved(address indexed collection);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize
     * @param _transferManagerERC721 address of the ERC721 transfer manager
     * @param _transferManagerERC1155 address of the ERC1155 transfer manager
     */
    function initialize(
        address owner,
        address _transferManagerERC721,
        address _transferManagerERC1155
    ) public initializer {
        __Context_init_unchained();
        __AccessControl_init_unchained();

        address defaultAdmin = _msgSender();
        if (owner != address(0)) {
            defaultAdmin = owner;
        }

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);

        TRANSFER_MANAGER_ERC721 = _transferManagerERC721;
        TRANSFER_MANAGER_ERC1155 = _transferManagerERC1155;
    }

    /**
     * @notice Add a transfer manager for a collection
     * @param collection collection address to add specific transfer rule
     * @dev It is meant to be used for exceptions only (e.g., CryptoKitties)
     */
    function addCollectionTransferManager(
        address collection,
        address transferManager
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            collection != address(0),
            "Owner: Collection cannot be null address"
        );
        require(
            transferManager != address(0),
            "Owner: TransferManager cannot be null address"
        );

        transferManagerSelectorForCollection[collection] = transferManager;

        emit CollectionTransferManagerAdded(collection, transferManager);
    }

    /**
     * @notice Remove a transfer manager for a collection
     * @param collection collection address to remove exception
     */
    function removeCollectionTransferManager(address collection)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(
            transferManagerSelectorForCollection[collection] != address(0),
            "Owner: Collection has no transfer manager"
        );

        // Set it to the address(0)
        transferManagerSelectorForCollection[collection] = address(0);

        emit CollectionTransferManagerRemoved(collection);
    }

    /**
     * @notice Check the transfer manager for a token
     * @param collection collection address
     * @dev Support for ERC165 interface is checked AFTER custom implementation
     */
    function checkTransferManagerForToken(address collection)
        external
        view
        override
        returns (address transferManager)
    {
        // Assign transfer manager (if any)
        transferManager = transferManagerSelectorForCollection[collection];

        if (transferManager == address(0)) {
            if (IERC165(collection).supportsInterface(INTERFACE_ID_ERC721)) {
                transferManager = TRANSFER_MANAGER_ERC721;
            } else if (
                IERC165(collection).supportsInterface(INTERFACE_ID_ERC1155)
            ) {
                transferManager = TRANSFER_MANAGER_ERC1155;
            }
        }

        return transferManager;
    }
}
