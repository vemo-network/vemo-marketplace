import { ethers, upgrades } from "hardhat";

const ROYALTY_FEE_LIMIT = 5000 // in basis point

async function main() {
  let [signer] = await ethers.getSigners();

  const CurrencyManager = await ethers.getContractFactory("CurrencyManager");
  const currencyManager = await upgrades.deployProxy(CurrencyManager, [signer.address]);
  console.log(`CurrencyManager deployed at address ${currencyManager.address}`);

  const ExecutionManager = await ethers.getContractFactory("ExecutionManager");
  const executionManager = await upgrades.deployProxy(ExecutionManager, [signer.address]);
  console.log(`ExecutionManager deployed at address ${executionManager.address}`);

  const RoyaltyFeeRegistry = await ethers.getContractFactory("RoyaltyFeeRegistry");
  const royaltyFeeRegistry = await upgrades.deployProxy(RoyaltyFeeRegistry, [signer.address, executionManager.address]);
  console.log(`RoyaltyFeeRegistry deployed at address ${royaltyFeeRegistry.address}`);

  const RoyaltyFeeManager = await ethers.getContractFactory("RoyaltyFeeManager");
  const royaltyFeeManager = await upgrades.deployProxy(RoyaltyFeeManager, [signer.address, process.env.ROYALTY_FEE_REGISTRY]);
  console.log(`RoyaltyFeeManager deployed at address ${royaltyFeeManager.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});