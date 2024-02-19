# Marketplace smart contracts

Power by [LooksRare](https://docs.looksrare.org/developers/welcome)

## Prerequisites

-   NodeJS v16

## Install

Install dependencies

```bash
$ yarn
```

## Testing

Execute test cases

```bash
$ npm test
```

# Build & Compile

Compile bytecode sẽ thực hiện luôn npx hardhat typechain để sinh ra d.ts tương ứng.

```bash
$ npm run compile
```

# Run local node

```bash
$ npm run node
```

# Deployment

```bash
$ npx hardhat deploy --network hardhat --reset # need reset for hardhat testnet

```

```
yarn deploy --network hardhat --tags xxx
```

or

```
yarn deploy --network localhost --tags xxx

```

# Note:

Sử dụng .env để cấu hình một số biến đặc biệt (các private key của các ví deploy)

set biến env trước khi build để build thư mục test_deployments thay vì deployments (staging)
DEPLOYMENT_ENV=test_deployments
