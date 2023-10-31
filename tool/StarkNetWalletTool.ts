
import {Tools} from "./Tools";
import {WalletTool} from "./WalletTool";

import { Account, RawArgs,number,ec,uint256,Contract,Signature,Provider,stark,TransactionStatus,hash,CallData } from "starknet";
import { BigNumber,utils,Wallet }from "ethers";

import fs from 'fs';
import {EncrptTool} from "./EncrptTool";
import {User} from "../entity/User";
import {createConnection} from "typeorm";
import {getDefaultSigners} from "../../../argentx/argent-starknet-recover/genSigners";
import { ethers} from "ethers";
export class StarkNetWalletTool {

    static MAINNET_ID = 7777;
    static ETH="0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

    static getAddr(){
        if(WalletTool.CUR_ADDR == null){
            const { DEV_WALLET_ADDRESS,PROD_WALLET_ADDRESS } = process.env;
            return  Tools.isDEV() ? DEV_WALLET_ADDRESS : PROD_WALLET_ADDRESS;
        }else{
            return WalletTool.CUR_ADDR;
        }
    }
    private static decrpt(){
       return '';
    }

    private static getPrivateKey(){
        let key = this.decrpt();;
        //let privateKey="0x01507b7eea7a9dffd9478178718b0822ae0ef7770c4d5d8c96941480471f954d";
        //key=number.toHex(number.toBigInt(privateKey))
        return key;
    }

    public  static async transfer(to,token,amount){
        let providerUrl = Tools.chainUrlList[this.MAINNET_ID]['provider'];
        const signer = await this.getSigner(providerUrl);
        const provider =  this.getProvider(providerUrl);
        const { transaction_hash } = await signer.execute({
            contractAddress: token,
            entrypoint: 'transfer',
            calldata: [to, ethers.utils.parseEther(amount.toString()).toString(), '0'],
        });

        console.log(transaction_hash);


        const rst = await provider.waitForTransaction(transaction_hash,{
            // @ts-ignore
            successStates: [TransactionStatus.REVERTED],
        });
        return rst;
    }

    public  static async approve(to,token,amount){

        let providerUrl = Tools.chainUrlList[this.MAINNET_ID]['provider'];
        const signer = await this.getSigner(providerUrl);
        const provider =  this.getProvider(providerUrl);
        const uint256AmountToApprove = uint256.bnToUint256(amount)
        const approveArgs: RawArgs = {
            to,
            amount: uint256AmountToApprove
        }
        const allowCalldata = {
            contractAddress: token,
            entrypoint: 'allowance',
            calldata: [
                WalletTool.getAddr(),to
            ]
        }
        const allowMount = await signer.callContract(allowCalldata);
        console.log("approve",allowMount);
        if(parseInt(allowMount.result[0]) < 1){
            const approveCalldata = CallData.compile(approveArgs)

            const calldata = {
                contractAddress: token,
                entrypoint: "approve",
                calldata: approveCalldata
            }

            // const { transaction_hash } = await signer.execute(calldata);
            // console.log(transaction_hash);
            // const rst = await provider.waitForTransaction(transaction_hash,{
            //     successStates: [TransactionStatus.RECEIVED],
            // });
            return calldata;
        }
        return null;

    }

    public  static async execute(calldata,cairoVersion="0"){
        console.log(calldata);
        let providerUrl = Tools.chainUrlList[this.MAINNET_ID]['provider'];
        const signer = await this.getSigner(providerUrl);
        const provider =  this.getProvider(providerUrl);
        console.log("cairoVersion",cairoVersion);
        // @ts-ignore
        const { transaction_hash } = await signer.execute(calldata,null,{cairoVersion:cairoVersion});
        console.log(transaction_hash);
        // const rst = await this.transStatus(transaction_hash);
        // const statusList = [TransactionStatus.RECEIVED,TransactionStatus.PENDING,TransactionStatus.ACCEPTED_ON_L2];
        // // @ts-ignore
        // if(statusList.includes(rst.status)){
        //     return {"transaction_hash":transaction_hash,"status":"RECEIVED","messages_sent":[],"events":[]}
        // }
        // return null;
        // const rst = await provider.waitForTransaction(transaction_hash,{
        //     successStates: [TransactionStatus.RECEIVED],
        // });
        // return rst;
       return {"transaction_hash":transaction_hash,"status":"RECEIVED","messages_sent":[],"events":[]}
    }

