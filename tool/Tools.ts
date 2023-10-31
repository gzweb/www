
import axios from 'axios';
import getMAC, { isMAC } from 'getmac'
import {ethers,utils} from "ethers";
//npm install --save url-search-params
import {URLSearchParams} from 'url';
import getmac from "getmac";
import {WalletTool} from "./WalletTool";
import {isBoolean} from "util";
export class Tools{

    static chainUrlList = {
        //9aa3d95b3bc440fa88ea12eaa4456161
        1:{provider:"https://mainnet.infura.io/v3/5b74d8f014ca4f51b7ec409cfb73e72f",gasLimit:0.2,maxGasLimit:500000,bridgeContract:"0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820"},
        8888:{provider:"https://mainnet.infura.io/v3/5b74d8f014ca4f51b7ec409cfb73e72f",gasLimit:0.2,maxGasLimit:500000,bridgeContract:"0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820"},
        10:{provider:"https://optimism-mainnet.infura.io/v3/5b74d8f014ca4f51b7ec409cfb73e72f",gasLimit:0.02,gasPrice:120,maxGasLimit:800000,bridgeContract:"0x9D39Fc627A6d9d9F8C831c16995b209548cc3401"},
        7777777:{provider:"https://rpc.zora.co",gasLimit:0.02,maxGasLimit:200000},
        56:{provider:"https://bsc-dataseed3.binance.org",gasLimit:0.2,maxGasLimit:300000,bridgeContract:"0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF"},
        //https://polygon-rpc.com/ https://polygon-mainnet.g.alchemy.com/v2/hpnMedtqswbZoEUJvE3yARKsdrajLBQD
        137:{provider:"https://polygon-mainnet.g.alchemy.com/v2/hpnMedtqswbZoEUJvE3yARKsdrajLBQD",gasLimit:4,maxGasLimit:800000,gasPrice:60,bridgeContract:"0x88DCDC47D2f83a99CF0000FDF667A468bB958a78"},
        43114:{provider:"https://api.avax.network/ext/bc/C/rpc",maxGasLimit:1000000,gasLimit:1,bridgeContract:"0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4"},
        250:{provider:"https://rpc.ftm.tools/",gasLimit:3,maxGasLimit:1000000,bridgeContract:"0x374B8a9f3eC5eB2D97ECA84Ea27aCa45aa1C57EF"},
        100:{provider:"https://rpc.xdaichain.com",gasLimit:1,maxGasLimit:2000000,bridgeContract:"0x3795C36e7D12A8c252A20C5a7B455f7c57b60283"},
        //https://arb-mainnet.g.alchemy.com/v2/HChcj1s6j5gvsSjWSW7GGOlCg70NNblU
        //https://arbitrum-mainnet.infura.io/v3/5b74d8f014ca4f51b7ec409cfb73e72f
        //https://arb1.arbitrum.io/rpc
        42161:{provider:"https://arb1.arbitrum.io/rpc",gasLimit:0.03,maxGasLimit:300000,bridgeContract:"0x1619DE6B6B20eD217a58d00f37B9d47C7663feca"},
        //test
        5:{provider:"https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",maxGasLimit:1000000,gasLimit:0.03,bridgeContract:"0x358234B325EF9eA8115291A8b81b7d33A2Fa762D"},
        //test
        3:{provider:"https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",maxGasLimit:1000000,gasLimit:0.03,bridgeContract:""},
        //test
        4:{provider:"https://rinkeby.infura.io/v3/5b74d8f014ca4f51b7ec409cfb73e72f",maxGasLimit:1000000,gasLimit:0.03,bridgeContract:""},
        //test
        33:{provider:"https://rinkeby.infura.io/v3/5b74d8f014ca4f51b7ec409cfb73e72f",maxGasLimit:1000000,gasLimit:0.03,bridgeContract:""},
        //test
        22:{provider:"https://rinkeby.arbitrum.io/rpc",maxGasLimit:1000000,gasLimit:0.03,bridgeContract:""},
        999:{provider:"https://zksync2-testnet.zksync.dev",maxGasLimit:1000000,gasLimit:0.03,bridgeContract:""},
        //https://zksync.drpc.org https://mainnet.era.zksync.io
        324:{provider:"https://mainnet.era.zksync.io",maxGasLimit:1500000,gasLimit:0.03,bridgeContract:""},
        //https://alpha-mainnet.starknet.io https://starknet-mainnet.infura.io/v3/bafe1b1147bf485ab1e0c5fadc493b0c
        7777:{provider:"https://alpha-mainnet.starknet.io",maxGasLimit:1000000,gasLimit:0.03,bridgeContract:""},
        1101:{provider:"https://zkevm-rpc.com",maxGasLimit:1000000,gasLimit:0.03,bridgeContract:""},
        53935:{provider:"https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc",maxGasLimit:160000,gasLimit:0.03,bridgeContract:""},
        59144:{provider:"https://rpc.linea.build",maxGasLimit:1000000,gasLimit:0.03,bridgeContract:""},
        8453:{provider:"https://mainnet.base.org",maxGasLimit:2000000,gasLimit:0.03,bridgeContract:""},
        534352:{provider:"https://1rpc.io/scroll",maxGasLimit:2000000,gasLimit:0.03,bridgeContract:""},
        //https://alpha4.starknet.io

    }

