import { assert, expect } from "chai";
import { BigNumber, constants, Contract, utils } from "ethers";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MerkleTree } from "merkletreejs";
/* eslint-disable node/no-extraneous-import */
import { keccak256 } from "js-sha3";
import {
    ERC6551_BALANCE_NOT_CORRECT,
    INVALID_ERC6551_ASSETS_INPUTS,
} from "./helpers/configErrorCodes";
import { MakerOrderWithSignature } from "./helpers/order-types";
import { createMakerOrder, createTakerOrder } from "./helpers/order-helper";
import {
    computeDomainSeparator,
    computeOrderHash,
} from "./helpers/signature-helper";
import { setUp } from "./test-setup";
import { tokenSetUp } from "./token-set-up";
import { MockERC20, MockVoucherFactory, OrderValidator, StrategyStandardSaleForFixedPriceVoucher } from "typechain";
import {
    assertErrorCode,
    assertOrderValid,
} from "./helpers/order-validation-helper";
import { boolean } from "hardhat/internal/core/params/argumentTypes";

const { defaultAbiCoder, parseEther } = utils;

describe("Strategy - Fixed price for ERC6551 assets", () => {
    // Mock contracts
    let mockERC721: Contract;
    let mockERC721WithRoyalty: Contract;
    let mockERC1155: Contract;
    let mockUSDT: MockERC20;
    let weth: Contract;
    let vemoVoucherFactory: MockVoucherFactory;
    let orderValidator: OrderValidator;
    let strategyStandardSaleForFixedPriceVoucher: StrategyStandardSaleForFixedPriceVoucher;

    // Exchange contracts
    let transferManagerERC721: Contract;
    let transferManagerERC1155: Contract;
    let vemoMarket: Contract;

    // Strategy contract

    // Other global variables
    let standardProtocolFee: BigNumber;
    let royaltyFeeLimit: BigNumber;
    let accounts: SignerWithAddress[];
    let admin: SignerWithAddress;
    let feeRecipient: SignerWithAddress;
    let royaltyCollector: SignerWithAddress;
    let startTimeOrder: BigNumber;
    let endTimeOrder: BigNumber;

    // 6551 info
    let vemoTBA: SignerWithAddress;

    beforeEach(async () => {
        accounts = await ethers.getSigners();
        admin = accounts[0];
        vemoTBA = accounts[2];
        feeRecipient = accounts[19];
        royaltyCollector = accounts[15];
        standardProtocolFee = BigNumber.from("200");
        royaltyFeeLimit = BigNumber.from("9500"); // 95%
        [
            weth,
            mockERC721,
            mockERC1155,
            mockUSDT,
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
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            orderValidator,
            vemoVoucherFactory,
            strategyStandardSaleForFixedPriceVoucher
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
        
        await orderValidator.setVemoVoucherFactory(vemoVoucherFactory.address);
    });

    it("ERC721 - with TBA - MakerBid order is matched by TakerAsk order", async () => {
        const takerAskUser = accounts[3]; // has tokenId=2
        const makerBidUser = accounts[1];

        const tbaAsset = mockUSDT.address;
        const tbaAmount = BigNumber.from("1000000");
        await mockERC721.mint(makerBidUser.address);

        const makerBidOrder: MakerOrderWithSignature = await createMakerOrder({
            isOrderAsk: false,
            signer: makerBidUser.address,
            collection: mockERC721.address,
            tokenId: constants.Zero,
            price: parseEther("3"),
            amount: constants.One,
            strategy: strategyStandardSaleForFixedPriceVoucher.address,
            currency: weth.address,
            nonce: constants.Zero,
            startTime: startTimeOrder,
            endTime: endTimeOrder,
            minPercentageToAsk: constants.Zero,
            params: defaultAbiCoder.encode([], []),
            signerUser: makerBidUser,
            verifyingContract: vemoMarket.address,
            boundTokens: [tbaAsset],
            boundAmounts: [tbaAmount]
        });

        const takerAskOrder = createTakerOrder({
            isOrderAsk: true,
            taker: takerAskUser.address,
            tokenId: constants.Zero,
            price: makerBidOrder.price,
            minPercentageToAsk: constants.Zero,
            params: defaultAbiCoder.encode([], []),
        });

        await vemoVoucherFactory.setTokenBoundAccount(makerBidOrder.collection, makerBidOrder.tokenId, vemoTBA.address);
        await mockUSDT.mint(vemoTBA.address, tbaAmount.sub(constants.One));
        
        // validate by ordervalidator first
        await assertErrorCode(
            makerBidOrder,
            ERC6551_BALANCE_NOT_CORRECT,
            orderValidator
        );
        let result = await strategyStandardSaleForFixedPriceVoucher.canExecuteTakerAsk(takerAskOrder, makerBidOrder);
        await expect(result[0]).to.be.false;

        result = await strategyStandardSaleForFixedPriceVoucher.canExecuteTakerBid(takerAskOrder, makerBidOrder);
        await expect(result[0]).to.be.false;
        
        // make the seller enough condition to sell the nft
        await mockUSDT.mint(vemoTBA.address, constants.One);
        await assertOrderValid(makerBidOrder, orderValidator);
        
        result = await strategyStandardSaleForFixedPriceVoucher.canExecuteTakerAsk(takerAskOrder, makerBidOrder);
        await expect(result[0]).to.be.true;

        result = await strategyStandardSaleForFixedPriceVoucher.canExecuteTakerBid(takerAskOrder, makerBidOrder);
        await expect(result[0]).to.be.true;

    });

    it("Cannot match if wrong side", async () => {
        const makerAskUser = accounts[1];
        const takerBidUser = accounts[2];

        const makerAskOrder = await createMakerOrder({
            isOrderAsk: true,
            signer: makerAskUser.address,
            collection: mockERC721.address,
            tokenId: constants.Zero,
            price: parseEther("3"),
            amount: constants.One,
            strategy: strategyStandardSaleForFixedPriceVoucher.address,
            currency: weth.address,
            nonce: constants.Zero,
            startTime: startTimeOrder,
            endTime: endTimeOrder,
            minPercentageToAsk: constants.Zero,
            params: defaultAbiCoder.encode([], []), // these parameters are used after it reverts
            signerUser: makerAskUser,
            verifyingContract: vemoMarket.address,
            boundTokens: [],
            boundAmounts: []
        });

        const takerBidOrder = {
            isOrderAsk: false,
            taker: takerBidUser.address,
            tokenId: makerAskOrder.tokenId,
            price: makerAskOrder.price,
            minPercentageToAsk: constants.Zero,
            params: defaultAbiCoder.encode([], []),
            boundTokens: [],
            boundAmounts: []
        };

        await expect(
            vemoMarket
                .connect(takerBidUser)
                .matchAskWithTakerBid(takerBidOrder, makerAskOrder)
        ).to.be.revertedWith("Strategy: Execution invalid");
    });
});
