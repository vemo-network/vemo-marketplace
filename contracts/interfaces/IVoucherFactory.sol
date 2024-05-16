// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
interface IVoucherFactory {
    function getTokenBoundAccount(address nftAddress, uint256 tokenId) external view returns (address account);
}
