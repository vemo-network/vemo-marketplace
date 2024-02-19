/**
 * @type import('hardhat/config').HardhatUserConfig
 */

import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-solhint";
import "@nomiclabs/hardhat-web3";
import "@typechain/hardhat";
import "hardhat-deploy";
import "solidity-coverage";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-gas-reporter";
import "@nomicfoundation/hardhat-chai-matchers";
import "hardhat-abi-exporter";
import { removeConsoleLog } from "hardhat-preprocessor";
import { TASK_COMPILE, TASK_TEST } from "hardhat/builtin-tasks/task-names";
import { EthGasReporterConfig } from "hardhat-gas-reporter/dist/src/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { HardhatUserConfig } from "hardhat/types";

import { accounts, node_url } from './lib/utils/utils/network'

import dotenv from "dotenv";
dotenv.config()

if (![TASK_COMPILE, TASK_TEST].includes(process.argv[2])) {
    (async () => {
        await import("./tasks");
    })();
}

const coinmarketcapApiKey = process.env.COINMARKETCAP_API_KEY;

const bscTestnetPrivateKey = `${process.env.BSC_TESTNET_PRIVATE_KEY}`
    .split(",")
    .map((s) => s.trim());
const bscMainnetPrivateKey = `${process.env.BSC_MAINNET_PRIVATE_KEY}`
    .split(",")
    .map((s) => s.trim());

const gasReporter: EthGasReporterConfig = {
    enabled: true,
    outputFile: "gas-usage.txt",
    currency: "USD",
    noColors: true,
    coinmarketcap: coinmarketcapApiKey,
    excludeContracts: ["test*", "@openzeppelin*"],
    token: "BNB",
};


const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",

    namedAccounts: {
        deployer: {
            default: 0,
        },
        dnftRepoDeployer: {
            default: 1,
        },
        user1: {
            default: 2,
        },
    },
    solidity: {
        compilers: [

            {
                version: "0.8.7",
                settings: { optimizer: { enabled: true, runs: 200 } },
            },
            {
                version: "0.4.18",
                settings: { optimizer: { enabled: true, runs: 200 } },
            },
        ],
    },
    mocha: {
        timeout: 120000,
    },
    etherscan: {
        apiKey: process.env.BSCSCAN_API_KEY,
    },
    gasReporter,
    preprocess: {
        eachLine: removeConsoleLog(
            (hre: HardhatRuntimeEnvironment) =>
                hre.network.name !== "hardhat" &&
                hre.network.name !== "localhost"
        ),
    },
    paths: {
        sources: "./contracts/",
        tests: "./test",
        cache: "./cache",
        deployments: process.env.DEPLOYMENT_ENV || 'deployments',
        artifacts: "./artifacts",
    },
    abiExporter: {
        path: "./abis",
        runOnCompile: true,
        clear: true,
        flat: true,
        pretty: false,
        except: ["test*", "@openzeppelin*", "uniswap*"],
    },
    networks: {
        hardhat: {
            chainId: process.env.HARDHAT_FORK_CHAINID
                ? parseInt(process.env.HARDHAT_FORK_CHAINID)
                : 31337,
            // process.env.HARDHAT_FORK will specify the network that the fork is made from.
            // this line ensure the use of the corresponding accounts
            accounts: accounts(process.env.HARDHAT_FORK),
            forking: process.env.HARDHAT_FORK
                ? {
                    // TODO once PR merged : network: process.env.HARDHAT_FORK,
                    url: node_url(process.env.HARDHAT_FORK),
                    blockNumber: process.env.HARDHAT_FORK_NUMBER
                        ? parseInt(process.env.HARDHAT_FORK_NUMBER)
                        : undefined,
                }
                : undefined,
            // mining: {
            //   auto: false,
            //   interval: 3000,
            // }
            allowUnlimitedContractSize: true,
        },
        ["bsc-testnet"]: {
            url: "https://data-seed-prebsc-1-s1.binance.org:8545",
            accounts: [
                bscTestnetPrivateKey[0],
                ...bscTestnetPrivateKey,
                `129a04a37ac1bc848ed846653cf512537af75720cfbd8d272f352e463971bce4`,
                // 0x585B24FB17B3847437e905125eC4E011a1C148AD
                `d0a5f367e4b0cb2af75759a2b7f06b44d3538e046406366aa238893653e33aca`,
                "9cf2f3bffbab44d20ca1500d5f7a0fb599a2f5d31daa20ecadd2361355d0cea4",
            ],
            // gasMultiplier: 1, // For testnet only
        },
        ["bsc-mainnet"]: {
            url: "https://bsc-dataseed.binance.org",
            accounts: [
                bscMainnetPrivateKey[0],
                ...bscMainnetPrivateKey,
            ],
        },
        ["polygon-testnet"]: {
            url: "https://matic-mumbai.chainstacklabs.com",
            accounts: [
                bscTestnetPrivateKey[0],
                `129a04a37ac1bc848ed846653cf512537af75720cfbd8d272f352e463971bce4`,
            ],
        },
        ["polygon-mainnet"]: {
            url: "https://polygon-rpc.com",
            accounts: [
                bscMainnetPrivateKey[0],
                ...bscMainnetPrivateKey,
            ],
        },
    },
    typechain: {
        outDir: "typechain",
        target: "ethers-v5",
    },

};



export default config;
