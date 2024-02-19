// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {OrderTypes} from "../libraries/OrderTypes.sol";
import {IExecutionStrategy} from "../interfaces/IExecutionStrategy.sol";
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import {IDerivativeNFT2} from "../dare-protocol/interfaces/IDerivativeNFT2.sol";
import {ITokenCreator} from "../dare-protocol/interfaces/ITokenCreator.sol";
import {ITimeHelper} from "../dare-protocol/interfaces/ITimeHelper.sol";

import "hardhat/console.sol";

/**
 * @title StrategyStandardSaleForFixedPriceV1B
 * @notice Strategy that executes an order at a fixed price that
 * can be taken either by a bid or an ask.
 */
contract StrategyStandardSaleForFixedPriceDNFT is
    Ownable,
    ERC165,
    IExecutionStrategy
{
    using ERC165Checker for address;

    event UpdateValidTime(
        address indexed collection,
        uint256 indexed tokenId,
        uint256 startTime,
        uint256 endTime
    );

    // Event if the protocol fee changes
    event NewProtocolFee(uint256 protocolFee);

    struct SaleNFTCustomizeParams {
        uint256 time;
    }

    // Protocol fee
    uint256 internal _protocolFee = 150;

    bytes4 public derivativeNFTInterfaceId;

    constructor() Ownable() {
        // default interfaceId
        setDerivativeNFTInterfaceId(0x62ce3ecf);
    }

    function setDerivativeNFTInterfaceId(bytes4 interfaceId) public onlyOwner {
        derivativeNFTInterfaceId = interfaceId;
    }

    /**
     * @notice Check whether a taker ask order can be executed against a maker bid
     * @param takerAsk taker ask order
     * @param makerBid maker bid order
     * @return (whether strategy can be executed, tokenId to execute, amount of tokens to execute)
     */
    function canExecuteTakerAsk(
        OrderTypes.TakerOrder calldata takerAsk,
        OrderTypes.MakerOrder calldata makerBid
    ) external view override returns (bool, uint256, uint256) {
        // DerivativeNFT only
        if (
            !makerBid.collection.supportsInterface(
                derivativeNFTInterfaceId
            )
        ) {
            return (false, makerBid.tokenId, makerBid.amount);
        }

        // only owner of derivativeNFT can execute ask orders
        address derivativeNFTOwner = ITokenCreator(makerBid.collection)
            .getTokenCreator(makerBid.tokenId);
        if (makerBid.signer != derivativeNFTOwner) {
            return (false, makerBid.tokenId, makerBid.amount);
        }

        SaleNFTCustomizeParams memory params = abi.decode(
            takerAsk.params,
            (SaleNFTCustomizeParams)
        );
        if (
            !_validateTime(makerBid.collection, takerAsk.tokenId, params.time)
        ) {
            return (false, makerBid.tokenId, makerBid.amount);
        }

        return (
            ((makerBid.price == takerAsk.price) &&
                (makerBid.tokenId == takerAsk.tokenId) &&
                (makerBid.startTime <= block.timestamp) &&
                (makerBid.endTime >= block.timestamp)),
            makerBid.tokenId,
            makerBid.amount
        );
    }

    /**
     * @notice Check whether a taker bid order can be executed against a maker ask
     * @param takerBid taker bid order
     * @param makerAsk maker ask order
     * @return (whether strategy can be executed, tokenId to execute, amount of tokens to execute)
     */
    function canExecuteTakerBid(
        OrderTypes.TakerOrder calldata takerBid,
        OrderTypes.MakerOrder calldata makerAsk
    ) external view override returns (bool, uint256, uint256) {
        if (
            !makerAsk.collection.supportsInterface(
                derivativeNFTInterfaceId
            )
        ) {
            return (false, makerAsk.tokenId, makerAsk.amount);
        }

        // // only owner of derivativeNFT can execute ask orders
        // address derivativeNFTOwner = ITokenCreator(makerAsk.collection)
        //     .getTokenCreator(makerAsk.tokenId);
        // if (makerAsk.signer != derivativeNFTOwner) {
        //     return (false, makerAsk.tokenId, makerAsk.amount);
        // }

        // valid extra time
        SaleNFTCustomizeParams memory params = abi.decode(
            makerAsk.params,
            (SaleNFTCustomizeParams)
        );

        if (
            !_validateTime(makerAsk.collection, makerAsk.tokenId, params.time)
        ) {
            return (false, makerAsk.tokenId, makerAsk.amount);
        }

        return (
            ((makerAsk.price == takerBid.price) &&
                (makerAsk.tokenId == takerBid.tokenId) &&
                (makerAsk.startTime <= block.timestamp) &&
                (makerAsk.endTime >= block.timestamp)),
            makerAsk.tokenId,
            makerAsk.amount
        );
    }

    function _validateTime(
        address collection,
        uint256 tokenId,
        uint256 extraTime
    ) internal view returns (bool) {
        // added time
        uint256 openingTime = ITimeHelper(collection).getOpeningTime(tokenId);
        uint256 closingTime = ITimeHelper(collection).getClosingTime(tokenId);

        // // not setup yet
        // if (openingTime == 0) {
        //     return false;
        // }

        if (closingTime - openingTime >= extraTime) {
            return true;
        }

        return false;
    }

    /**
     * @notice Set new protocol fee for this strategy
     * @param newProtocolFee protocol fee
     */
    function setProtocolFee(uint256 newProtocolFee) external onlyOwner {
        require(newProtocolFee < _protocolFee, "Owner: Protocol fee too high");
        _protocolFee = newProtocolFee;

        emit NewProtocolFee(newProtocolFee);
    }

    /**
     * @notice Return protocol fee for this strategy
     * @return protocol fee
     */
    function viewProtocolFee() external view override returns (uint256) {
        return _protocolFee;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override returns (bool) {
        return
            ERC165.supportsInterface(interfaceId) ||
            interfaceId == type(IExecutionStrategy).interfaceId;
    }
}
