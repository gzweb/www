import {Contract, ethers, Signer, utils, Wallet} from "ethers";
import {Tools} from "./Tools";
import {CBridgeService} from "../service/CBridgeService";
import {Web3Provider} from "@ethersproject/providers";
import Web3 from "web3";
import * as ethUtil from 'ethereumjs-util';
import BigNumber from "bignumber.js";

export class WalletTool {

    static INPUT ="";
    static ETH = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
    static gasLimit = 500000;
    static CUR_ADDR = null;
    static CUR_ADDR_KEY = null;

    static async getBalance(chainId,token,tokenDecimal){

        const contractAbiFragment = [
            {
                name: 'balanceOf',
                type: 'function',
                inputs: [
                    {
                        name: '_owner',
                        type: 'address',
                    },
                ],
                outputs: [
                    {
                        name: 'balance',
                        type: 'uint256',
                    },
                ],
                constant: true,
                payable: false,
            },
        ];
        let providerUrl = Tools.chainUrlList[chainId]['provider'];
        const provider = new ethers.providers.JsonRpcProvider(providerUrl);
        let wallet = new ethers.Wallet(this.getPrivateKey(),provider);
        let balance ;
        if(token==this.ETH){
            balance = await wallet.getBalance();
        }else{
            let contract =  new ethers.Contract(token,contractAbiFragment,wallet);
            balance = await contract.balanceOf(this.getAddr());
        }
        if(tokenDecimal>0){
            balance = utils.formatUnits(balance,tokenDecimal);
        }

        return balance;
        //return Tools.getFNum(balance,tokenDecimal);
    }

    static getAddr(){
        if(this.CUR_ADDR == null){
            const { DEV_WALLET_ADDRESS,PROD_WALLET_ADDRESS } = process.env;
            return  Tools.isDEV() ? DEV_WALLET_ADDRESS : PROD_WALLET_ADDRESS;
        }else{
            return this.CUR_ADDR;
        }
    }
    protected static decrpt(){
        
        return decrypted.toString();
    }

    public static getPrivateKey(){
        const key = this.decrpt();
        return key;
    }


    static async signTransaction(web3RpcUrl,transaction){
        const Web3 = require('web3');
        const web3 = new Web3(web3RpcUrl);
        //let wallet = new ethers.Wallet(this.privateKey,this.web3RpcUrl);
        //const rawTransaction = await wallet.sendTransaction(transaction);
        const {rawTransaction} = await web3.eth.accounts.signTransaction(transaction, this.getPrivateKey());
        return rawTransaction;
    }

    static async sendSignedTranscation(web3RpcUrl,transaction){
        const Web3 = require('web3');
        const web3 = new Web3(web3RpcUrl);
        //let wallet = new ethers.Wallet(this.privateKey,this.web3RpcUrl);
        //const rawTransaction = await wallet.sendTransaction(transaction);
        const {rawTransaction} = await web3.eth.accounts.signTransaction(transaction, this.getPrivateKey());
        const tx = await web3.eth.sendSignedTransaction(rawTransaction);
        return tx;
    }

    static async getContract(providerUrl,contractAddr,jsonAbi){
        const provider = new ethers.providers.JsonRpcProvider(providerUrl);
        let wallet = new ethers.Wallet(this.getPrivateKey(),provider);
        let contract =  new ethers.Contract(contractAddr,jsonAbi,wallet);

        return contract;
    }

    static async getWeb3Contract(providerUrl,contractAddr,jsonAbi){
        const Web3 = require('web3');
        const web3 = new Web3(providerUrl);
        const contract = new web3.eth.Contract(jsonAbi, contractAddr);
        return contract;
    }

