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
  DareMarket,
} from "typechain";

const PROTOCOL_FEE = 100 // in basis point

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

async function main() {
  let [signer] = await ethers.getSigners();

  if (process.env.WETH == undefined || process.env.WETH.length == 0 ||
    process.env.CURRENCY_MANAGER == undefined || process.env.CURRENCY_MANAGER.length == 0 ||
    process.env.MARKETPLACE == undefined || process.env.MARKETPLACE.length == 0) {
    throw new Error("Missing argument: WETH | CURRENCY_MANAGER | MARKETPLACE");
  }

  const currencyManager = (await ethers.getContractAt("CurrencyManager", process.env.CURRENCY_MANAGER)) as CurrencyManager;
  const tx = await currencyManager.connect(signer).addCurrency(process.env.WETH);
  await tx.wait();
  console.log(`WETH has been whitelisted to CurrencyManager`);

  const transferManagerERC721 = (await deployUpgradeable(
    "TransferManagerERC721",
    [signer.address, process.env.MARKETPLACE]
  )) as TransferManagerERC721;
  console.log(`TransferManagerERC721 deployed at address ${transferManagerERC721.address}`);

  const transferManagerERC1155 = (await deployUpgradeable(
    "TransferManagerERC1155",
    [signer.address, process.env.MARKETPLACE]
  )) as TransferManagerERC1155;
  console.log(`TransferManagerERC1155 deployed at address ${transferManagerERC1155.address}`);

  const transferManagerNonCompliantERC721 = (await deployUpgradeable(
    "TransferManagerNonCompliantERC721",
    [signer.address, process.env.MARKETPLACE]
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

  // Set TransferSelectorNFT in DareMarket
  const marketplace = (await ethers.getContractAt("DareMarket", process.env.MARKETPLACE)) as DareMarket;
  await marketplace.updateTransferSelectorNFT(transferSelectorNFT.address);

  const orderValidator = (await deployUpgradeable("OrderValidator", [
      signer.address,
      process.env.MARKETPLACE,
  ])) as OrderValidator;
  console.log(`OrderValidator deployed at address ${orderValidator.address}`);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});