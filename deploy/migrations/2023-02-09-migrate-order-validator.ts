import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const code: DeployFunction = async ({
    deployments,
    getNamedAccounts,
    ethers,
    upgrades,
}: HardhatRuntimeEnvironment) => {
    const { deployer } = await getNamedAccounts();
    const { deploy } = deployments;

    const signer = await ethers.getSigner(deployer);

    await deploy("OrderValidator", {
        from: deployer,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
        },
        log: true,
    });
};

code.tags = ["migrate", "2023-02-09-migrate-order-validator", "v2"];

code.dependencies = [];

export default code;
