import { ethers, upgrades } from "hardhat";

async function main() {
  const currencyManager = process.env.CURRENCY_MANAGER;
  const executionManager = process.env.EXECUTION_MANAGER;
  const royaltyFeeManager = process.env.ROYALTY_FEE_MANAGER;
  const wETH = process.env.WETH;

  if (currencyManager == undefined || currencyManager.length == 0 ||
    executionManager == undefined || executionManager.length == 0 ||
    royaltyFeeManager == undefined || royaltyFeeManager.length == 0 ||
    wETH == undefined || wETH.length == 0) {    
    throw new Error("Missing arguments: \
      CURRENCY_MANAGER=<address> \
      EXECUTION_MANAGER=<address> \
      ROYALTY_FEE_MANAGER=<address> \
      WETH=<address> \
      npx run scripts/deploy-marketplace.ts \
      ");
  }

  const [owner] = await ethers.getSigners();
  const DareMarket = await ethers.getContractFactory("DareMarket");
  const marketplace = await upgrades.deployProxy(DareMarket, [owner.address, currencyManager, executionManager, royaltyFeeManager, wETH, owner.address]);
  console.log("Marketplace is deployed to: ", await marketplace.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});