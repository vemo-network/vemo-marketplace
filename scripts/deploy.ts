/**
   WETH=0xd00ae08403b9bbb9124bb305c09058e32c39a48c \
   VOUCHER_FACTORY=0x65B903D7903d277bE600B8524a759aBEa3CC7e1A \
   npx hardhat run scripts/deploy.ts --network avax_fuji
 */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, upgrades } from "hardhat";
import { DeployProxyOptions } from "@openzeppelin/hardhat-upgrades/dist/utils";
import {
  ExecutionManager,
  CurrencyManager,
  TransferManagerERC721,
  TransferManagerERC1155,
  TransferManagerNonCompliantERC721,
  TransferSelectorNFT,
  OrderValidator,
  VemoMarket,
} from "typechain";

const ROYALTY_FEE_LIMIT = 5000 // in basis point
const PROTOCOL_FEE = 200 // in basis point

enum ManagerKind {
  CURRENCY_MANAGER,
  EXECUTION_MANAGER,
  ROYALTY_FEE_MANAGER,
  TRANSFER_NFT_SELECTOR,
  ORDER_VALIDATOR,
  STRATEGY_STANDARD_FIXED_PRICE,
  STRATEGY_STANDARD_FIXED_PRICE_VOUCHER,
}

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

async function deployCurrencyManager(signer: SignerWithAddress, wETH: string) {
  const CurrencyManager = await ethers.getContractFactory("CurrencyManager");
  const currencyManager = await upgrades.deployProxy(CurrencyManager, [signer.address]);
  console.log(`CurrencyManager deployed at address ${currencyManager.address}`);

  const tx = await currencyManager.connect(signer).addCurrency(wETH);
  await tx.wait();
  console.log(`WETH has been whitelisted to CurrencyManager`);
  
  return {
    CurrencyManager: currencyManager.address,
    WETH: wETH
  }
}

async function deployExecutionManager(signer: SignerWithAddress) {
  const ExecutionManager = await ethers.getContractFactory("ExecutionManager");
  const executionManager = await upgrades.deployProxy(ExecutionManager, [signer.address]);
  console.log(`ExecutionManager deployed at address ${executionManager.address}`);
  return {
    ExecutionManager: executionManager.address
  }
}

async function deployRoyaltyFeeManager(signer: SignerWithAddress) {
  const RoyaltyFeeRegistry = await ethers.getContractFactory("RoyaltyFeeRegistry");
  const royaltyFeeRegistry = await upgrades.deployProxy(RoyaltyFeeRegistry, [signer.address, ROYALTY_FEE_LIMIT]);
  console.log(`RoyaltyFeeRegistry deployed at address ${royaltyFeeRegistry.address}`);

  const RoyaltyFeeManager = await ethers.getContractFactory("RoyaltyFeeManager");
  const royaltyFeeManager = await upgrades.deployProxy(RoyaltyFeeManager, [signer.address, royaltyFeeRegistry.address]);
  console.log(`RoyaltyFeeManager deployed at address ${royaltyFeeManager.address}`);

  return {
    RoyaltyFeeRegistry: royaltyFeeRegistry.address,
    RoyaltyFeeManager: royaltyFeeManager.address
  }
}

async function deployStrategyStandardFixedPrice(signer: SignerWithAddress, executionManagerContract: string) {
  const StrategyStandardSaleForFixedPrice = await ethers.getContractFactory("StrategyStandardSaleForFixedPrice");
  const strategyStandardSaleForFixedPrice = await StrategyStandardSaleForFixedPrice.deploy(PROTOCOL_FEE);
  await strategyStandardSaleForFixedPrice.deployed();
  console.log(`StrategyStandardSaleForFixedPrice deployed at address ${strategyStandardSaleForFixedPrice.address}`);

  const executionManager = (await ethers.getContractAt("ExecutionManager", executionManagerContract)) as ExecutionManager;
  const tx = await executionManager.connect(signer).addStrategy(strategyStandardSaleForFixedPrice.address);
  await tx.wait();
  console.log(`StrategyStandardSaleForFixedPrice has been added to ExecutionManager`);

  return {
    StrategyStandardSaleForFixedPrice: strategyStandardSaleForFixedPrice.address
  }
}

