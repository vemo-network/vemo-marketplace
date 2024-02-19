// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import { ERC165 } from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "./interfaces/IDerivativeNFT2.sol";

contract NFT2Mock is IDerivativeNFT2, ERC165 {

    address internal parentToken;
    uint256 internal parentTokenId;
    address internal provider;

    mapping(address => uint256) internal providerMaps;
    address internal tokenCreator;

    constructor(
        address parentToken_,
        uint256 parentTokenId_,
        address provider_
    ) {
        parentToken = parentToken_;
        parentTokenId = parentTokenId_;        
        provider = provider_;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override returns (bool) {
        return
            interfaceId == type(IDerivativeNFT2).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function totalSupply() external view override returns (uint256) {
        return 1_000_000 ether;
    }

    function getOriginalToken()
        external
        view
        override
        returns (address, uint256)
    {
        return (parentToken, parentTokenId);
    }

    function getTokenDetail(
        uint256 tokenId
    ) external view override returns (address, address, uint256) {
        return (provider, parentToken, parentTokenId);
    }

    function getCurrentToken(
        address provider
    ) external view override returns (uint256) {
        return 0;
    }

    function safeMint(
        address to,
        address provider
    ) external payable override returns (uint256) {
        return 0;
    }

    function safeMintAndData(
        address to,
        address provider,
        uint256 openTime,
        uint256 closingTime,
        uint96 feeNumerator
    ) external payable override returns (uint256) {
        return 0;
    }

    function setRoyalties(
        uint256 tokenId,
        uint96 feeNumerator
    ) external override {}

    function setTime(
        uint256 tokenId,
        uint256 openTime,
        uint256 closingTime
    ) external payable override {}

    function getTokenCreator(uint256 tokenId) external view returns (address) {
        return tokenCreator;
    }
}
