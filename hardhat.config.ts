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

import { accounts, node_url } from "./lib/utils/utils/network";

import dotenv from "dotenv";
dotenv.config();

if (![TASK_COMPILE, TASK_TEST].includes(process.argv[2])) {
    (async () => {
        await import("./tasks");
    })();
}

const privateKey1 = process.env.PRIVATE_KEY1!;

const gasReporter: EthGasReporterConfig = {
    enabled: true,
    outputFile: "gas-usage.txt",
    currency: "USD",
    noColors: true,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    excludeContracts: ["test*", "@openzeppelin*"],
    token: "BNB",
};

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    solidity: {
      compilers: [
        {
          version: "0.8.7",
          settings: { optimizer: { enabled: true, runs: 200 } },
        },
        {
          // for WETH contract
          version: "0.4.18",
          settings: { optimizer: { enabled: true, runs: 200 } },
        },
      ],
    },
    mocha: {
      timeout: 120000,
    },
    etherscan: {
      //apiKey: process.env.BSCSCAN_API_KEY,
      apiKey: {
        avax_fuji: "snowtrace", // apiKey is not required, just set a placeholder
        avalanche: "snowtrace",
        bscTestnet: process.env.BSCSCAN_API_KEY!,
      },
      customChains: [
        {
          network: "avax_fuji",
          chainId: 43113,
          urls: {
            apiURL: "https://api.routescan.io/v2/network/testnet/evm/43113/etherscan",
            browserURL: "https://testnet.snowtrace.io"
          }
        },
        {
          network: "avax_mainnet",
          chainId: 43113,
          urls: {
            apiURL: "https://api.routescan.io/v2/network/testnet/evm/43114/etherscan",
            browserURL: "https://snowtrace.io/"
          }
        },
        {
          network: "bnb_mainnet",
          chainId: 56,
          urls: {
            apiURL: "https://api.routescan.io/v2/network/testnet/evm/56/etherscan",
            browserURL: "https://bscscan.com/"
          }
        },
      ] 
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
      bnb_testnet: {
        url: "https://data-seed-prebsc-1-s2.binance.org:8545/",
        accounts: [privateKey1],
      },
      avax_fuji: {
        url: "https://api.avax-test.network/ext/bc/C/rpc",
        chainId: 43113,
        accounts: [privateKey1],
      },
      avax_mainnet: {
        url: "https://api.avax.network/ext/bc/C/rpc",
        chainId: 43114,
        accounts: [privateKey1],
      },
      bnb_mainnet: {
        url: "https://bsc-dataseed4.bnbchain.org",
        chainId: 56,
        accounts: [privateKey1],
      },
    },
    typechain: {
        outDir: "typechain",
        target: "ethers-v5",
    },

};



export default config;
