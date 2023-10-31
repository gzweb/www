
import {Tools} from "tool/Tools";
import {WalletTool} from "tool/WalletTool";
import {AbstractPrj} from "AbstractPrj"; 
import { Account, shortString,ec,Signature,Provider,stark,TransactionStatus,hash,CallData } from "starknet";

import {StarkNetWalletTool} from "tool/StarkNetWalletTool";


export class UpgradePrj extends AbstractPrj{

    maxGas = 6; 
    async before(transferInfo) {
        console.log("before...");
        // const createDomainContract = "0x04942ebdc9fc996a42adb4a825e9070737fe68cef32a64a616ba5528d457812e";
        // const setDomainContract = "0x06ac597f8116f886fa1c97a23fa4e08299975ecaf6b598873ca6792b9bbfb678";
        // let name = Tools.rand(57764059,58764059);
        // //let name = "0x37b2c72";
        // const calldata = [
        //     {
        //         contractAddress: createDomainContract,
        //         entrypoint: 'claim_name',
        //         calldata: [name.toString()],
        //     },
        //     {
        //         contractAddress: setDomainContract,
        //         entrypoint: 'set_address_to_domain',
        //         calldata: [0x2,
        //             name,
        //             "0xbfff81efd"],
        //     }
        // ];
        //  const tx = await StarkNetWalletTool.execute(calldata);
        //  console.log("tx",tx);
        //  return tx;
        return true;
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
        const contract = WalletTool.getAddr();
        const classHash="0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003";
        const calldata = [
            {
                contractAddress: contract,
                entrypoint: 'upgrade',
                calldata: [classHash,1,"0"],
            }

        ];
         const tx = await StarkNetWalletTool.execute(calldata);
         console.log("tx",tx);
         return tx;
    }

    async finsih(transferInfo) {
        return true;
        // try{
        //
        //     console.log("finsih...",transferInfo[2]);
        //
        //     let seconds = Tools.rand(1000,15000);
        //     console.log("swap sleep",seconds);
        //     await Tools.sleep(seconds);
        //     let nextUser = null;
        //     const starkEth = StarkNetWalletTool.ETH;
        //     const maxinfo = transferInfo[0];
        //     let providerUrl = Tools.chainUrlList[StarkNetWalletTool.MAINNET_ID]['provider'];
        //     if(transferInfo[2] != null){
        //
        //         nextUser = transferInfo[2];
        //         let ethBalance =  await StarkNetWalletTool.getBalance(starkEth);
        //         const rand = Tools.rand(220,250);
        //         ethBalance -= rand/10000;
        //         console.log('eth balance',ethBalance);
        //         return await StarkNetWalletTool.transfer(nextUser,starkEth,ethBalance);
        //     }
        //     return true;
        // }catch(e){
        //     throw  e;
        //     process.exit(0);
        //
        // }
    }

    isTransfer() {

        return true;
    }


}