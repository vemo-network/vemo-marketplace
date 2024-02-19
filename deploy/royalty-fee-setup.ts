import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async ({
    getNamedAccounts,
    deployments,
}: HardhatRuntimeEnvironment) => {
    const { execute, read } = deployments;
    const { deployer } = await getNamedAccounts();

    const royaltyFeeSetter = await deployments.get("RoyaltyFeeSetter");

    const INTERACTABLE_ROLE = await read(
        "RoyaltyFeeRegistry",
        { from: deployer },
        "INTERACTABLE_ROLE"
    );

    await execute(
        "RoyaltyFeeRegistry",
        { from: deployer, log: true },
        "grantRole",
        INTERACTABLE_ROLE,
        royaltyFeeSetter.address
    );
};

func.tags = ["foundation", "royalty-fee-setup", "v1"];
func.dependencies = ["royalty-fee-setter", "royalty-fee-registry"];

export default func;
