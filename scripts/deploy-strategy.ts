import { ethers, upgrades } from "hardhat";
import {
  ExecutionManager,
} from "typechain";

const PROTOCOL_FEE = 100 // in basis point

async function main() {
  let [signer] = await ethers.getSigners();

  const StrategyStandardSaleForFixedPrice = await ethers.getContractFactory("StrategyStandardSaleForFixedPrice");
  const strategyStandardSaleForFixedPrice = await StrategyStandardSaleForFixedPrice.deploy(PROTOCOL_FEE);
  await strategyStandardSaleForFixedPrice.deployed();
  console.log(`StrategyStandardSaleForFixedPrice deployed at address ${strategyStandardSaleForFixedPrice.address}`);

  if (process.env.EXECUTION_MANAGER == undefined || process.env.EXECUTION_MANAGER.length == 0) {
    throw new Error("Missing argument: EXECUTION_MANAGER");
  }

  const executionManager = (await ethers.getContractAt("ExecutionManager", process.env.EXECUTION_MANAGER)) as ExecutionManager;
  const tx = await executionManager.connect(signer).addStrategy(strategyStandardSaleForFixedPrice.address);
  await tx.wait();
  console.log(`StrategyStandardSaleForFixedPrice has been added to ExecutionManager`);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});