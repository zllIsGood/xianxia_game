/**
 * Created by hrz on 2017/8/8.
 */

class Mine extends BaseSystem {

    mineCount:number;//采矿次数
    robCount:number;//掠夺次数
    mineStartTime:number = 0;//采矿开始时间 0未开始
    mineEndTime:number = 0;//采矿结束时间 0未开始
    mineId:number;//矿id
    mineFreshCount:number;//已刷新次数
    mineQuaCount:number;//当前品质刷新次数

    mineRecords:MineRecord[];//记录

    finishedData:{configID:number,beRob:{name:string,win:boolean}[]};//完成数据

    hasNewRecord:boolean = false;

    robData:any;

    constructor(){
        super();
        this.sysId = PackageID.Mine;
        this.regNetMsg(1, this.postMineBaseInfo);
        this.regNetMsg(2, this.postRefresh);
        this.regNetMsg(3, this.postStartMine);
        this.regNetMsg(4, this.postInitScene);
        this.regNetMsg(6, this.postMineRecord);
        this.regNetMsg(7, this.doReqResult);
        this.regNetMsg(8, this.postFightBackResult);
        this.regNetMsg(9, this.postEnemyAppear);
        this.regNetMsg(11, this.postSceneUpdate);
        this.regNetMsg(13, this.postRobResult);
        this.regNetMsg(15, this.postFinished);
        this.regNetMsg(16, this.postRecordHasUpdate);
        this.regNetMsg(17, this.postRoleInfo);

        this.observe(GameLogic.ins().postEnterMap, this.onEnterMap);
    }

    static ins():Mine {
        return super.ins() as Mine;
    }

    private onEnterMap() {
        if(GameMap.sceneInMine() && this.hasNewRecord && !this.finishedData) {
            ViewManager.ins().open(MineRecordWin);
        }
    }

    static openCheck(showTips?) {
        let sv = GlobalConfig.CaiKuangConfig.openServerDay;
        if (sv > GameServer.serverOpenDay+1) {
            if(showTips) UserTips.ins().showTips(`开服第${sv}天开启`);
            return false;
        }
        let v = GlobalConfig.CaiKuangConfig.openLevel;
        let b = Actor.level >= v;
        if (!b) {
            if(showTips) UserTips.ins().showTips(`${v}级开启`);
            return false;
        }
        return b;
    }

    static redpointCheck() {
        let b = this.openCheck();
        if(!b) return b;
        let addCount = Recharge.ins().franchise?GlobalConfig.PrivilegeData.addKuangCount:0;
        if(Mine.ins().finishedData || (Mine.ins().mineCount < GlobalConfig.CaiKuangConfig.maxOpenKuangCount+addCount && !Mine.ins().mineStartTime) || Mine.ins().hasNewRecord){
            return b;
        }
        return false;
    }

    public postRedPoint():number {
        return Mine.redpointCheck() ? 1 : 0;
    }

    //state:1开始 0结束
    public postMineFightState(state:number) {
        return state;
    }

    /**
     * 49-1 采矿基础数据
     * @param bytes
     */
    public postMineBaseInfo(bytes:GameByteArray):void {
        this.mineCount = bytes.readShort();
        this.robCount = bytes.readShort();
        this.mineId = bytes.readInt();
        this.mineFreshCount = bytes.readInt();
        this.mineQuaCount = bytes.readInt();

        if (!this.mineId) {
            this.finishedData = null;//领取奖励后清除矿结果
        }

        Mine.ins().postRedPoint();
    }

    /**
     * 49-2 刷新采矿品质返回
     * @param bytes
     */
    public postRefresh(bytes:GameByteArray):void {
        this.mineId = bytes.readInt();
        this.mineFreshCount = bytes.readInt();
        let count = bytes.readInt();
        if(count > this.mineQuaCount) {
            let config = GlobalConfig.KuangYuanConfig[Mine.ins().mineId];
            let num = Math.floor(config.maxTimes / config.baseTime);
            UserTips.ins().showTips(`升级失败，祝福值+${num}`);
        }
        this.mineQuaCount = count;
    }

    /**
     * 49-3 开始采矿返回
     * @param bytes
     */
    public postStartMine(bytes:GameByteArray):void {
        this.mineCount = bytes.readShort();

        Mine.ins().postRedPoint();
    }

    /**
     * 49-4 采矿场景信息
     * @param bytes
     */
    public postInitScene(bytes:GameByteArray){
        MineData.ins().parser(bytes);
    }

    /**
     * 49-6 采矿记录
     * @param bytes
     */
    public postMineRecord(bytes:GameByteArray){
        let len = bytes.readShort();
        this.mineRecords = this.mineRecords || [];
        this.mineRecords.length = len;
        for (let i = 0; i < len; i++) {
            this.mineRecords[i] = this.mineRecords[i] || new MineRecord();
            this.mineRecords[i].parser(bytes);
        }
        this.hasNewRecord = false;

        Mine.ins().postRedPoint();
    }

    /**
     * 49-7
     * 请求掠夺结果
     * @param bytes
     */
    private doReqResult(bytes:GameByteArray) {
        let b = bytes.readBoolean();
        if(b) {
            MineFight.ins().start({type:0, id:this.robData.configID, actorID:(this.robData as MineModel).actorID});
        } else {
            UserTips.ins().showTips(`不可掠夺`);
        }
    }

