// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../interfaces/IVoucherFactory.sol";

contract MockVoucherFactory is IVoucherFactory {
    mapping(address => mapping(uint256 => address)) private _tbaNftMap;
    function setTokenBoundAccount(address nftAddress, uint256 tokenId, address tba) external{
        _tbaNftMap[nftAddress][tokenId] = tba;
    }

    function getTokenBoundAccount(address nftAddress, uint256 tokenId) override external view returns (address account){
        return _tbaNftMap[nftAddress][tokenId];
    }
}
