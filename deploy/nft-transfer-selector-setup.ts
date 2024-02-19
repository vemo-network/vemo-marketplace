import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async ({
    getNamedAccounts,
    deployments,
}: HardhatRuntimeEnvironment) => {
    const { deploy, execute, read } = deployments;
    const { deployer } = await getNamedAccounts();

    const transferSelectorNFT = await deployments.get("TransferSelectorNFT");

    await execute(
        "DareMarket",
        { from: deployer, log: true },
        "updateTransferSelectorNFT",
        transferSelectorNFT.address
    );
};

func.tags = ["foundation", "nft-transfer-selector-setup", "v1"];
func.dependencies = ["nft-transfer-selector"];
func.runAtTheEnd = true;

export default func;
