 
import {WalletTool} from "../../tool/WalletTool"; 
import { Account, shortString,ec,Signature,Provider,stark,TransactionStatus,hash,CallData } from "starknet";

import {StarkNetWalletTool} from "../../tool/StarkNetWalletTool";


export class DeployPrj extends AbstractPrj{

 

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
        const classHash="0xc891f15331733ea81a81c13309c06f376e43d79f41b5f698e4996e9e2ced00";
        const calldata = [
            {
                contractAddress: contract,
                entrypoint: 'deployContract',
                calldata: [classHash,"0x6390c61f04214ccff42c2fd56046e72c1cd82160029f4598914950da5e31161",[]],
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