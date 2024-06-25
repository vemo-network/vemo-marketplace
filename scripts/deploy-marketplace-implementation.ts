import { ethers, upgrades } from "hardhat";

async function main() {
  // const proxyAddress = process.env.PROXY_ADDRESS || "";

  // if (proxyAddress == undefined || proxyAddress.length == 0 ) {    
  //   throw new Error("Missing arguments: \
  //     PROXY_ADDRESS=<address> \
  //     npx run scripts/upgrade-marketplace.ts \
  //     ");
  // }

  const VemoMarket = await ethers.getContractFactory("VemoMarket");
  const implementation = await VemoMarket.deploy();
  await implementation.deployed();

  console.log(`VemoMarket deployed at address ${implementation.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});