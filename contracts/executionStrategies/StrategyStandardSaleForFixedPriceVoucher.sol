// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {OrderTypes} from "../libraries/OrderTypes.sol";
import {IExecutionStrategy} from "../interfaces/IExecutionStrategy.sol";
import "../interfaces/IVoucherFactory.sol";

interface IOrderValidator  {
    function checkERC6551AccountAssets(
        OrderTypes.MakerOrder calldata makerOrder
    ) external view returns (uint256 validationCode, uint256 tokenType);
}

/**
 * @title StrategyStandardSaleForFixedPriceVoucher
 * @notice Strategy that executes an order at a fixed price that for NFT ERC6551Account
 * can be taken either by a bid or an ask.
 */
contract StrategyStandardSaleForFixedPriceVoucher is IExecutionStrategy {
    uint256 public immutable PROTOCOL_FEE;
    IOrderValidator public immutable orderValidator;
    uint256 constant public ORDER_VALID_CODE = 0;
    uint256 constant public INVALID_ERC6551_ASSETS_INPUTS = 901;

    /**
     * @notice Constructor
     * @param _protocolFee protocol fee (200 --> 2%, 400 --> 4%)
     */
    constructor(uint256 _protocolFee, IOrderValidator _orderValidator) {
        PROTOCOL_FEE = _protocolFee;
        orderValidator = _orderValidator;
    }

    /**
     * @notice Check whether a taker ask order can be executed against a maker bid
     * @param takerAsk taker ask order
     * @param makerBid maker bid order
     * @return (whether strategy can be executed, tokenId to execute, amount of tokens to execute)
     */
    function canExecuteTakerAsk(OrderTypes.TakerOrder calldata takerAsk, OrderTypes.MakerOrder calldata makerBid)
        external
        view
        override
        returns (
            bool,
            uint256,
            uint256
        )
    {
        uint256 validationERC6551Code;

        if (makerBid.boundTokens.length == 0) {
            validationERC6551Code = INVALID_ERC6551_ASSETS_INPUTS;
        } else {
            (
                validationERC6551Code,
            ) = orderValidator.checkERC6551AccountAssets(makerBid);
        }
        
        return (
            (
                validationERC6551Code == ORDER_VALID_CODE &&
                (makerBid.price == takerAsk.price) &&
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
    function canExecuteTakerBid(OrderTypes.TakerOrder calldata takerBid, OrderTypes.MakerOrder calldata makerAsk)
        external
        view
        override
        returns (
            bool,
            uint256,
            uint256
        )
    {
        uint256 validationERC6551Code;

        if (makerAsk.boundTokens.length == 0) {
            validationERC6551Code = INVALID_ERC6551_ASSETS_INPUTS;
        } else {
            (
                validationERC6551Code,
            ) = orderValidator.checkERC6551AccountAssets(makerAsk);
        }

        return (
            (
                validationERC6551Code == ORDER_VALID_CODE &&
                (makerAsk.price == takerBid.price) &&
                (makerAsk.tokenId == takerBid.tokenId) &&
                (makerAsk.startTime <= block.timestamp) &&
                (makerAsk.endTime >= block.timestamp)),
            makerAsk.tokenId,
            makerAsk.amount
        );
    }

    /**
     * @notice Return protocol fee for this strategy
     * @return protocol fee
     */
    function viewProtocolFee() external view override returns (uint256) {
        return PROTOCOL_FEE;
    }
}
