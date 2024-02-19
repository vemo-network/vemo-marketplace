// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {OrderTypes} from "../libraries/OrderTypes.sol";

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface ICallbackable is IERC165 {
    function beforeTransferFeeAndFunds(
        OrderTypes.TakerOrder calldata takerBid,
        OrderTypes.MakerOrder calldata makerAsk
    ) external;

    function beforeTransferNonFungibleToken(
        OrderTypes.TakerOrder calldata takerBid,
        OrderTypes.MakerOrder calldata makerAsk
    ) external;

    function afterTransferNonFungibleToken(
        OrderTypes.TakerOrder calldata takerBid,
        OrderTypes.MakerOrder calldata makerAsk
    ) external;
}
