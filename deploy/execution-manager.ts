import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async ({
    getNamedAccounts,
    deployments,
}: HardhatRuntimeEnvironment) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    await deploy("ExecutionManager", {
        from: deployer,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            execute: {
                methodName: "initialize",
                args: [deployer],
            },
        },
        log: true,
    });
};

func.tags = ["foundation", "execution-manager", "v1"];

export default func;
