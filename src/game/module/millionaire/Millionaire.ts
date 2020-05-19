/**
 * Created by hjh on 2017/8/26.
 */

class Millionaire extends BaseSystem {
    public dice:number;//剩余筛子数
    public gridId:number;//当前格子索引
    public round:number;//当前玩过了第几圈(不包括当前正在玩的)
    public roundReward:number;//圈数奖励已领标记位
    public randomGridById:number;//踩中全盘随机奖励的格仔(最新踩中的随机命运格子id)
    public randomGridByRewardId:number;//踩中全盘随机奖励的格仔中的奖励索引(随机命运配置表中奖励param的数组索引)
    public rewardIdByGrids:number[];//随机到的奖励索引数组


    public isStrideStart:number;//是否跨越了起点,1是,0否
    public dicePoint:number;//摇到的点数(1-6)

    public autoTurnDice:number;//勾选了不弹出提示框
    public isAutoGo:boolean;//自动扔骰子


    constructor(){
        super();
        this.sysId = PackageID.Millionaire;
        this.regNetMsg(1, this.postMillionaireInfo);
        this.regNetMsg(2, this.postTurnDice);
        this.regNetMsg(3, this.postRoundReward);
        this.regNetMsg(4, this.postOverAllReward);
        this.regNetMsg(5, this.postMillionaireUpdate);

        this.dice = 0;
        this.gridId = 0;
        this.round = 0;
        this.roundReward = 0;
        this.randomGridById = 0;
        this.randomGridByRewardId = 0;
        this.rewardIdByGrids = [];
        this.isStrideStart = 0;
        this.dicePoint = 0;
        this.autoTurnDice = 0;
        this.isAutoGo = false;
    }

    static ins():Millionaire {
        return super.ins() as Millionaire;
    }
    //服务器数据下发处理
    //============================================================================================
    /**
     * 返回大富翁所有信息
     * @param bytes
     * 57-1
     */
    public postMillionaireInfo(bytes: GameByteArray):void{
        // MillionaireData.ins().parser(bytes);
        this.dice        = bytes.readShort();
        this.gridId      = bytes.readShort();
        this.round       = bytes.readShort();
        this.roundReward = bytes.readInt();
        this.randomGridById = bytes.readShort();
        this.randomGridByRewardId = bytes.readUnsignedByte();
        let gridSum     = bytes.readShort();
        for( let i = 1;i <= gridSum;i++ ){//服务器发回来奖励索引从1开始
            let reward = bytes.readShort();
            this.rewardIdByGrids[i] = reward;
        }
        // egret.log("***************57-1****************");
        // egret.log("当前剩余骰子: "+this.dice);
        // egret.log("当前所在格子: "+this.gridId);
        // egret.log("当前已走圈数: "+this.round);
        // egret.log("圈数奖励标记: "+this.roundReward);
        // egret.log("当前当前已踩随机命运: "+this.randomGridById);
        // egret.log("当前当前已踩随机命运奖励索引: "+this.randomGridByRewardId);
        let cfg:RichManGridConfig = GlobalConfig.RichManGridConfig[this.gridId];
        if( cfg && cfg.action == 2 ){
            // egret.log("当前格子是随机命运格子");
        }
    }

    /**
     * 摇骰子返回
     * @param bytes
     * 57-2
     */
    public postTurnDice(bytes: GameByteArray):void{
        // MillionaireData.ins().parserTurnDice(bytes);
        this.isStrideStart = bytes.readUnsignedByte();
        this.gridId        = bytes.readShort();
        this.dicePoint     = bytes.readUnsignedByte();
        // this.dice        = bytes.readShort();
        // egret.log("***************57-2****************");
        // egret.log("是否跨越了起点: "+this.isStrideStart);
        // egret.log("当前最新的位置: "+this.gridId);
        // egret.log("摇到的点数: "+this.dicePoint);
        // egret.log("当前剩余骰子: "+this.dice);
    }

    /**
     * 返回领取圈数奖励
     * @param bytes
     * 57-3
     */
    public postRoundReward(bytes: GameByteArray):void{
        let roundRewardConfigId = bytes.readUnsignedByte();//圈数奖励配置的索引
        // MillionaireData.ins().parserRoundReward(bytes);
        this.roundReward = bytes.readInt();
        // egret.log("***************57-3****************");
        // egret.log("圈数奖励已领标记位: "+this.roundReward);
    }

    /**
     * 通知全盘需要变换到指定奖励
     * 57-4
     */
    public postOverAllReward(bytes: GameByteArray):void{
        // MillionaireData.ins().parserOverAllReward(bytes);
        this.randomGridById = bytes.readShort();
        this.randomGridByRewardId = bytes.readUnsignedByte();
        // egret.log("***************57-4****************");
        // egret.log("当前当前已踩随机命运: "+this.randomGridById);
        // egret.log("当前当前已踩随机命运奖励索引: "+this.randomGridByRewardId);
    }

    /**
     * 监听大富翁一些数据变更(如:骰子数)
     * 57-5
     */
    public postMillionaireUpdate(bytes: GameByteArray):void{
        // MillionaireData.ins().parserMillionaireUpdate(bytes);
        this.dice        = bytes.readShort();
        this.round       = bytes.readShort();
        this.roundReward = bytes.readInt();
        // egret.log("***************57-5****************");
        // egret.log("骰子更新剩余数: "+this.dice);
        // egret.log("当前已走圈数: "+this.round);
        // egret.log("圈数奖励标记: "+this.roundReward);
    }

    //客户端请求服务器处理
    //============================================================================================

    /**
     * 请求获取所有信息
     * 57-1
     */
    public sendMillionaireInfo() {
        this.sendBaseProto(1);
    }

    /**
     * 请求摇骰子
     * 57-2
     */
    public sendTurnDice() {
        this.sendBaseProto(2);
    }

    /**
     * 请求领取圈数奖励
     * @param 圈数奖励配置id
     * 57-3
     */
    public sendRoundReward(roundId:number) {
        let bytes:GameByteArray = this.getBytes(3);
        bytes.writeInt(roundId);
        this.sendToServer(bytes);
    }


    /** 红点 **/
    public getRedPoint():boolean{
        if( !MillionaireWin.isOpen() )
            return false;
        if( this.dice > 0 )
            return true;
        for( let k in GlobalConfig.RichManRoundAwardConfig ){
            //奖励未领取
            if( !(this.roundReward >> Number(k) & 1) ){
                //判断奖励圈数
                if( this.round >= GlobalConfig.RichManRoundAwardConfig[k].round )
                    return true;
            }
        }

        return false;
    }

}

namespace GameSystem {
    export let  millionaire = Millionaire.ins.bind(Millionaire);
}