    static LINE = "---";

    static dev = 1;

    static CUR

    static getUrlWithParam(url,params = null){
        if(params != null){
            url =  url+ '?'+new URLSearchParams(params) ;
        }
        return url;
    }
    static async requestGet(url,proxy=false,headers = {},params={}){
        try{
          // url = this.getUrlWithParam(url,params);
            //return fetch(url, {signal: Timeout(10).signal}).then(res => res.json());
            proxy = false;
            if(!proxy){
                await Tools.sleep(1000);
                const rst =  await axios.get(url,{timeout:30000,headers:headers,params:params,
                    validateStatus:function (status) {

                    return status == 200 || status == 400 || status == 404; // 默认的
                }}).then(res => {return res.data;});
                return rst;
            }else{
                const HttpsProxyAgent = require("https-proxy-agent");
                const httpsAgent = new HttpsProxyAgent(`http://127.0.0.1:4780`);
                const newAxios = axios.create({
                    proxy:false,
                    httpsAgent
                });
                return await newAxios.get(url,{timeout:15000}).then(res => res.data);
            }


        }catch(e){
            if(e.response != null ){
                console.log('url error:',url,e,e.response.status,e.response.statusText);
                if(url.indexOf("etherscan") >0){
                    throw 100;
                }
            }else if(e.code != null){
                console.log('url error2:',e.code,url);
                if(e.code=="ENOTFOUND" || e.code=="ECONNABORTED"|| e.code=="ECONNRESET"){
                    await this.sleep(1000);
                    throw 100;
                }
            }else{
                console.log('url error3:',e);
                process.exit(0);
            }

            return null;
        }
    }

    static async requestPost(url,params,headers={'Content-Type':'application/json'}
                             ,proxy=false,timeout=45000,newProxy=false){
        try{
            //console.log(JSON.stringify(data));
            proxy = false;
            newProxy = false;
            if(!proxy && !newProxy){
                await Tools.sleep(1000);
                return await axios.post(url,JSON.stringify(params),{timeout:timeout,headers:headers,
                    validateStatus:function (status) {
                       // console.log("status",status);
                        return status >= 200 && status < 500; // 默认的
                    }
                }).then(res => res.data);
            }else{
                const HttpsProxyAgent = require("https-proxy-agent");
                const httpsAgent = new HttpsProxyAgent(`http://127.0.0.1:4780`);
                const newAxios = axios.create({
                    proxy:false,
                    httpsAgent
                });
                return await newAxios.post(url,JSON.stringify(params),{timeout:15000,headers:headers,
                    validateStatus:function (status) {
                   // console.log(status);
                        return status >= 200 && status < 500; // 默认的
                    }
                }).then(res => res.data);
            }

        }catch(e){
            throw e;
        }
    }

    static async requestEncodePost(url,params,headers={'Content-Type':'application/json'}
        ,proxy=false,timeout=45000,newProxy=false){
        try{
                return await axios.post(url,params,{timeout:timeout,headers:headers,
                    validateStatus:function (status) {
                        // console.log("status",status);
                        return status >= 200 && status < 500; // 默认的
                    }}).then(res => res.data);;


        }catch(e){
            throw e;
        }
    }

