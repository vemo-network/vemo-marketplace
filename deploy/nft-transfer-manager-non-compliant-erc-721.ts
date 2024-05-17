import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async ({
    getNamedAccounts,
    deployments,
}: HardhatRuntimeEnvironment) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const vemoMarket = await deployments.get("VemoMarket");

    await deploy("TransferManagerERC1155", {
        from: deployer,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            execute: {
                methodName: "initialize",
                args: [deployer, vemoMarket.address],
            },
        },
        log: true,
    });
};

func.tags = ["foundation", "nft-transfer-manager-non-compliant-erc-721", "v1"];
func.dependencies = ["vemo-market"];

export default func;
