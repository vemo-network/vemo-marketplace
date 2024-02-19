import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async ({
    getNamedAccounts,
    deployments,
}: HardhatRuntimeEnvironment) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const transferManagerERC721 = await deployments.get(
        "TransferManagerERC721"
    );
    const transferManagerERC1155 = await deployments.get(
        "TransferManagerERC1155"
    );

    await deploy("TransferSelectorNFT", {
        from: deployer,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            execute: {
                methodName: "initialize",
                args: [
                    deployer,
                    transferManagerERC721.address,
                    transferManagerERC1155.address,
                ],
            },
        },
        log: true,
    });
};

func.tags = ["foundation", "nft-transfer-selector", "v1"];
func.dependencies = ["nft-transfer-manager-erc-721", "nft-transfer-manager-erc-1155"];

export default func;
