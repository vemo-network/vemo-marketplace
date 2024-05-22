import { ethers, Contract, providers, utils, Wallet } from 'ethers';
const RPC = 'https://rpc.ankr.com/avalanche_fuji';
const provider = new providers.JsonRpcProvider(RPC);

const signMakerVoucherOrder = async (
    signer: Wallet,
    verifyingContract: string,
    order: any
  ): Promise<any> => {
    const domain = {
      name: "VemoMarket",
      version: "1",
      chainId: (await provider.getNetwork()).chainId,
      verifyingContract: "0xBA5E72aEb72FC5B77CDBF5435519FC10f65054f6",
    }
    
    const signature = await signer._signTypedData(
      domain,
      {
        MakerOrder: [
          { name: "isOrderAsk", type: "bool" },
          { name: "signer", type: "address" },
          { name: "collection", type: "address" },
          { name: "price", type: "uint256" },
          { name: "tokenId", type: "uint256" },
          { name: "amount", type: "uint256" },
          { name: "strategy", type: "address" },
          { name: "currency", type: "address" },
          { name: "nonce", type: "uint256" },
          { name: "startTime", type: "uint256" },
          { name: "endTime", type: "uint256" },
          { name: "minPercentageToAsk", type: "uint256" },
          { name: "params", type: "bytes" },
          { name: "boundTokens", type: "address[]" },
          { name: "boundAmounts", type: "bytes" },
        ],
      },
      order
    )
  
    const { s, r, v } = ethers.utils.splitSignature(signature)
    return { s, r, v }
  }
  
  

const main = async function() {
    const newData = {
        "chainId": "43113",
        "verifyingContract": "0xBA5E72aEb72FC5B77CDBF5435519FC10f65054f6",
        "isOrderAsk": true,
        "signer": "0x6Da94C8f5660BFa8f15e8834c2663A0A3e8C73F2",
        "collection": "0x0e5333652a531b4ba8a62470a2e217952c9229a0",
        "price": {
          "type": "BigNumber",
          "hex": "0x071afd498d0000"
        },
        "tokenId": {
          "type": "BigNumber",
          "hex": "0x0c"
        },
        "amount": {
          "type": "BigNumber",
          "hex": "0x01"
        },
        "strategy": "0xeb421E2Cc3A3705322713b977E4d600C5e02104d",
        "currency": "0xd00ae08403b9bbb9124bb305c09058e32c39a48c",
        "nonce": {
          "type": "BigNumber",
          "hex": "0x2c"
        },
        "startTime": {
          "type": "BigNumber",
          "hex": "0x664c7e3d"
        },
        "endTime": {
          "type": "BigNumber",
          "hex": "0x012081bb3d"
        },
        "minPercentageToAsk": {
          "type": "BigNumber",
          "hex": "0x00"
        },
        "params": "0x",
        "boundAmounts": ["1000000000000000000"],
        "boundTokens": ["0x213585eA5189406DB3aBe4991e72E54d1C289958"],
        "r": "0x349e24a8261e7f61a1686360aebf5be9d0eb9b7eeab32c0f5607c4324c9cab2f",
        "s": "0x375e889a1fa1837f61df55cb71d5eb9f2458dd4114b4bc73296327357d1527ce",
        "v": 28
    }
    let wallet = ethers.Wallet.createRandom(['999999999']);

    await signMakerVoucherOrder(wallet, );
}