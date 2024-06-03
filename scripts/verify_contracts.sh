#!/bin/bash

# Array of contract addresses and contract names
contract_addresses=("0xDee03828d53cEd8673b3Da42E58726E270879672" "0xE386449B15512A2ABc6E9e27Aba55CDFe0012eFa" "0x4170f66135892da562174d249bb8b36FC3069aB7", "0x749cC834fE85d40088968F7980A4806638c81fFA", "0x27d47868433C467e9Fa0109F6E5086D15D8e06A5", "0x27d47868433C467e9Fa0109F6E5086D15D8e06A5",
"0xb7411BcAFeFDc571B0ca7273D4152f938AF72354", "0x84E2a57c961BcAD46D5725e3B73B3879C813Bbb1",
"0x31095b3A27A4821c505E8B51822eE7d53b8f2432", "0x026Db00E52d79a4c4b5CFc66bC9Ca78533a92B72",
"0xe3ca17bE926564eFcf3b62a245fC387f7eBAa537", "0x22Fe90B9c380e84dD102D8D74C1913067D172e2B")

contract_names=("CurrencyManager" "ExecutionManager" "RoyaltyFeeRegistry", "RoyaltyFeeManager", "VemoMarket", "TransferManagerERC721", "TransferManagerERC1155", "TransferManagerNonCompliantERC721", "TransferSelectorNFT", "OrderValidator", "StrategyStandardSaleForFixedPriceVoucher")
# | CurrencyManager |0xDee03828d53cEd8673b3Da42E58726E270879672 |
# | ExecutionManager |0xE386449B15512A2ABc6E9e27Aba55CDFe0012eFa |
# | RoyaltyFeeRegistry |0x4170f66135892da562174d249bb8b36FC3069aB7 |
# | RoyaltyFeeManager |0x749cC834fE85d40088968F7980A4806638c81fFA |
# | VemoMarket | 0x27d47868433C467e9Fa0109F6E5086D15D8e06A5 |
# | TransferManagerERC721 |0xb7411BcAFeFDc571B0ca7273D4152f938AF72354 |
# | TransferManagerERC1155 |0x84E2a57c961BcAD46D5725e3B73B3879C813Bbb1 |
# | TransferManagerNonCompliantERC721 |0x31095b3A27A4821c505E8B51822eE7d53b8f2432 |
# | TransferSelectorNFT |0x026Db00E52d79a4c4b5CFc66bC9Ca78533a92B72 |
# | OrderValidator |0xe3ca17bE926564eFcf3b62a245fC387f7eBAa537 |
# | StrategyStandardSaleForFixedPriceVoucher | 0x22Fe90B9c380e84dD102D8D74C1913067D172e2B |

# Verifier URL
verifier_url="https://api.routescan.io/v2/network/mainnet/evm/43114/etherscan"

# Etherscan API key
etherscan_api_key="1VYRT81XHNBY8BC2X88N9ZF4XRBXUJDYKQ"

chainid="97"

# Number of optimizations
num_of_optimizations=200

# Compiler version
compiler_version="0.8.7"

# Function to find contract path
find_contract_path() {
    contract_name=$1
    find src -type f -name "*.sol" | while read file; do
        if grep -q "contract $contract_name" "$file"; then
            echo "$file"
            return 0
        fi
    done
    echo "Contract $contract_name not found"
    return 1
}

# Loop through each contract address and verify
for i in "${!contract_addresses[@]}"
do
    contract_address=${contract_addresses[$i]}
    contract_name=${contract_names[$i]}
    
    echo "Finding path for contract: $contract_name"
    contract_path=$(find_contract_path $contract_name)
    
    if [ $? -eq 0 ]; then
        echo "Verifying contract at address: $contract_address with path: $contract_path"
        forge verify-contract $contract_address $contract_path:$contract_name \
            --watch --chain $chainid \
            --etherscan-api-key $etherscan_api_key \
            --num-of-optimizations $num_of_optimizations \
            --compiler-version $compiler_version
    else
        echo "Skipping verification for $contract_name at address: $contract_address"
    fi
done

echo "All contracts processed."