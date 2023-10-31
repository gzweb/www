
import {Tools} from "../tool/Tools";
import {WalletTool} from "../tool/WalletTool";

export abstract class AbstractPrj{
    abstract getTradeType();
    abstract getTradeId();
    abstract before(transferInfo);
    abstract middle(transferInfo);
    abstract after(transferInfo);
    abstract finsih(transferInfo);
    abstract isTransfer();
}