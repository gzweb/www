
import {Tools} from "../../tool/Tools";
import {WalletTool} from "../../tool/WalletTool";
import {AbstractPrj} from "./../AbstractPrj";
import {TradeModel} from "../../model/TradeModel";
import { Account, shortString,ec,Signature,Provider,stark,TransactionStatus,hash as sHash,CallData } from "starknet";

import {StarkNetWalletTool} from "../../tool/StarkNetWalletTool";
import {MultiWalletTool} from "../../tool/MultiWalletTool";
import {SetData} from "../../../../briq-builder/src/builder/SetData";
import SetContract from "../../../../briq-builder/src/chain/contracts/set";
import axios from 'axios';


export class MultiContractPrj extends AbstractPrj{

    

    precomputeTokenId(address: string, token_id_hint: string) {
        let hash = sHash.computeHashOnElements([address, token_id_hint]);
        hash = hash.substring(2).padStart(63, '0');
        // Hash is 0x prefixed string. JS numbers are not big enough to parse this, and I'm lazy.
        // We need to 0 out the last 59 bits, which means zero out the last 14 chars (14*4 = 56), and bit-and the 15th last with b1000 == 8.
        hash = (hash.substring(0, 48) + (parseInt(hash[48], 16) & 8).toString(16)).padEnd(63, '0');
        // Remove leading zeroes.
        if (hash[0] === '0')
            hash = hash.replace(/^0+/, '');
        return '0x' + hash;
    }

    async before(transferInfo) {
        console.log("before...");
        const addr = WalletTool.getAddr();
         let randEth = Tools.rand(2114326423735134,2284326423735134);
         let tokenId =Tools.rand(147535669684420,147635669684420).toString()+""+Tools.rand(851305497613,862305497613).toString()+Tools.rand(269788031013,279788031013);
        // //let name = "0x37b2c72";
        const data = await this.submitInfo(WalletTool.getAddr(),tokenId);
        //let set = new SetData(data.id);
        // const list = set.deserialize(data);
        //console.log(list.serialize());
        let providerUrl = Tools.chainUrlList[StarkNetWalletTool.MAINNET_ID]['provider'];
        const contractAddr = "0x01435498bf393da86b4733b9264a86b58a42b31f8d8b8ba309593e5c17847672";
        const signer =   await StarkNetWalletTool.getSigner(providerUrl);
        const contract = new SetContract(contractAddr,signer);

        const prepareAssembleStr = await contract.prepareAssemble(WalletTool.getAddr(),tokenId.toString(),data);
        console.log(prepareAssembleStr); 
        console.log("randEth",randEth,tokenId);
        const calldata = [
            {
                contractAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                entrypoint: 'approve',
                calldata: ["0x5b021b6743c4f420e20786baa7fb9add1d711302c267afbc171252a74687376",randEth,0],
            },
            {
                contractAddress: "0x05b021b6743c4f420e20786baa7fb9add1d711302c267afbc171252a74687376",
                entrypoint: 'buy',
                calldata: [10],
            },
            {
                contractAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                entrypoint: 'approve',
                calldata: ["0x5b021b6743c4f420e20786baa7fb9add1d711302c267afbc171252a74687376","0x0","0x0"],
            },
             prepareAssembleStr
        ];

        // console.log(calldata,"swapCalldata");
         const tx = await StarkNetWalletTool.execute(calldata);
         console.log("tx",tx);
        //  return tx;
        return tx;
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