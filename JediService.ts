import {Tools} from '../../tool/Tools';
import {CurrencyAmount, JSBI, Percent, Route, Router, Pair,Token, TokenAmount, Trade, TradeType} from "../../jediswap-sdk";
import { Account, shortString,ec,RawArgs,Provider,uint256,stark,TransactionStatus,hash,CallData } from "starknet";
import {Currency} from "../../jediswap-sdk/src";
import {WalletTool} from "../../tool/WalletTool";
import {StarkNetWalletTool} from "../../tool/StarkNetWalletTool";
import {ethers,utils} from "ethers";

export class JediService {

     async price(chainId,tokenA,tokenADecimal,tokenB,tokenBDecimal,amountIn:number){

    }

    async trade(chainId:number,tokenA,tokenADecimal,tokenB,tokenBDecimal,amountIn:number,amountOut:number,isEndTrade:number = 0,cairVersion="0"){

        let amountInStr = ethers.utils.parseUnits(amountIn.toString(),tokenADecimal).toString();
        let amountOutStr = ethers.utils.parseUnits(amountOut.toString(),tokenBDecimal).toString();
        console.log(amountOutStr);
        console.log(amountInStr);
        const tokenAmountIn = new Token(1,tokenA,tokenADecimal);
        const tokenAObj = new TokenAmount(tokenAmountIn,amountInStr);
        const tokenBObj = new TokenAmount(new Token(1,tokenB,tokenBDecimal),amountInStr);
        const currencyAmount = new TokenAmount(tokenAmountIn,BigInt(parseInt(amountInStr)));
        const route = new Route([new Pair(tokenAObj,tokenBObj)],tokenAObj.token,tokenBObj.token);
        console.log("route",amountIn.toString(),route);
        const  trade = new Trade(route,currencyAmount,TradeType.EXACT_INPUT);
        const recipient = WalletTool.getAddr();
        const deadline = parseInt((((new Date()).getTime()/1000)+3500).toFixed(0));
        const swapCalls = Router.swapCallParameters(trade, {
            feeOnTransfer: false,
            allowedSlippage: new Percent(JSBI.BigInt(2000), JSBI.BigInt(10000)),
            recipient,
            deadline: deadline
        })
        console.log("swapCalls",swapCalls);


        const args = swapCalls.args;
        //[amountIn, amountOut, path, to, deadline]
        const methodName = swapCalls.methodName;

        const value = swapCalls.value;
        const rstAmountIn = args[0];
        const rstAamountOut = args[1];
        // @ts-ignore
        const uint256AmountIn = uint256.bnToUint256(rstAmountIn)
        // @ts-ignore
        const uint256AmountOut = uint256.bnToUint256(rstAamountOut)


        // @ts-ignore
        const swapArgs: RawArgs = {
            amountIn: uint256AmountIn,
            amountOutMin: uint256AmountOut,
            path:args[2],
            to:args[3],
            deadline:deadline
        }
        console.log("swapArgs",swapArgs,args);

        // const swapCalldata = [...Object.values(uint256AmountIn), ...Object.values(uint256AmountOut), path, to, deadline]

        const swapCalldata = CallData.compile(swapArgs);
        console.log("swapCalldata",swapCalldata);
        const contract ="0x41fd22b238fa21cfcf5dd45a8548974d8263b3a531a60388411c5e230f97023";
        let swapCallList = [];
        const approveCall = await StarkNetWalletTool.approve(contract,tokenA,BigInt(parseInt(amountInStr)));
        if(approveCall != null){
           swapCallList.push(approveCall);
        }
        const swapCall = {
            contractAddress:contract,
            entrypoint: methodName,
            calldata:  swapCalldata
        }
        swapCallList.push(swapCall);
        console.log(swapCallList);
        const tx = await StarkNetWalletTool.execute(swapCallList,cairVersion);
        console.log("tx",tx);
        return tx;

    }


}