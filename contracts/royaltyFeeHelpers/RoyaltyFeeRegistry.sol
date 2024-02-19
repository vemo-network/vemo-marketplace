// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import {IRoyaltyFeeRegistry} from "../interfaces/IRoyaltyFeeRegistry.sol";

/**
 * @title RoyaltyFeeRegistry
 * @notice It is a royalty fee registry for the DareMarket.
 */
contract RoyaltyFeeRegistry is
    Initializable,
    AccessControlUpgradeable,
    IRoyaltyFeeRegistry
{
    bytes32 public constant INTERACTABLE_ROLE = keccak256("INTERACTABLE_ROLE");

    struct FeeInfo {
        address setter;
        address receiver;
        uint256 fee;
    }

    // Limit (if enforced for fee royalty in percentage (10,000 = 100%)
    uint256 public royaltyFeeLimit;

    mapping(address => FeeInfo) private _royaltyFeeInfoCollection;

    event NewRoyaltyFeeLimit(uint256 royaltyFeeLimit);
    event RoyaltyFeeUpdate(
        address indexed collection,
        address indexed setter,
        address indexed receiver,
        uint256 fee
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize
     * @param _royaltyFeeLimit new royalty fee limit (500 = 5%, 1,000 = 10%)
     */
    function initialize(address owner, uint256 _royaltyFeeLimit)
        public
        initializer
    {
        __Context_init_unchained();
        __AccessControl_init_unchained();

        address defaultAdmin = _msgSender();
        if (owner != address(0)) {
            defaultAdmin = owner;
        }

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);

        require(_royaltyFeeLimit <= 9500, "Owner: Royalty fee limit too high");
        royaltyFeeLimit = _royaltyFeeLimit;
    }

    /**
     * @notice Update royalty info for collection
     * @param _royaltyFeeLimit new royalty fee limit (500 = 5%, 1,000 = 10%)
     */
    function updateRoyaltyFeeLimit(uint256 _royaltyFeeLimit)
        external
        override
        onlyRole(INTERACTABLE_ROLE)
    {
        require(_royaltyFeeLimit <= 9500, "Owner: Royalty fee limit too high");
        royaltyFeeLimit = _royaltyFeeLimit;

        emit NewRoyaltyFeeLimit(_royaltyFeeLimit);
    }

    /**
     * @notice Update royalty info for collection
     * @param collection address of the NFT contract
     * @param setter address that sets the receiver
     * @param receiver receiver for the royalty fee
     * @param fee fee (500 = 5%, 1,000 = 10%)
     */
    function updateRoyaltyInfoForCollection(
        address collection,
        address setter,
        address receiver,
        uint256 fee
    ) external override onlyRole(INTERACTABLE_ROLE) {
        require(fee <= royaltyFeeLimit, "Registry: Royalty fee too high");
        _royaltyFeeInfoCollection[collection] = FeeInfo({
            setter: setter,
            receiver: receiver,
            fee: fee
        });

        emit RoyaltyFeeUpdate(collection, setter, receiver, fee);
    }

    /**
     * @notice Calculate royalty info for a collection address and a sale gross amount
     * @param collection collection address
     * @param amount amount
     * @return receiver address and amount received by royalty recipient
     */
    function royaltyInfo(address collection, uint256 amount)
        external
        view
        override
        returns (address, uint256)
    {
        return (
            _royaltyFeeInfoCollection[collection].receiver,
            (amount * _royaltyFeeInfoCollection[collection].fee) / 10000
        );
    }

    /**
     * @notice View royalty info for a collection address
     * @param collection collection address
     */
    function royaltyFeeInfoCollection(address collection)
        external
        view
        override
        returns (
            address,
            address,
            uint256
        )
    {
        return (
            _royaltyFeeInfoCollection[collection].setter,
            _royaltyFeeInfoCollection[collection].receiver,
            _royaltyFeeInfoCollection[collection].fee
        );
    }
}
