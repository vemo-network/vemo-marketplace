import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async ({
    getNamedAccounts,
    deployments,
}: HardhatRuntimeEnvironment) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const ROYALTY_FEE_LIMIT = process.env.ROYALTY_FEE_LIMIT || "100";

    await deploy("RoyaltyFeeRegistry", {
        from: deployer,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            execute: {
                init: {
                    methodName: "initialize",
                    args: [deployer, ROYALTY_FEE_LIMIT],
                }
            },
        },
        log: true,
    });
};

func.tags = ["foundation", "royalty-fee-registry", "v1"];

export default func;
