import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async ({
    getNamedAccounts,
    deployments,
}: HardhatRuntimeEnvironment) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const royaltyFeeRegistry = await deployments.get("RoyaltyFeeRegistry");

    await deploy("RoyaltyFeeManager", {
        from: deployer,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            execute: {
                init: {
                    methodName: "initialize",
                    args: [deployer, royaltyFeeRegistry.address],
                }
            },
        },
        log: true,
    });
};

func.tags = ["foundation", "royalty-fee-manager", "v1"];
func.dependencies = ["royalty-fee-registry"];

export default func;
