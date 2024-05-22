# Marketplace smart contracts
Smart contracts for Vemo Marketplace, powered by [LooksRare exchange v1](https://docs.looksrare.org/developers/welcome)

Avax Fuji
| Contract Type                         | Address                                   |
|---------------------------------------|-------------------------------------------|
| CurrencyManager | 0x84626a2E6E5a90E8e5bd44627EC356E820dFe298 |
| ExecutionManager | 0x5Ee975136c88A828583580F1AF0b6cfF1298690f |
| RoyaltyFeeRegistry | 0x4dbF72E3389481F5064112e6B7F2Bfb7ccC97732 |
| RoyaltyFeeManager | 0x3615B8E19644cdFA336eC8b976BE739e07E950B6 |
| Marketplace is |  0xBA5E72aEb72FC5B77CDBF5435519FC10f65054f6 |
| TransferManagerERC721 | 0x6BDfFaBAC48ad4EBF98803Bc64Ddc8E5c627b574 |
| TransferManagerERC1155 | 0x5f858B83E0BbF1DEc5817C3ccDb77DF8De6E228c |
| TransferManagerNonCompliantERC721 | 0x1e96319FbD0F602A14b836D10C4d56e1DcF1841f |
| TransferSelectorNFT | 0x1c61871d162A94B44797D3C08dE716999E8Aee33 |
| OrderValidator | 0xA236bD1c9696dfE5A555AdD13D619b9DBbF7BA20 |
| StrategyStandardSaleForFixedPriceVoucher | 0xeb421E2Cc3A3705322713b977E4d600C5e02104d |


Avax Mainnet
| Contract Type                         | Address                                   |
|---------------------------------------|-------------------------------------------|
| WETH                                  | 0xd00ae08403b9bbb9124bb305c09058e32c39a48c |
| MARKETPLACE                           | 0x4eE89877330A247065E6E340BB914B3bba304d3e |
| EXECUTION_MANAGER                     | 0x320b6996a815AF9C4A773fD59A3130994a8daC2b |
| ROYALTY_FEE_MANAGER                   | 0xd047e208b9A3feDD27ED361586C9827C91c0093d |
| CurrencyManager                       | 0x27B7ceC5Baf9C2B8558Ff4c5e2F8B5e57FCfFE11 |
| StrategyStandardSaleForFixedPrice     | 0x19B8dd424BbEe16F091628a415f58cBCd438c429 |
| OrderValidator                        | 0x3A24DA07ae15393F6Bc15a84b296Bc55898a982A |


BNB mainnet
| Contract Type                         | Address                                   |
|---------------------------------------|-------------------------------------------|
| WETH                                  | 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c |
| MARKETPLACE                           | 0x0f38Dd0D6D67388aF2575736629c5F8a9D81C8aA |
| EXECUTION_MANAGER                     | 0x954149a56f084e8451401dceFd0242182EB9954c |
| ROYALTY_FEE_MANAGER                   | 0x0d9ed97aaD16FC7A748B749423384EA091260f44 |
| CurrencyManager                       | 0xe85e685c692f5242E0B4647895206518a3cdCCed |
| StrategyStandardSaleForFixedPrice     | 0x3A24DA07ae15393F6Bc15a84b296Bc55898a982A |


## Prerequisites
- [NodeJS v18.x](https://nodejs.org/en)
- [Hardhat v2.16.x](https://hardhat.org/)
- [Foundry latest](https://book.getfoundry.sh/getting-started/installation)
- [OpenZeppelin v4.x](https://docs.openzeppelin.com/contracts/4.x/)

## Setup
- Install dependencies
```bash
$ yarn
```

- Create .env file from template
```bash
$ cp .env.example .env
```

- Fulfill credentials and secrets to .env file

## Compile
- Compile smart contracts
```bash
$ npx hardhat clean
$ npx hardhat compile
```

## Testing
- Hardhat test
```bash
$ npm test
```

## Foundry
- Compile
```bash
$ forge build
```

- Test
```bash
$ forge test
```

## Deploy
- (Once) Add supported chain config to hardhat.config.ts
```typescript
const config: HardhatUserConfig = {
  networks: {
    bnb_testnet: {
      url: "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
      chainId: 97,
      accounts: [privateKey1, privateKey2]
    },
    ...
  }
  ...
}
```

### Deploy managers
The deployment flow:
1. Deploy manager contracts that index from - to 0 to 2
2. deploy marketplace
3. deploy TRANSFER_NFT_SELECTOR manager (index 3 )
4. deploy order validator index 4
5. deploy voucher strategies + whitelist on market

- Deploy main
```bash
$ IMPLEMENTATION=<kind> \
npx hardhat run ./scripts/deploy-managers.ts --network <chain-name>
```

>   where IMPLEMENTATION is number kind, values corresponding
>   - 0: CURRENCY_MANAGER
>   - 1: EXECUTION_MANAGER
>   - 2: ROYALTY_FEE_MANAGER
>   - 3: TRANSFER_NFT_SELECTOR,
>   - 4: ORDER_VALIDATOR,
>   - 5: STRATEGY_STANDARD_FIXED_PRICE,
>   - 6: STRATEGY_STANDARD_FIXED_PRICE_VOUCHER,

### Deploy marketplace
```bash
$ CURRENCY_MANAGER="<address>" \
EXECUTION_MANAGER="<address>" \
ROYALTY_FEE_MANAGER="<address>" \
WETH="<address>" \
npx hardhat run scripts/deploy-marketplace.ts --network <chain-name>
```

> Managers address is retrieved from previous step.
> WETH addresses for chains are
> - [WBNB](https://testnet.bscscan.com/address/0xae13d989dac2f0debff460ac112a837c89baa7cd)
> - [WAVAX](https://testnet.snowtrace.io/address/0xd00ae08403b9bbb9124bb305c09058e32c39a48c)

### Deploy helper components
```bash
$ IMPLEMENTATION=<kind> \
MARKETPLACE=<address> \
npx hardhat run ./scripts/deploy-managers.ts --network <chain-name>
```

>   where IMPLEMENTATION is number kind, values corresponding
>   - 3: TRANSFER_NFT_SELECTOR
>   - 4: ORDER_VALIDATOR
>   MARKETPLACE is contract address of marketplace, retrieved from previous step.

### Deploy execution strategy
```bash
$ IMPLEMENTATION=<kind> \
EXECUTION_MANAGER=<address> \
npx hardhat run ./scripts/deploy-managers.ts --network <chain-name>
```

>   where IMPLEMENTATION is number kind, values corresponding
>   - 5: STRATEGY_STANDARD_FIXED_PRICE
>   EXECUTION_MANAGER is contract address of execution manager, retrieved from previous step.


## Verify contract
- Obtain and fulfill Explorer API key to .env file
```bash
export BSCSCAN_API_KEY="<API_KEY>"
```

- Verify contract, please remember to pass corresponding constructor arguments
```bash
$ npx hardhat verify --network <chain-name> <contract-address>
```
or
```bash
$ forge verify-contract 0x2133DD7Ad181929F8a4D0f98EE6D97703008228f  --watch --chain 43113 contracts/VemoMarket.sol:VemoMarket  --etherscan-api-key "" --num-of-optimizations 200 --compiler-version 0.8.7 --constructor-args
```

## Upgrade contracts
TBD

## Troubleshoot
- Deploy failed due to chain congestion, the solution is need to wait for traffic reduce and redeploy


## License
Copyright belongs to VemeNFT - Ace Labs
