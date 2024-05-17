import { getChainId } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async ({
    getNamedAccounts,
    deployments,
    ethers,
}: HardhatRuntimeEnvironment) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const currencyManager = await deployments.get("CurrencyManager");
    const executionManager = await deployments.get("ExecutionManager");
    const royaltyFeeManager = await deployments.get("RoyaltyFeeManager");

    const chainId = await getChainId();
    const _WETH = process.env[`WETH_${chainId}_ADDRESS`];

    const PROTOCOL_FEE_ADDRESS =
        process.env[`PROTOCOL_FEE_${chainId}_ADDRESS`] || deployer;

    await deploy("VemoMarket", {
        from: deployer,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            execute: {
                init: {
                    methodName: "initialize",
                    args: [
                        deployer,
                        currencyManager.address,
                        executionManager.address,
                        royaltyFeeManager.address,
                        _WETH,
                        PROTOCOL_FEE_ADDRESS,
                    ],
                }
            },
        },
        log: true,
    });

    // 0x5dB0A1E62e81331d76B06123a3CF16611890720b
    await deployments.execute('CurrencyManager', { from: deployer, log: true }, 'addCurrency', _WETH);
};

func.tags = ["foundation", "vemo-market", "v1"];
func.dependencies = [
    "currency-manager",
    "execution-manager",
    "royalty-fee-manager",
];

export default func;
