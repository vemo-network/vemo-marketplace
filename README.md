# Marketplace smart contracts
Smart contracts for Marketplace-v2, powered by [LooksRare exchange v1](https://docs.looksrare.org/developers/welcome)

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
- Deploy main managers
```bash
$ IMPLEMENTATION=<kind> \
npx hardhat run ./scripts/deploy-managers.ts --network <chain-name>
```

>   where IMPLEMENTATION is number kind, values corresponding
>   - 0: CURRENCY_MANAGER
>   - 1: EXECUTION_MANAGER
>   - 2: ROYALTY_FEE_MANAGER

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

## Upgrade contracts
TBD

## Troubleshoot
- Deploy failed due to chain congestion, the solution is need to wait for traffic reduce and redeploy


## License
Copyright belongs to VemeNFT - Ace Labs

| Contract Type                         | Address                                   |
|---------------------------------------|-------------------------------------------|
| WETH                                  | 0xd00ae08403b9bbb9124bb305c09058e32c39a48c |
| MARKETPLACE                           | 0x2829012FC81983C4ABD08A53d5243F05CAc4bb0D |
| EXECUTION_MANAGER                     | 0x2aA8A49Ac88F4bAE2fb0C7517dDB4a3aD57348da |
| ROYALTY_FEE_MANAGER                   | 0x9ee1BFf46f270aB0818A6Ae9b7083Df40f9BeaA4 |
| CurrencyManager                       | 0x20A39584bF67419e051111a87678606f84c07Eff |
| StrategyStandardSaleForFixedPrice     | 0xB83876eb92198aBe282489f79740113050483D8c |



| Contract Type                         | Address                                   |
|---------------------------------------|-------------------------------------------|
| WETH                                  | 0xd00ae08403b9bbb9124bb305c09058e32c39a48c |
| MARKETPLACE                           | 0x4eE89877330A247065E6E340BB914B3bba304d3e |
| EXECUTION_MANAGER                     | 0x320b6996a815AF9C4A773fD59A3130994a8daC2b |
| ROYALTY_FEE_MANAGER                   | 0xd047e208b9A3feDD27ED361586C9827C91c0093d |
| CurrencyManager                       | 0x27B7ceC5Baf9C2B8558Ff4c5e2F8B5e57FCfFE11 |
| StrategyStandardSaleForFixedPrice     | 0x19B8dd424BbEe16F091628a415f58cBCd438c429 |



| Contract Type                         | Address                                   |
|---------------------------------------|-------------------------------------------|
| WETH                                  | 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c |
| MARKETPLACE                           | 0x0f38Dd0D6D67388aF2575736629c5F8a9D81C8aA |
| EXECUTION_MANAGER                     | 0x954149a56f084e8451401dceFd0242182EB9954c |
| ROYALTY_FEE_MANAGER                   | 0x0d9ed97aaD16FC7A748B749423384EA091260f44 |
| CurrencyManager                       | 0xe85e685c692f5242E0B4647895206518a3cdCCed |
| StrategyStandardSaleForFixedPrice     | 0x3A24DA07ae15393F6Bc15a84b296Bc55898a982A |
