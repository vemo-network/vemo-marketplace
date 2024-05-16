import { ethers, upgrades } from "hardhat";

async function main() {
  const proxyAddress = process.env.PROXY_ADDRESS || "";

  if (proxyAddress == undefined || proxyAddress.length == 0 ) {    
    throw new Error("Missing arguments: \
      PROXY_ADDRESS=<address> \
      npx run scripts/upgrade-marketplace.ts \
      ");
  }

  const DareMarket = await ethers.getContractFactory("DareMarket");
  const upgraded =  await upgrades.upgradeProxy(proxyAddress, DareMarket);
  console.log('Proxy has been upgraded to:', upgraded.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});