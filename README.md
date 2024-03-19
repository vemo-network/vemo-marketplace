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
Copyright belongs to DareNFT - Alpha Waves PTE. LTD, 2023