    static async getAllowanceNum(chainId,toChainId,tokenAddr,tokenSymbol){

        let jsonAbi = ['function approve(address spender, uint amount) public returns(bool)',
            'function allowance(address owner, address spender) view returns(uint256)'];

        let providerUrl = Tools.chainUrlList[chainId]['provider'];

        const provider = new ethers.providers.JsonRpcProvider(providerUrl);
        let peggedInfo = await CBridgeService.getPegged(chainId,toChainId,tokenSymbol);
        let contractAddr = peggedInfo.contractAddr;
        console.log('allow addr:',contractAddr);
        return this.getAllowance(chainId,tokenAddr,contractAddr);
    }

    static async getAllowance(chainId,tokenAddr,spenderAddr){

        let jsonAbi = ['function approve(address spender, uint amount) public returns(bool)',
            'function allowance(address owner, address spender) view returns(uint256)'];

        let providerUrl = Tools.chainUrlList[chainId]['provider'];

        const provider = new ethers.providers.JsonRpcProvider(providerUrl);
        let wallet = new ethers.Wallet(this.getPrivateKey(),provider);
        let contract =  new ethers.Contract(tokenAddr,jsonAbi,wallet);
        return await contract.allowance(WalletTool.getAddr(),spenderAddr);
    }

    static async getApprovedByTokenId(chainId,tokenAddr,spenderAddr,tokenId){

        let jsonAbi = ['function getApproved( uint256 tokenId) public view '];

        let providerUrl = Tools.chainUrlList[chainId]['provider'];

        const provider = new ethers.providers.JsonRpcProvider(providerUrl);
       // let wallet = new ethers.Wallet(this.getPrivateKey(),provider);
        let contract =  new ethers.Contract(tokenAddr,jsonAbi,provider);
        let addrList = await contract.getApproved(tokenId);
        console.log("nft approve",addrList);
        if(addrList.includes(spenderAddr)){
            return true;
        }
        return  false;
    }

    static async approve(chainId,tokenAddr,spenderAddr,amountInApprove=10000,maxGasLimit=0){

        let jsonAbi = ['function approve(address spender, uint amount) public returns(bool)',
            'function allowance(address owner, address spender) view returns(uint256)'];

        let providerUrl = Tools.chainUrlList[chainId]['provider'];
        const provider = new ethers.providers.JsonRpcProvider(providerUrl);
        let wallet = new ethers.Wallet(this.getPrivateKey(),provider);
        let contract =  new ethers.Contract(tokenAddr,jsonAbi,wallet);
        let amountIn = Tools.getFNum(amountInApprove,22);
        maxGasLimit = maxGasLimit < 1 ?Tools.chainUrlList[chainId]['maxGasLimit'] : maxGasLimit;
        let gasSet = null;

        if(Tools.chainUrlList[chainId]['gasPrice'] != null) {
            let gasPrice = await wallet.getGasPrice();
            //let gasPrice = Tools.getFNum(Tools.chainUrlList[chainId]['gasPrice'],10);
            gasSet = { gasLimit :maxGasLimit,gasPrice:gasPrice.toString()};
        }else{
            gasSet =  { gasLimit :maxGasLimit};
        }

        const tx =  await contract.approve(spenderAddr,amountIn,gasSet);
        const receipt = await tx.wait();

        // The transaction is now on chain!
        console.log(tokenAddr,spenderAddr,`,Approve in block ${receipt.blockNumber},tx:`,tx.hash);
        return receipt;
    }

    static async approveNft(chainId,tokenAddr,spenderAddr,tokenId,maxGasLimit=0){

        let jsonAbi = ['function approve(address spender, uint tokenId) public returns(bool)'];

        let providerUrl = Tools.chainUrlList[chainId]['provider'];
        const provider = new ethers.providers.JsonRpcProvider(providerUrl);
        let wallet = new ethers.Wallet(this.getPrivateKey(),provider);
        let contract =  new ethers.Contract(tokenAddr,jsonAbi,wallet);
        maxGasLimit = maxGasLimit < 1 ?Tools.chainUrlList[chainId]['maxGasLimit'] : maxGasLimit;
        let gasSet = null;

        if(Tools.chainUrlList[chainId]['gasPrice'] != null) {
            let gasPrice = await wallet.getGasPrice();
            //let gasPrice = Tools.getFNum(Tools.chainUrlList[chainId]['gasPrice'],10);
            gasSet = { gasLimit :maxGasLimit,gasPrice:gasPrice.toString()};
        }else{
            gasSet =  { gasLimit :maxGasLimit};
        }

        const tx =  await contract.approve(spenderAddr,tokenId,gasSet);
        const receipt = await tx.wait();

        // The transaction is now on chain!
        console.log(tokenAddr,spenderAddr,`,Approve in block ${receipt.blockNumber},tx:`,tx.hash);
        return receipt;
    }

