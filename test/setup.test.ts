import { assert, expect } from "chai";
import { BigNumber, constants, Contract, utils } from "ethers";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { MakerOrderWithSignature, TakerOrder } from "./helpers/order-types";
import { createMakerOrder, createTakerOrder } from "./helpers/order-helper";
import {
    computeDomainSeparator,
    computeOrderHash,
} from "./helpers/signature-helper";
import { setUp } from "./test-setup";
import { tokenSetUp } from "./token-set-up";
import { increaseTo } from "./helpers/block-traveller";

import dotenv from "dotenv";
dotenv.config();

const { defaultAbiCoder, parseEther } = utils;

describe("Test setup", () => {
    // Mock contracts
    let mockERC721: Contract;
    let mockERC721WithRoyalty: Contract;
    let mockERC1155: Contract;
    let weth: Contract;

    // Exchange contracts
    let transferManagerERC721: Contract;
    let transferManagerERC1155: Contract;
    let vemoMarket: Contract;

    // Strategy contract
    let strategyDutchAuction: Contract;

    // Other global variables
    let standardProtocolFee: BigNumber;
    let royaltyFeeLimit: BigNumber;
    let accounts: SignerWithAddress[];
    let admin: SignerWithAddress;
    let feeRecipient: SignerWithAddress;
    let royaltyCollector: SignerWithAddress;
    let startTimeOrder: BigNumber;
    let endTimeOrder: BigNumber;

    beforeEach(async () => {
        accounts = await ethers.getSigners();
        admin = accounts[0];
        feeRecipient = accounts[19];
        royaltyCollector = accounts[15];
        standardProtocolFee = BigNumber.from("200");
        royaltyFeeLimit = BigNumber.from("9500"); // 95%
        [
            weth,
            mockERC721,
            mockERC1155,
            ,
            mockERC721WithRoyalty,
            ,
            ,
            ,
            transferManagerERC721,
            transferManagerERC1155,
            ,
            vemoMarket,
            ,
            ,
            strategyDutchAuction,
            ,
            ,
            ,
            ,
            ,
            ,
        ] = await setUp(
            admin,
            feeRecipient,
            royaltyCollector,
            standardProtocolFee,
            royaltyFeeLimit
        );

        await tokenSetUp(
            accounts.slice(1, 10),
            weth,
            mockERC721,
            mockERC721WithRoyalty,
            mockERC1155,
            vemoMarket,
            transferManagerERC721,
            transferManagerERC1155
        );

        // Verify the domain separator is properly computed
        assert.equal(
            await vemoMarket.DOMAIN_SEPARATOR(),
            computeDomainSeparator(vemoMarket.address)
        );

        // Set up defaults startTime/endTime (for orders)
        startTimeOrder = BigNumber.from(
            (
                await ethers.provider.getBlock(
                    await ethers.provider.getBlockNumber()
                )
            ).timestamp
        );
        endTimeOrder = startTimeOrder.add(BigNumber.from("1000"));
    });

    it("Test", async () => { });
});
