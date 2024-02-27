import { ethers, upgrades } from "hardhat";
import { DeployProxyOptions } from "@openzeppelin/hardhat-upgrades/dist/utils";
import {
  TransferManagerERC721,
  TransferManagerERC1155,
  TransferManagerNonCompliantERC721,
  TransferSelectorNFT,
  OrderValidator,
  DareMarket,
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

async function main() {
  let [signer] = await ethers.getSigners();

  if (process.env.MARKETPLACE == undefined || process.env.MARKETPLACE.length == 0) {
    throw new Error("Missing argument: MARKETPLACE");
  }

  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});