    /**
     * 49-8 复仇结果
     * @param bytes
     */
    public postFightBackResult(bytes:GameByteArray) {
        let win = bytes.readBoolean();
        let index = bytes.readInt();
        for (let record of this.mineRecords) {
            if (record.index == index) {
                record.isBeatHim = win ? 1:0;
                break;
            }
        }
    }

    /**
     * 49-9 敌方数据出现
     * @param bytes
     */
    public postEnemyAppear(bytes:GameByteArray) {
        let model = new MineEnemyModel();
        model.parser(bytes);
        return model;
    }

    /**
     * 49-11 场景数据更新
     * @param bytes
     */
    public postSceneUpdate(bytes:GameByteArray) {
        let info:MineSceneInfo = ObjectPool.pop('MineSceneInfo');
        info.parser(bytes);
        info.handler();
        info.destroy();
    }

    /**
     * 49-13 掠夺返回
     * @param bytes
     */
    public postRobResult(bytes:GameByteArray){
        this.robCount = bytes.readShort();
    }

    /**
     * 49-15 采矿结束
     * @param bytes
     */
    public postFinished(bytes:GameByteArray) {
        this.mineStartTime = 0;
        this.mineEndTime = 0;
        this.finishedData = {} as any;
        this.finishedData.configID  = bytes.readShort();
        this.finishedData.beRob = [];
        let len = bytes.readShort();
        for (let i = 0; i < len; i++) {
            let obj:any = {};
            obj.name = bytes.readString();
            obj.win = bytes.readBoolean();
            this.finishedData.beRob.push(obj);
        }

        this.openRobWin();

        Mine.ins().postRedPoint();
    }

    private openRobWin(){
        if (GameMap.sceneInMine() && !MineFight.ins().isFighting && this.finishedData) {
            ViewManager.ins().open(MineRobWin, this.finishedData);
        }
    }

    /**
     * 49-16 记录有更新
     * @param bytes
     */
    public postRecordHasUpdate(bytes:GameByteArray){
        this.hasNewRecord = true;
        Mine.ins().postRedPoint();
        return 1;
    }

    /**
     * 49-17 更新战力
     * @param bytes
     * @returns {number}
     */
    public postRoleInfo(bytes:GameByteArray){
        let power = bytes.readDouble();
        return power;
    }


    //------------------------------发送----------------------------

    /**
     * 49-1 进入采矿
     */
    public sendIntoMine() {
        this.sendBaseProto(1);
    }

    /**
     * 49-2 刷新品质
     * @parma 1:道具 2:元宝  不发初始化
     */
    public sendRefresh(tp?:number){
        if(!tp){
            this.sendBaseProto(2);
            return;
        }
        let bytes:GameByteArray = this.getBytes(2);
        bytes.writeShort(tp);
        this.sendToServer(bytes);
    }

    /**
     * 49-3 开始采矿
     */
    public sendStart(){
        this.sendBaseProto(3);
    }

    /**
     * 49-5 领取采矿奖励
     */
    public sendGetAward(isDouble:boolean = false) {
        let bytes:GameByteArray = this.getBytes(5);
        bytes.writeShort(isDouble?1:0);
        this.sendToServer(bytes);
    }

    /**
     * 49-6 查看记录
     */
    public sendGetRecord() {
        this.sendBaseProto(6);
    }

    /**
     * 49-7 掠夺别人
     */
    public sendRob(data:MineModel) {
        this.robData = data;
        let actorId = (data as MineModel).actorID;
        let bytes:GameByteArray = this.getBytes(7);
        bytes.writeInt(actorId);
        this.sendToServer(bytes);
    }

    /**
     * 49-8 复仇
     */
    public sendFightBack(recordId){
        let bytes:GameByteArray = this.getBytes(8);
        bytes.writeInt(recordId);
        this.sendToServer(bytes);
    }

    /**
     * 49-10 上报复仇战斗结果
     */
    public sendFightBackResult(win:boolean, index:number) {
        let bytes:GameByteArray = this.getBytes(10);
        bytes.writeInt(win?1:0);
        bytes.writeInt(index);
        this.sendToServer(bytes);
    }

    /**
     * 49-12 快速完成
     */
    public sendQuickFinish() {
        this.sendBaseProto(12);
    }

    /**
     * 49-13 上报掠夺战斗结果
     */
    public sendRobResult(win,mineId,actorID) {
        let bytes:GameByteArray = this.getBytes(13);
        bytes.writeInt(win?1:0);
        // bytes.writeInt(mineId);
        // bytes.writeInt(actorID);
        this.sendToServer(bytes);
    }

    /**
     * 49-14 场景切换
     */
    public sendSceneChange(next) {
        let bytes:GameByteArray = this.getBytes(14);
        bytes.writeShort(next?1:0);
        this.sendToServer(bytes);
    }

    /**
     * 49-17 获取信息
     */
    public sendGetRolePower(roleId) {
        let bytes:GameByteArray = this.getBytes(17);
        bytes.writeInt(roleId);
        this.sendToServer(bytes);
    }
}

namespace GameSystem {
    export let  mine = Mine.ins.bind(Mine);
}