    static async getTranscationResult(chainId,hash){
        let providerUrl = Tools.chainUrlList[chainId]['provider'];
        const provider = new ethers.providers.JsonRpcProvider(providerUrl);
        const rst =  await provider.getTransactionReceipt(hash);
        if(rst != null && rst.status==0){
            return false;
        }else{
            return true;
        }
    }

    static async getSigner(providerUrl){
        let provider = null;
        if(providerUrl.indexOf("wss") != -1){
            provider = new  ethers.providers.WebSocketProvider(providerUrl);
        }else{
            provider = new ethers.providers.JsonRpcProvider(providerUrl);
        }

        let wallet = new Wallet(this.getPrivateKey(),provider);
        return wallet;
    }

    static async sendTransaction(to,value:string,providerUrl,chainId,isGasLimit = true){
        const provider = new ethers.providers.JsonRpcProvider(providerUrl);
        let wallet = new Wallet(this.getPrivateKey(),provider);
        value=value.substring(0,17);
        //let maxGasLimit = 30000;
        let maxGasLimit = Tools.chainUrlList[chainId]['maxGasLimit'];
        let gasSet = null;
        let gasPrice = await wallet.getGasPrice();
        if(Tools.chainUrlList[chainId]['gasPrice'] != null) {
           // let gasPrice = Tools.getFNum(Tools.chainUrlList[chainId]['gasPrice'],10);
            gasSet = { gasLimit :maxGasLimit,gasPrice:gasPrice};
        }else{
            if(isGasLimit){
                gasSet =  { gasLimit :maxGasLimit,gasPrice:gasPrice};
            }

        }
        const tx = await wallet.sendTransaction({
            to:to,
            value: ethers.utils.parseEther(value),
            ...(gasSet)
        });
        console.log("end send transaction...");
        console.log(`https://.etherscan.io/tx/${tx.hash}`);
        // Waiting for the transaction to be mined
        const receipt = await tx.wait();
        // The transaction is now on chain!
        console.log(`sendTransation in block ${receipt.blockNumber}`);
        return receipt;
    }

    static async transfer(chainId,tokenAddr,spenderAddr,amountIn){

        let jsonAbi = ['function transfer(address spender, uint amount) public returns(bool)'];
        let maxGasLimit = Tools.chainUrlList[chainId]['maxGasLimit'];
        let providerUrl = Tools.chainUrlList[chainId]['provider'];
        const provider = new ethers.providers.JsonRpcProvider(providerUrl);
        let wallet = new ethers.Wallet(this.getPrivateKey(),provider);
        let contract =  new ethers.Contract(tokenAddr,jsonAbi,wallet);
        let gasPrice = await wallet.getGasPrice();
        const tx =  await contract.transfer(spenderAddr,amountIn,{
            gasLimit:maxGasLimit,gasPrice:gasPrice
        });
        const receipt = await tx.wait();

        // The transaction is now on chain!
        console.log(tokenAddr,spenderAddr,`,transfer in block ${receipt.blockNumber},tx:`,tx.hash);
        return receipt;
    }

    static async signerRpcSig(){
        const signer = async data => {
            let { r, s, v } = ethUtil.ecsign(data, ethUtil.toBuffer(this.getPrivateKey()));
            return ethUtil.toRpcSig(v, r, s)
        }
        return signer;
    }

}