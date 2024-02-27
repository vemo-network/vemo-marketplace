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

- Deploy managers
```bash
$ npx hardhat run ./scripts/deploy-managers.ts --network <chain-name>
```

- Deploy strategies
```bash
$ npx hardhat run ./scripts/deploy-strategy.ts --network <chain-name>
```

- Setup currency whitelist, etc
```bash
$ npx hardhat run ./scripts/setup-marketplace.ts --network <chain-name>
```

- Deploy marketplace
```bash
$ CURRENCY_MANAGER="<address>" \
EXECUTION_MANAGER="<address>" \
ROYALTY_FEE_MANAGER="<address>" \
WETH="<address>" \
npx hardhat run scripts/deploy-marketplace.ts --network <chain-name>
```
> WETH addresses for chains are
> - [WBNB](https://testnet.bscscan.com/address/0xae13d989dac2f0debff460ac112a837c89baa7cd)

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

## Note
- set biến env trước khi build để build thư mục test_deployments thay vì deployments (staging)
DEPLOYMENT_ENV=test_deployments

## License
Copyright belongs to DareNFT - Alpha Waves PTE. LTD, 2023
