import { BigNumber, constants, Contract, utils } from "ethers";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MakerOrderWithSignature } from "./helpers/order-types";
import { createMakerOrder } from "./helpers/order-helper";
import { setUp } from "./test-setup";
import { tokenSetUp } from "./token-set-up";
import {
    ERC6551_BALANCE_NOT_CORRECT,
    INVALID_ERC6551_ASSETS_INPUTS,
} from "./helpers/configErrorCodes";
import {
    assertErrorCode,
    assertMultipleOrdersValid,
    assertOrderValid,
} from "./helpers/order-validation-helper";
import { MockERC20, MockVoucherFactory, OrderValidator } from "typechain";

const { defaultAbiCoder, parseEther } = utils;

describe("OrderValidator - ERC6551 standard", () => {
    let mockERC721: Contract;
    let mockERC721WithRoyalty: Contract;
    let mockERC1155: Contract;
    let weth: Contract;
    let mockUSDT: MockERC20;
    let vemoVoucherFactory: MockVoucherFactory;

    // Exchange contracts
    let transferManagerERC721: Contract;
    let transferManagerERC1155: Contract;
    let transferManagerNonCompliantERC721: Contract;
    let transferSelectorNFT: Contract;
    let royaltyFeeSetter: Contract;
    let dareMarket: Contract;
    let orderValidator: OrderValidator;

    // Strategy contracts (used for this test file)
    let strategyStandardSaleForFixedPrice: Contract;
    let strategyAnyItemFromCollectionForFixedPrice: Contract;

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
            mockUSDT,
            mockERC721WithRoyalty,
            ,
            ,
            transferSelectorNFT,
            transferManagerERC721,
            transferManagerERC1155,
            transferManagerNonCompliantERC721,
            dareMarket,
            strategyStandardSaleForFixedPrice,
            strategyAnyItemFromCollectionForFixedPrice,
            ,
            ,
            ,
            ,
            ,
            ,
            royaltyFeeSetter,
            orderValidator,
            vemoVoucherFactory
        ] = await setUp(
            admin,
            feeRecipient,
            royaltyCollector,
            standardProtocolFee,
            royaltyFeeLimit
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

    it("allow blank TBA assets", async () => {
        await tokenSetUp(
            accounts.slice(1, 10),
            weth,
            mockERC721,
            mockERC721WithRoyalty,
            mockERC1155,
            dareMarket,
            transferManagerERC721,
            transferManagerERC1155
        );

        const makerUser = accounts[1];

        const makerBidOrder = await createMakerOrder({
            isOrderAsk: false,
            signer: makerUser.address,
            collection: mockERC721.address,
            tokenId: constants.Zero,
            price: parseEther("3"),
            amount: constants.One,
            strategy: strategyAnyItemFromCollectionForFixedPrice.address,
            currency: weth.address,
            nonce: constants.Zero,
            startTime: startTimeOrder,
            endTime: endTimeOrder,
            minPercentageToAsk: constants.Zero,
            params: defaultAbiCoder.encode([], []),
            signerUser: makerUser,
            verifyingContract: dareMarket.address,
            boundTokens: [],
            boundAmounts: []
        });

        const makerAskOrder: MakerOrderWithSignature = await createMakerOrder({
            isOrderAsk: true,
            signer: makerUser.address,
            collection: mockERC721.address,
            price: parseEther("3"),
            tokenId: constants.Zero,
            amount: constants.One,
            strategy: strategyStandardSaleForFixedPrice.address,
            currency: weth.address,
            nonce: constants.Zero,
            startTime: startTimeOrder,
            endTime: endTimeOrder,
            minPercentageToAsk: constants.Zero,
            params: defaultAbiCoder.encode([], []),
            signerUser: makerUser,
            verifyingContract: dareMarket.address,
            boundTokens: [],
            boundAmounts: []
        });

        await orderValidator.setVemoVoucherFactory(vemoVoucherFactory.address);
        await assertOrderValid(makerBidOrder, orderValidator);
        await assertMultipleOrdersValid([makerBidOrder, makerAskOrder], orderValidator)
    });

    it("invalid TBA assets balance", async () => {
        await tokenSetUp(
            accounts.slice(1, 10),
            weth,
            mockERC721,
            mockERC721WithRoyalty,
            mockERC1155,
            dareMarket,
            transferManagerERC721,
            transferManagerERC1155
        );

        const makerUser = accounts[1];
        const vemoTBA = accounts[2];
        const tbaAsset = mockUSDT.address;
        const tbaAmount = BigNumber.from("1000000");

        // 1. Collection order
        const makerBidOrder = await createMakerOrder({
            isOrderAsk: false,
            signer: makerUser.address,
            collection: mockERC721.address,
            tokenId: constants.Zero,
            price: parseEther("3"),
            amount: constants.One,
            strategy: strategyAnyItemFromCollectionForFixedPrice.address,
            currency: weth.address,
            nonce: constants.Zero,
            startTime: startTimeOrder,
            endTime: endTimeOrder,
            minPercentageToAsk: constants.Zero,
            params: defaultAbiCoder.encode([], []),
            signerUser: makerUser,
            verifyingContract: dareMarket.address,
            boundTokens: [],
            boundAmounts: [tbaAmount]
        });

        await orderValidator.setVemoVoucherFactory(vemoVoucherFactory.address);

        await assertErrorCode(
            makerBidOrder,
            INVALID_ERC6551_ASSETS_INPUTS,
            orderValidator
        );
        
        // make the input correct format
        makerBidOrder.boundTokens.push(tbaAsset);

        // create a tba and transfer some fund
        await vemoVoucherFactory.setTokenBoundAccount(makerBidOrder.collection, makerBidOrder.tokenId, vemoTBA.address);
        
        await assertErrorCode(
            makerBidOrder,
            ERC6551_BALANCE_NOT_CORRECT,
            orderValidator
        );
        
        await mockUSDT.mint(vemoTBA.address, tbaAmount.sub(constants.One));

        await assertErrorCode(
            makerBidOrder,
            ERC6551_BALANCE_NOT_CORRECT,
            orderValidator
        );

        await mockUSDT.mint(vemoTBA.address, constants.One);

        await assertOrderValid(makerBidOrder, orderValidator);
    });

});
