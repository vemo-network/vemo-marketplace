import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async ({
    getNamedAccounts,
    deployments,
}: HardhatRuntimeEnvironment) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const dareMarket = await deployments.get("DareMarket");

    await deploy("TransferManagerERC721", {
        from: deployer,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            execute: {
                init: {
                    methodName: "initialize",
                    args: [deployer, dareMarket.address],
                }
            },
        },
        log: true,
    });
};

func.tags = ["foundation", "nft-transfer-manager-erc-721", "v1"];
func.dependencies = ["dare-market"];

export default func;
