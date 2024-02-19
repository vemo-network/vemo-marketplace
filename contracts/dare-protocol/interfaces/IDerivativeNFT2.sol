// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IDerivativeNFT2 {
    event NFT2DerivativeMinted(
        address indexed to,
        address indexed provider,
        address nft2Token,
        uint256 nft2TokenId,
        uint256 nft2DerivativeTokenId
    );

    function totalSupply() external view returns (uint256);

    function getOriginalToken() external view returns (address, uint256);

    function getTokenDetail(
        uint256 tokenId
    ) external view returns (address, address, uint256);

    function getCurrentToken(address provider) external view returns (uint256);

    function safeMint(
        address to,
        address provider
    ) external payable returns (uint256);

    function safeMintAndData(
        address to,
        address provider,
        uint256 openTime,
        uint256 closingTime,
        uint96 feeNumerator
    ) external payable returns (uint256);

    function setRoyalties(uint256 tokenId, uint96 feeNumerator) external;

    function setTime(
        uint256 tokenId,
        uint256 openTime,
        uint256 closingTime
    ) external payable;
}
