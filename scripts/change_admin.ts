import { ethers, upgrades } from "hardhat";

async function main() {
    const newAdmin = process.env.NEW_ADMIN;
    const proxyAddress = process.env.PROXY_ADDRESS || "";
    const [deployer] = await ethers.getSigners();

    console.log("signer ----------- ", deployer.address);

    if (newAdmin == undefined || newAdmin.length == 0 ||
        proxyAddress == undefined || proxyAddress.length == 0
    ) {
        throw new Error("Missing arguments: \
    PROXY_ADDRESS=<address> \
      npx run scripts/upgrade-marketplace.ts \
      ");
    }

    const proxyAdmin = await upgrades.admin.getInstance(); 
    const implementationAddress = await proxyAdmin.getProxyImplementation(proxyAddress);
    console.log("proxy owner ", await proxyAdmin.owner())
    console.log("Implementation Address:", implementationAddress);

    // console.log(proxyAdmin);
    await proxyAdmin.changeProxyAdmin(proxyAddress, newAdmin, { from: deployer.address });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

