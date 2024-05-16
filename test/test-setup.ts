import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DeployProxyOptions } from "@openzeppelin/hardhat-upgrades/dist/utils";
import { BigNumber, constants, Contract } from "ethers";
import { ethers, upgrades } from "hardhat";
import {
    CurrencyManager,
    DareMarket,
    ExecutionManager,
    OrderValidator,
    RoyaltyFeeManager,
    RoyaltyFeeRegistry,
    RoyaltyFeeSetter,
    TransferManagerERC1155,
    TransferManagerERC721,
    TransferManagerNonCompliantERC721,
    TransferSelectorNFT,
} from "typechain";

const deployUpgradeable = async (
    artifactName: string,
    params: any[],
    extra?: DeployProxyOptions
) => {
    const CT = await ethers.getContractFactory(artifactName);
    const deployedCT = await upgrades.deployProxy(CT, params, extra);
    await deployedCT.deployed();
    return deployedCT;
};

export async function setUp(
    admin: SignerWithAddress,
    feeRecipient: SignerWithAddress,
    royaltyCollector: SignerWithAddress,
    standardProtocolFee: BigNumber,
    royaltyFeeLimit: BigNumber
): Promise<any[]> {

    /** 1. Deploy WETH, Mock ERC721, Mock ERC1155, Mock USDT, MockERC721WithRoyalty
     */
    const WETH = await ethers.getContractFactory("WETH");
    const weth = await WETH.deploy();
    await weth.deployed();

    const MockERC721 = await ethers.getContractFactory("MockERC721");
    const mockERC721 = await MockERC721.deploy("Mock ERC721", "MERC721");
    await mockERC721.deployed();
    const MockERC1155 = await ethers.getContractFactory("MockERC1155");
    const mockERC1155 = await MockERC1155.deploy("uri/");
    await mockERC1155.deployed();
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockUSDT = await MockERC20.deploy("USD Tether", "USDT");
    await mockUSDT.deployed();
    const MockERC721WithRoyalty = await ethers.getContractFactory(
        "MockERC721WithRoyalty"
    );
    const mockERC721WithRoyalty = await MockERC721WithRoyalty.connect(
        royaltyCollector
    ).deploy(
        "Mock Royalty ERC721",
        "MRC721",
        "200" // 2% royalty fee
    );
    await mockERC721WithRoyalty.deployed();


    // const NFT2Mock = await ethers.getContractFactory('NFT2Mock');
    // const mockDerivative = await NFT2Mock.deploy();

    /** 2. Deploy ExecutionManager contract and add WETH to whitelisted currencies
     */
    const currencyManager = (await deployUpgradeable("CurrencyManager", [
        admin.address,
    ])) as CurrencyManager;
    await currencyManager.connect(admin).addCurrency(weth.address);

    /** 3. Deploy ExecutionManager contract
     */
    const executionManager = (await deployUpgradeable("ExecutionManager", [
        admin.address,
    ])) as ExecutionManager;

    /** 4. Deploy execution strategy contracts for trade execution
     */
    const StrategyAnyItemFromCollectionForFixedPrice =
        await ethers.getContractFactory(
            "StrategyAnyItemFromCollectionForFixedPrice"
        );
    const strategyAnyItemFromCollectionForFixedPrice =
        await StrategyAnyItemFromCollectionForFixedPrice.deploy(200);
    await strategyAnyItemFromCollectionForFixedPrice.deployed();
    const StrategyAnyItemInASetForFixedPrice = await ethers.getContractFactory(
        "StrategyAnyItemInASetForFixedPrice"
    );
    const strategyAnyItemInASetForFixedPrice =
        await StrategyAnyItemInASetForFixedPrice.deploy(standardProtocolFee);
    await strategyAnyItemInASetForFixedPrice.deployed();

    const StrategyStandardSaleForFixedPriceDNFT = await ethers.getContractFactory(
        "StrategyStandardSaleForFixedPriceDNFT"
    );
    const strategyStandardSaleForFixedPriceDNFT = await StrategyStandardSaleForFixedPriceDNFT.deploy();
    await strategyStandardSaleForFixedPriceDNFT.deployed();

    const StrategyDutchAuction = await ethers.getContractFactory(
        "StrategyDutchAuction"
    );
    const strategyDutchAuction = await StrategyDutchAuction.deploy(
        standardProtocolFee,
        BigNumber.from("900") // 15 minutes
    );
    await strategyDutchAuction.deployed();
    const StrategyPrivateSale = await ethers.getContractFactory(
        "StrategyPrivateSale"
    );
    const strategyPrivateSale = await StrategyPrivateSale.deploy(
        constants.Zero
    );
    await strategyPrivateSale.deployed();
    const StrategyStandardSaleForFixedPrice = await ethers.getContractFactory(
        "StrategyStandardSaleForFixedPrice"
    );
    const strategyStandardSaleForFixedPrice =
        await StrategyStandardSaleForFixedPrice.deploy(standardProtocolFee);
    await strategyStandardSaleForFixedPrice.deployed();

    // Whitelist these six strategies
    await executionManager
        .connect(admin)
        .addStrategy(strategyStandardSaleForFixedPrice.address);
    await executionManager
        .connect(admin)
        .addStrategy(strategyAnyItemFromCollectionForFixedPrice.address);
    await executionManager
        .connect(admin)
        .addStrategy(strategyAnyItemInASetForFixedPrice.address);
    await executionManager
        .connect(admin)
        .addStrategy(strategyDutchAuction.address);
    await executionManager
        .connect(admin)
        .addStrategy(strategyPrivateSale.address);
    await executionManager.connect(admin)
        .addStrategy(strategyStandardSaleForFixedPriceDNFT.address);

    /** 5. Deploy RoyaltyFee Registry/Setter/Manager
     */
    const royaltyFeeRegistry = (await deployUpgradeable("RoyaltyFeeRegistry", [
        admin.address,
        royaltyFeeLimit,
    ])) as RoyaltyFeeRegistry;

    const royaltyFeeSetter = (await deployUpgradeable("RoyaltyFeeSetter", [
        admin.address,
        royaltyFeeRegistry.address,
    ])) as RoyaltyFeeSetter;

    const royaltyFeeManager = (await deployUpgradeable("RoyaltyFeeManager", [
        admin.address,
        royaltyFeeRegistry.address,
    ])) as RoyaltyFeeManager;
    // Transfer INTERACTABLE_ROLE of RoyaltyFeeRegistry to RoyaltyFeeSetter
    await royaltyFeeRegistry
        .connect(admin)
        .grantRole(
            await royaltyFeeRegistry.INTERACTABLE_ROLE(),
            royaltyFeeSetter.address
        );

    /** 6. Deploy DareMarket contract
     */

    const dareMarket = (await deployUpgradeable("DareMarket", [
        admin.address,
        currencyManager.address,
        executionManager.address,
        royaltyFeeManager.address,
        weth.address,
        feeRecipient.address,
    ])) as DareMarket;

    /** 6. Deploy TransferManager contracts and TransferSelector
     */
    const transferManagerERC721 = (await deployUpgradeable(
        "TransferManagerERC721",
        [admin.address, dareMarket.address]
    )) as TransferManagerERC721;

    const transferManagerERC1155 = (await deployUpgradeable(
        "TransferManagerERC1155",
        [admin.address, dareMarket.address]
    )) as TransferManagerERC1155;

    const transferManagerNonCompliantERC721 = (await deployUpgradeable(
        "TransferManagerNonCompliantERC721",
        [admin.address, dareMarket.address]
    )) as TransferManagerNonCompliantERC721;

    const transferSelectorNFT = (await deployUpgradeable(
        "TransferSelectorNFT",
        [
            admin.address,
            transferManagerERC721.address,
            transferManagerERC1155.address,
        ]
    )) as TransferSelectorNFT;

    // Set TransferSelectorNFT in DareMarket
    await dareMarket
        .connect(admin)
        .updateTransferSelectorNFT(transferSelectorNFT.address);

    const orderValidator = (await deployUpgradeable("OrderValidator", [
        admin.address,
        dareMarket.address,
    ])) as OrderValidator;

    const MockVoucherFactory = await ethers.getContractFactory("MockVoucherFactory");
    const vemoVoucherFactory = await MockVoucherFactory.deploy();
    await vemoVoucherFactory.deployed();

    /** Return contracts
     */
    return [
        weth,
        mockERC721,
        mockERC1155,
        mockUSDT,
        mockERC721WithRoyalty,
        currencyManager,
        executionManager,
        transferSelectorNFT,
        transferManagerERC721,
        transferManagerERC1155,
        transferManagerNonCompliantERC721,
        dareMarket,
        strategyStandardSaleForFixedPrice,
        strategyAnyItemFromCollectionForFixedPrice,
        strategyDutchAuction,
        strategyPrivateSale,
        strategyAnyItemInASetForFixedPrice,
        strategyStandardSaleForFixedPriceDNFT,
        royaltyFeeRegistry,
        royaltyFeeManager,
        royaltyFeeSetter,
        orderValidator,
        vemoVoucherFactory

        // mockDerivative,
    ];
}
