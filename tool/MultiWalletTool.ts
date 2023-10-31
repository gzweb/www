import {ZkSyncWalletTool} from "./ZkSyncWalletTool";
import {WalletTool} from "./WalletTool";
import {ZkSyncV2WalletTool} from "./ZkSyncV2WalletTool";
import {StarkNetWalletTool} from "./StarkNetWalletTool";

export class MultiWalletTool {


    static async getBalance(chainId,token,tokenDecimal) {
        let balance = null;
        if (chainId == ZkSyncWalletTool.CHAIN_ID) {
            balance = await ZkSyncWalletTool.getBalance(token, tokenDecimal);
        } else if (chainId == ZkSyncV2WalletTool.MAINNET_ID) {
            balance = await ZkSyncV2WalletTool.getBalance(token, tokenDecimal);
        } else if (chainId == StarkNetWalletTool.MAINNET_ID) {
            balance = await StarkNetWalletTool.getBalance(token, tokenDecimal);
        }else {
            balance = await WalletTool.getBalance(chainId, token, tokenDecimal);
        }
        return balance;
    }

    static async sendTransaction(to,value:string,providerUrl,chainId,isGasLimit = true){
        if (chainId == ZkSyncWalletTool.CHAIN_ID) {
            return await ZkSyncWalletTool.transfer(ZkSyncWalletTool.ETH,to,value);
        } else {
            return await WalletTool.sendTransaction(to,value,providerUrl,chainId,isGasLimit);
        }
    }
}