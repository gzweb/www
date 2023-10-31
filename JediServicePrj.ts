
import {Tools} from "tool/Tools";
import {WalletTool} from "tool/WalletTool";
import {AbstractPrj} from "AbstractPrj"; 
import { Account, shortString,ec,Signature,Provider,stark,TransactionStatus,hash,CallData } from "starknet";

import {StarkNetWalletTool} from "tool/StarkNetWalletTool";
import {MultiWalletTool} from "tool/MultiWalletTool";
import {JediService} from "service/stark/JediService";


export class JediServicePrj extends AbstractPrj{

    maxGas = 6;

    getTradeType() {
        return TradeModel.TYPE_ARGENTX3;
    }

    getTradeId() {
        return 6055;
    }

    getCairVersion(transferInfo){
        const maxinfo = transferInfo[0];
        console.log(maxinfo.defi,maxinfo.defi.indexOf("upgrade"));
        if(maxinfo.defi.indexOf("upgrade")>0){
            return "1";
        }
        return "0";
    }

    async before(transferInfo) {
        console.log("before...");
        const chainId = 1;
        let jediservice = new JediService();
        let tokenADecimal = 18;
        let tokenBDecimal = 18;
        let amountIn = Tools.rand(10,100)/1000000;
        let tokenA = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
        let tokenB = "0xda114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3";
        let info = await jediservice.trade(chainId,tokenA,tokenADecimal,tokenB,tokenBDecimal,amountIn,0.1,1,this.getCairVersion(transferInfo));
        return info;
    }

    static formatNumber(num: number, decimalPlaces: number): string {
        const factor = Math.pow(10, decimalPlaces);
        const truncated = Math.trunc(num * factor) / factor;
        return truncated.toString();
    }

    async middle(transferInfo) {
       return true;

    }

    async after(transferInfo) {
        //mint
       return true;
    }

    async finsih(transferInfo) {
        return true;
       
    }

    isTransfer() {

        return true;
    }


}