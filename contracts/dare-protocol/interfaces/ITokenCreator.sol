// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

interface ITokenCreator {
    function getTokenCreator(uint256 tokenId) external view returns (address);
}
