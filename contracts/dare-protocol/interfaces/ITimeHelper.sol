// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface ITimeHelper {
    function getOpeningTime(uint256 tokenId) external view returns (uint256);

    function getClosingTime(uint256 tokenId) external view returns (uint256);

    function isOpen(uint256 tokenId) external view returns (bool);

    function hasClosed(uint256 tokenId) external view returns (bool);
}