async function deployStrategyStandardFixedPriceVoucher(signer: SignerWithAddress, executionManagerContract: string, orderValidatorContract: string) {
  const StrategyStandardSaleForFixedPriceVoucher = await ethers.getContractFactory("StrategyStandardSaleForFixedPriceVoucher");
  const strategyStandardSaleForFixedPriceVoucher = await StrategyStandardSaleForFixedPriceVoucher.deploy(PROTOCOL_FEE, orderValidatorContract);
  await strategyStandardSaleForFixedPriceVoucher.deployed();
  console.log(`StrategyStandardSaleForFixedPriceVoucher deployed at address ${strategyStandardSaleForFixedPriceVoucher.address}`);

  const executionManager = (await ethers.getContractAt("ExecutionManager", executionManagerContract)) as ExecutionManager;
  const tx = await executionManager.connect(signer).addStrategy(strategyStandardSaleForFixedPriceVoucher.address);
  await tx.wait();
  console.log(`StrategyStandardSaleForFixedPriceVoucher has been added to ExecutionManager`);

  return {
    StrategyStandardSaleForFixedPriceVoucher: strategyStandardSaleForFixedPriceVoucher.address
  }
}

async function deployOrderValidator(signer: SignerWithAddress, marketplaceContract: string, voucherFactory: string) {
  const orderValidator = (await deployUpgradeable("OrderValidator", [
      signer.address,
      marketplaceContract,
  ])) as OrderValidator;
  console.log(`OrderValidator deployed at address ${orderValidator.address}`);

  const executionManager = (await ethers.getContractAt("OrderValidator", orderValidator.address)) as OrderValidator;
  const tx = await executionManager.connect(signer).setVemoVoucherFactory(voucherFactory);
  await tx.wait();
  console.log(`VoucherFactory ${voucherFactory} has been added to OrderValidator`);

  return {
    OrderValidator: orderValidator.address
  }
}

async function deployTransferNFTSelector(signer: SignerWithAddress, marketplaceContract: string) {
  const transferManagerERC721 = (await deployUpgradeable(
    "TransferManagerERC721",
    [signer.address, marketplaceContract]
  )) as TransferManagerERC721;
  console.log(`TransferManagerERC721 deployed at address ${transferManagerERC721.address}`);

  const transferManagerERC1155 = (await deployUpgradeable(
    "TransferManagerERC1155",
    [signer.address, marketplaceContract]
  )) as TransferManagerERC1155;
  console.log(`TransferManagerERC1155 deployed at address ${transferManagerERC1155.address}`);

  const transferManagerNonCompliantERC721 = (await deployUpgradeable(
    "TransferManagerNonCompliantERC721",
    [signer.address, marketplaceContract]
  )) as TransferManagerNonCompliantERC721;
  console.log(`TransferManagerNonCompliantERC721 deployed at address ${transferManagerNonCompliantERC721.address}`);

  const transferSelectorNFT = (await deployUpgradeable(
    "TransferSelectorNFT",
    [
      signer.address,
      transferManagerERC721.address,
      transferManagerERC1155.address,
    ]
  )) as TransferSelectorNFT;
  console.log(`TransferSelectorNFT deployed at address ${transferSelectorNFT.address}`);

  // Set TransferSelectorNFT in VemoMarket
  const marketplace = (await ethers.getContractAt("VemoMarket", marketplaceContract)) as VemoMarket;
  await marketplace.updateTransferSelectorNFT(transferSelectorNFT.address);

  return {
    TransferSelectorNFT: transferSelectorNFT.address
  }
}

async function main() {
  let [signer] = await ethers.getSigners();

    if (process.env.WETH == undefined || process.env.WETH.length != 42) {
      throw new Error(`Missing argument process.env.WETH`);
    }

    if (process.env.VOUCHER_FACTORY == undefined || process.env.VOUCHER_FACTORY.length != 42) {
      throw new Error(`Missing argument process.env.VOUCHER_FACTORY`);
    }

    let {CurrencyManager, WETH} = await deployCurrencyManager(signer, process.env.WETH);
    let {ExecutionManager} = await deployExecutionManager(signer);
    let {RoyaltyFeeRegistry, RoyaltyFeeManager} = await deployRoyaltyFeeManager(signer);

    const [owner] = await ethers.getSigners();
    const VemoMarket = await ethers.getContractFactory("VemoMarket");
    const marketplace = await upgrades.deployProxy(VemoMarket, [owner.address, CurrencyManager, ExecutionManager, RoyaltyFeeManager, WETH, owner.address]);

    console.log("Marketplace is deployed at address ", marketplace.address);

    let {TransferSelectorNFT} = await deployTransferNFTSelector(signer, marketplace.address);
    
    let {OrderValidator} =  await deployOrderValidator(signer, marketplace.address, process.env.VOUCHER_FACTORY);

    // let {StrategyStandardSaleForFixedPrice} =  deployStrategyStandardFixedPrice(signer, ExecutionManager);
    let {StrategyStandardSaleForFixedPriceVoucher} =  await deployStrategyStandardFixedPriceVoucher(signer, ExecutionManager, OrderValidator);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});