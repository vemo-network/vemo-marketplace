// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {EnumerableSetUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";

import {ICurrencyManager} from "./interfaces/ICurrencyManager.sol";

/**
 * @title CurrencyManager
 * @notice It allows adding/removing currencies for trading on the VemoMarket.
 */
contract CurrencyManager is
    Initializable,
    AccessControlUpgradeable,
    ICurrencyManager
{
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

    EnumerableSetUpgradeable.AddressSet private _whitelistedCurrencies;

    event CurrencyRemoved(address indexed currency);
    event CurrencyWhitelisted(address indexed currency);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address owner) public initializer {
        __Context_init_unchained();
        __AccessControl_init_unchained();

        address defaultAdmin = _msgSender();
        if (owner != address(0)) {
            defaultAdmin = owner;
        }

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
    }

    /**
     * @notice Add a currency in the system
     * @param currency address of the currency to add
     */
    function addCurrency(address currency)
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(
            !_whitelistedCurrencies.contains(currency),
            "Currency: Already whitelisted"
        );
        _whitelistedCurrencies.add(currency);

        emit CurrencyWhitelisted(currency);
    }

    /**
     * @notice Remove a currency from the system
     * @param currency address of the currency to remove
     */
    function removeCurrency(address currency)
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(
            _whitelistedCurrencies.contains(currency),
            "Currency: Not whitelisted"
        );
        _whitelistedCurrencies.remove(currency);

        emit CurrencyRemoved(currency);
    }

    /**
     * @notice Returns if a currency is in the system
     * @param currency address of the currency
     */
    function isCurrencyWhitelisted(address currency)
        external
        view
        override
        returns (bool)
    {
        return _whitelistedCurrencies.contains(currency);
    }

    /**
     * @notice View number of whitelisted currencies
     */
    function viewCountWhitelistedCurrencies()
        external
        view
        override
        returns (uint256)
    {
        return _whitelistedCurrencies.length();
    }

    /**
     * @notice See whitelisted currencies in the system
     * @param cursor cursor (should start at 0 for first request)
     * @param size size of the response (e.g., 50)
     */
    function viewWhitelistedCurrencies(uint256 cursor, uint256 size)
        external
        view
        override
        returns (address[] memory, uint256)
    {
        uint256 length = size;

        if (length > _whitelistedCurrencies.length() - cursor) {
            length = _whitelistedCurrencies.length() - cursor;
        }

        address[] memory whitelistedCurrencies = new address[](length);

        for (uint256 i = 0; i < length; i++) {
            whitelistedCurrencies[i] = _whitelistedCurrencies.at(cursor + i);
        }

        return (whitelistedCurrencies, cursor + length);
    }
}
