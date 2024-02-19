import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async ({
    getNamedAccounts,
    deployments,
}: HardhatRuntimeEnvironment) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const dareMarket = await deployments.get("DareMarket");

    await deploy("OrderValidator", {
        from: deployer,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            execute: {
                methodName: "initialize",
                args: [deployer, dareMarket.address],
            },
        },
        log: true,
    });
};

func.tags = ["foundation", "order-validation", "v1"];
func.dependencies = ["dare-market"];
func.runAtTheEnd = true;

export default func;
