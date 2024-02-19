import { task } from "hardhat/config";

import { CurrencyManagerV2 } from "../../typechain";
import { formatEther } from "ethers/lib/utils";

task("test-currency-manager")
    .setDescription("test-currency-manager")
    .setAction(async (args, { ethers, upgrades, getNamedAccounts }) => {
        const { deployer } = await getNamedAccounts();
        const signer = await ethers.getSigner(deployer);

        const cur = (await ethers.getContract(
            "CurrencyManagerV2",
            signer
        )) as CurrencyManagerV2;

        const hello = await cur.greeting();

        console.log(hello);
    });

export default {
    solidity: "0.8.7",
};