    static async requestPostGetHeaders(url,params,headers={'Content-Type':'application/json'}){
        try{
                return await axios.post(url,JSON.stringify(params),{timeout:15000,headers:headers,
                    validateStatus:function (status) {
                        return status >= 200 && status < 500; // 默认的
                    }
                }).then(res => res.headers);


        }catch(e){
            console.log(e);
        }
    }

    static async requestPostGetAllData(url,params,headers={'Content-Type':'application/json'}){
        try{
            return await axios.post(url,JSON.stringify(params),{timeout:15000,headers:headers,
                validateStatus:function (status) {
                    return status >= 200 && status < 500; // 默认的
                }
            }).then(res => res);


        }catch(e){
            console.log(e);
        }
    }

    static async getCurGasLimit(chainId){
            let url = "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=SXMFIXAJ1NBXGRN8E6EZF7IJDWZVDYXF5P";
            let rst = await this.requestGet(url);
            console.log(rst);
            if(rst.status == 1){
                return rst['ProposeGasPrice'];
            }else{
                return null;
            }
    }

    static async getCurCostEth(gasPrice,gas){
        let cost = gasPrice*WalletTool.gasLimit
    }

    static isDEV(){
        const { DEV } = process.env;
        return parseInt(DEV)>0 ? true : false ;
    }

    static getFNum(amountIn,decimals) {
        let shortNum = 6;
        if(decimals>shortNum){
            amountIn = amountIn *Math.pow(10,shortNum)-2;
            decimals -=shortNum;
        }
        amountIn = amountIn.toFixed(0);
        for (let i = 0; i < decimals; i++) {
            amountIn += "0";
        }
        return amountIn;
    }

    static rand(min, max) {
        return parseInt(Math.random() * (max - min + 1) + min, 0);
    }

    static async sleep(ms){
        return new Promise(resolve=>setTimeout(resolve, ms))
    }

    static getInfo(){
        const getmac = require("getmac");
        const cpuNo = getMAC("anpi1");
        return cpuNo;
    }

    static async curEthGas(type="fast"){
        const url = "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=SXMFIXAJ1NBXGRN8E6EZF7IJDWZVDYXF5P";
        const data = await this.requestGet(url);
        console.log("cur eth gas",data.result.FastGasPrice);
        if(type=="safe"){
            return data.result.SafeGasPrice;
        }
        return data.result.FastGasPrice;
    }


    static async requestPut(url,proxy=false,headers = {},params={}){
        try{
            // url = this.getUrlWithParam(url,params);
            //return fetch(url, {signal: Timeout(10).signal}).then(res => res.json());
            proxy = false;
            if(!proxy){
                return await axios.put(url,JSON.stringify(params),{timeout:15000,headers:headers,method:"PUT",
                    validateStatus:function (status) {
                        console.log(status);
                        return status == 200 ; // 默认的
                    }}).then(res => res.data);
            }else{
                const HttpsProxyAgent = require("https-proxy-agent");
                const httpsAgent = new HttpsProxyAgent(`http://127.0.0.1:4780`);
                const newAxios = axios.create({
                    proxy:false,
                    httpsAgent
                });
                return await newAxios.put(url,{timeout:15000}).then(res => res.data);
            }


        }catch(e){
            if(e.response != null ){
                console.log('url error:',url,e.response.status,e.response.statusText);
            }else if(e.code != null){
                console.log('url error2:',e.code);
                if(e.code=="ENOTFOUND"){
                    await this.sleep(1000);
                }
            }else{
                console.log('url error2:',e);
            }

            return null;
        }
    }


    static async gasOk(maxGas = 20){
        let isContinue = true;
        let gas = 0;
        while(isContinue){
            gas = await Tools.curEthGas();
            if(gas>=maxGas){
                isContinue =true;
                console.log('sleep 10s');
                await Tools.sleep(10000);
                // return false;
            }else{
                isContinue =false;
            }
        }
        console.log('return gas',gas,isContinue);

        return isContinue==true ? false : gas;
    }

    static async waitCall(callback){
        while(true){
            const suc = await callback();
            if(suc){
                break;
            }else{
                console.log('sleep 10s');
                await Tools.sleep(10000);
            }
        }
    }

}