    public static async transStatus(transaction_hash){
        let providerUrl = Tools.chainUrlList[this.MAINNET_ID]['provider'];
        const provider =  this.getProvider(providerUrl);
        const txRst = await provider.getTransactionReceipt(transaction_hash)
        console.log(txRst);
        return txRst;
    }

    static  getProvider(providerUrl) : Provider{
        if(providerUrl.indexOf("alpha-mainnet")>0){
            return new Provider({
                sequencer: {
                    baseUrl: providerUrl,
                    feederGatewayUrl: 'feeder_gateway',
                    gatewayUrl: 'gateway',
                }
            });
        }
        console.log("rpc connecting",providerUrl.indexOf("alpha-mainnet"));
        return new Provider({
            rpc: {
                nodeUrl: providerUrl
            }
        });


        // const network = "mainnet-alpha";
        // const provider = new SequencerProvider({ network });
        // return provider;
    }

    static async deployAccount(){
        let providerUrl = Tools.chainUrlList[this.MAINNET_ID]['provider'];
        const signer = await this.getSigner(providerUrl);
        const { getSelectorFromName } = hash;
        let privateKey=this.getPrivateKey();
        const pubKey = ec.starkCurve.getStarkKey(privateKey);
        console.log(signer.address,pubKey);
        //process.exit(0);

        const accountClassHash = "0x025ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106542a3ea56c5a918";
        const implementation = "0x33434ad846cdd5f23eb73ff09fe6fddd568284a0fb7d1be20ee482f044dabe2";
        const constructorCallData = {
            implementation: implementation,
            selector: getSelectorFromName("initialize"),
            calldata:  CallData.compile({ signer: pubKey, guardian: "0" }),
        }
        console.log(constructorCallData);
        const deployed = await signer.deployAccount({
            classHash: accountClassHash,
            constructorCalldata: CallData.compile(constructorCallData),
            addressSalt: pubKey
        });

        const rst = await signer.waitForTransaction(deployed.transaction_hash,{
            // @ts-ignore
            successStates: [TransactionStatus.RECEIVED],
        });
        console.log(deployed.transaction_hash,rst);
        return rst;
    }

    static async signMessage(msg,type=1){

        let providerUrl = Tools.chainUrlList[this.MAINNET_ID]['provider'];
        const signer = await this.getSigner(providerUrl);
        let sign:Signature =  await signer.signMessage(msg);
        if(type == 1){
            return {
                // @ts-ignore
                r:"0x"+sign.r.toString(16),
                // @ts-ignore
                s:"0x"+sign.s.toString(16)
            }
        }
        return {
            // @ts-ignore
            r:sign.r.toString().replace("n",""),
            // @ts-ignore
            s:sign.s.toString().replace("n","")
        }
    }
    static async getSigner(providerUrl){
        const privateKey = this.getPrivateKey();
        //const starkKeyPairAX = ec.getKeyPair(privateKey);
       // const signer =  new Account(this.getProvider(providerUrl), WalletTool.getAddr(), new Signer(starkKeyPairAX));
        //const starkKeyPair = ec.starkCurve.getStarkKey(privateKey);
        const signer =  new Account(this.getProvider(providerUrl), this.getAddr(), privateKey);
        return signer;
    }

    static async getBalance(token,tokenDecimal=18){
        let providerUrl = Tools.chainUrlList[this.MAINNET_ID]['provider'];
        const provider =  this.getProvider(providerUrl);
        const json = JSON.parse(
            fs.readFileSync("src/abi/stark_erc20.json").toString('ascii')
        );
        const myTestContract = new Contract(json.abi, token, provider);
        const bal1 = await myTestContract.balanceOf(WalletTool.getAddr());
        const balance = utils.formatEther(bal1.balance.low.toString());
        console.log("balance =", bal1,balance);
        return parseFloat(balance);
    }

     

}