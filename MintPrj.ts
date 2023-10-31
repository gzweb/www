
import {Tools} from "tool/Tools";
import {WalletTool} from "tool/WalletTool";
import {AbstractPrj} from "AbstractPrj"; 
import { Account, shortString,ec,Signature,Provider,stark,TransactionStatus,hash,CallData } from "starknet";

import {StarkNetWalletTool} from "tool/StarkNetWalletTool";


export class MintPrj extends AbstractPrj{ 

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
        const mintContract = "0x00b719f69b00a008a797dc48585449730aa1c09901fdbac1bc94b3bdc287cf76";

        const calldata = [
            {
                contractAddress: mintContract,
                entrypoint: 'mintPublic',
                calldata: [WalletTool.getAddr()],
            }

        ];
         const tx = await StarkNetWalletTool.execute(calldata);
         console.log("tx",tx);
         return tx;
    }

    async finsih(transferInfo) {
        return true;
        
    }

    isTransfer() {

        return true;
    }


}