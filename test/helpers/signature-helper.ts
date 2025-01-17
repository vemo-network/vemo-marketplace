import { BigNumber, utils, Wallet, ethers } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
/* eslint-disable node/no-extraneous-import */
import { TypedDataDomain } from "@ethersproject/abstract-signer";
/* eslint-disable node/no-extraneous-import */
import { Signature } from "@ethersproject/bytes";
/* eslint-disable node/no-extraneous-import */
import { _TypedDataEncoder } from "@ethersproject/hash";
import { MakerOrder } from "./order-types";
import { findPrivateKey } from "./hardhat-keys";

const { defaultAbiCoder, keccak256, solidityPack } = utils;

const DOMAIN_NAME = "VemoMarket";
const DOMAIN_VERSION = "1";
const DOMAIN_CHAIN_ID = "31337"; // HRE

/**
 * Generate a signature used to generate v, r, s parameters
 * @param signer signer
 * @param types solidity types of the value param
 * @param values params to be sent to the Solidity function
 * @param verifyingContract verifying contract address ("VemoMarket")
 * @returns splitted signature
 * @see https://docs.ethers.io/v5/api/signer/#Signer-signTypedData
 */
const signTypedData = async (
    signer: SignerWithAddress,
    types: string[],
    values: (string | boolean | BigNumber)[],
    verifyingContract: string
): Promise<Signature> => {
    let domainSeparator = computeDomainSeparator(verifyingContract);
    if (process.env.CHAIN_ID != undefined && process.env.CHAIN_ID.length > 0){
      domainSeparator = computeDomainSeparatorWithChainId(verifyingContract, process.env.CHAIN_ID);
    }

    // https://docs.ethers.io/v5/api/utils/abi/coder/#AbiCoder--methods
    const hash = keccak256(defaultAbiCoder.encode(types, values));

    // Compute the digest
    const digest = keccak256(
        solidityPack(
            ["bytes1", "bytes1", "bytes32", "bytes32"],
            ["0x19", "0x01", domainSeparator, hash]
        )
    );

    const adjustedSigner = new Wallet(findPrivateKey(signer.address));
    return { ...adjustedSigner._signingKey().signDigest(digest) };
};

export const computeDomainSeparator = (verifyingContract: string): string => {
    const domain: TypedDataDomain = {
        name: DOMAIN_NAME,
        version: DOMAIN_VERSION,
        chainId: DOMAIN_CHAIN_ID,
        verifyingContract: verifyingContract,
    };

    return _TypedDataEncoder.hashDomain(domain);
};

export const computeDomainSeparatorWithChainId = (verifyingContract: string, chainId: string): string => {
  const domain: TypedDataDomain = {
      name: DOMAIN_NAME,
      version: DOMAIN_VERSION,
      chainId,
      verifyingContract: verifyingContract,
  };

  return _TypedDataEncoder.hashDomain(domain);
};

/**
 * Compute order hash for a maker order
 * @param order MakerOrder
 * @returns hash
 */
export const computeOrderHash = (order: MakerOrder): string => {
    const types = [
        "bytes32",
        "bool",
        "address",
        "address",
        "uint256",
        "uint256",
        "uint256",
        "address",
        "address",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "bytes32",
    ];

    const boundTokensPacked = ethers.utils.solidityPack(["address[]"], [order.boundTokens]);
    const boundAmountsPacked = ethers.utils.solidityPack(["uint256[]"], [order.boundAmounts]);

    // Combine all the packed components and hash them
    const orderMetaData = ethers.utils.keccak256(
        ethers.utils.solidityPack(
            ["bytes", "bytes", "bytes"],
            [order.params, boundTokensPacked, boundAmountsPacked]
        )
    );

    const values = [
        "0x3fb2dfd3d0e414a3db1acdd93e4de79850b574cd57aef7eef2d320556df2bdaa", // maker order hash (from Solidity)
        order.isOrderAsk,
        order.signer,
        order.collection,
        order.price,
        order.tokenId,
        order.amount,
        order.strategy,
        order.currency,
        order.nonce,
        order.startTime,
        order.endTime,
        order.minPercentageToAsk,
        orderMetaData,
    ];

    return keccak256(defaultAbiCoder.encode(types, values));
};

/**
 * Create a signature for a maker order
 * @param signer signer for the order
 * @param verifyingContract verifying contract address
 * @param order see MakerOrder definition
 * @returns splitted signature
 */
export const signMakerOrder = (
    signer: SignerWithAddress,
    verifyingContract: string,
    order: MakerOrder
): Promise<Signature> => {
    const types = [
        "bytes32",
        "bool",
        "address",
        "address",
        "uint256",
        "uint256",
        "uint256",
        "address",
        "address",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "bytes32",
    ];

    const boundTokensPacked = ethers.utils.solidityPack(["address[]"], [order.boundTokens]);
    const boundAmountsPacked = ethers.utils.solidityPack(["uint256[]"], [order.boundAmounts]);

    // Combine all the packed components and hash them
    const orderMetaData = ethers.utils.keccak256(
        ethers.utils.solidityPack(
            ["bytes", "bytes", "bytes"],
            [order.params, boundTokensPacked, boundAmountsPacked]
        )
    );

    const values = [
        "0x3fb2dfd3d0e414a3db1acdd93e4de79850b574cd57aef7eef2d320556df2bdaa",
        order.isOrderAsk,
        order.signer,
        order.collection,
        order.price,
        order.tokenId,
        order.amount,
        order.strategy,
        order.currency,
        order.nonce,
        order.startTime,
        order.endTime,
        order.minPercentageToAsk,
        orderMetaData,
    ];

    return signTypedData(signer, types, values, verifyingContract);
};
