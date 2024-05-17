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
}

async function deployExecutionManager(signer: SignerWithAddress) {
  const ExecutionManager = await ethers.getContractFactory("ExecutionManager");
  const executionManager = await upgrades.deployProxy(ExecutionManager, [signer.address]);
  console.log(`ExecutionManager deployed at address ${executionManager.address}`);
}

async function deployRoyaltyFeeManager(signer: SignerWithAddress) {
  const RoyaltyFeeRegistry = await ethers.getContractFactory("RoyaltyFeeRegistry");
  const royaltyFeeRegistry = await upgrades.deployProxy(RoyaltyFeeRegistry, [signer.address, ROYALTY_FEE_LIMIT]);
  console.log(`RoyaltyFeeRegistry deployed at address ${royaltyFeeRegistry.address}`);

  const RoyaltyFeeManager = await ethers.getContractFactory("RoyaltyFeeManager");
  const royaltyFeeManager = await upgrades.deployProxy(RoyaltyFeeManager, [signer.address, royaltyFeeRegistry.address]);
  console.log(`RoyaltyFeeManager deployed at address ${royaltyFeeManager.address}`);
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
}

async function deployOrderValidator(signer: SignerWithAddress, marketplaceContract: string) {
  const orderValidator = (await deployUpgradeable("OrderValidator", [
      signer.address,
      marketplaceContract,
  ])) as OrderValidator;
  console.log(`OrderValidator deployed at address ${orderValidator.address}`);
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
}

async function main() {
  let [signer] = await ethers.getSigners();
  const kind = process.env.IMPLEMENTATION;

  switch (Number(kind)) {
    case ManagerKind.CURRENCY_MANAGER: {
      if (process.env.WETH == undefined || process.env.WETH.length != 42) {
        throw new Error(`Missing argument process.env.WETH`);
        break;
      }
      deployCurrencyManager(signer, process.env.WETH);
      break
    }
    case ManagerKind.EXECUTION_MANAGER: {
      deployExecutionManager(signer);
      break
    }
    case ManagerKind.ROYALTY_FEE_MANAGER: {      
      deployRoyaltyFeeManager(signer);
      break
    }
    case ManagerKind.TRANSFER_NFT_SELECTOR: {
      if (process.env.MARKETPLACE == undefined || process.env.MARKETPLACE.length != 42) {
        throw new Error(`Missing argument process.env.MARKETPLACE`);
        break;
      }
      deployTransferNFTSelector(signer, process.env.MARKETPLACE);
      break
    }
    case ManagerKind.ORDER_VALIDATOR: {
      if (process.env.MARKETPLACE == undefined || process.env.MARKETPLACE.length != 42) {
        throw new Error(`Missing argument process.env.MARKETPLACE`);
        break;
      }
      deployOrderValidator(signer, process.env.MARKETPLACE);
      break
    }
    case ManagerKind.STRATEGY_STANDARD_FIXED_PRICE: {
      if (process.env.EXECUTION_MANAGER == undefined || process.env.EXECUTION_MANAGER.length != 42) {
        throw new Error(`Missing argument process.env.EXECUTION_MANAGER`);
        break;
      }
      deployStrategyStandardFixedPrice(signer, process.env.EXECUTION_MANAGER);
      break
    }
    default: {
      throw new Error(`Kind ${kind} is not supported`);
      break;
    }
  }  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});