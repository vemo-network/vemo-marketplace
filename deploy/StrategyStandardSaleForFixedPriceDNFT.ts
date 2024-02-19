import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async ({ getNamedAccounts, deployments }: HardhatRuntimeEnvironment) => {
    const { deploy, execute, read } = deployments;
    const { deployer } = await getNamedAccounts();

    const strategy = await deploy('StrategyStandardSaleForFixedPriceDNFT', {
        from: deployer,
        args: [],
        log: true
    });

    // addStrategy
    const isStrategyWhitelisted = await read('ExecutionManager', 'isStrategyWhitelisted', strategy.address);
    if (!isStrategyWhitelisted) {
        await execute(
            'ExecutionManager',
            { from: deployer, log: true },
            'addStrategy',
            strategy.address
        );
    }
}

func.tags = ['StrategyStandardSaleForFixedPriceDNFT', 'v1'];
func.dependencies = ['execution-manager'];

export default func;
