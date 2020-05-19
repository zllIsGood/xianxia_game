/**
 * Created by hrz on 2017/8/9.
 */

class MineScenePanel extends BaseEuiView {
    private workerNum:eui.Label;

    private nameTxt:eui.Label;
    private quickFinish:eui.Label;
    private time:eui.Label;
    public recordGroup:eui.Group;
    public xiangqing:eui.Image;
    public redPoint:eui.Image;
    private myGroup:eui.Group;
    private wakuangGroup:eui.Group;
    private wakuang:eui.Image;
    private redPoint1:eui.Image;
    private _totalTime:number;
    constructor(){
        super();
        this.skinName = `WaKuangFbSkin`;
    }

    open() {

        this.quickFinish.textFlow = [{text:`快速完成`,style:{underline:true}}];
        this.addTouchEvent(this.quickFinish, this.onTap);
        this.addTouchEvent(this.xiangqing, this.onTap);
        this.addTouchEvent(this.wakuang, this.onTap);

        this.observe(GameLogic.ins().postEnterMap, this.updateBase);
        this.observe(Mine.ins().postMineBaseInfo, this.updateBase);
        this.observe(Mine.ins().postInitScene, this.updateScene);
        this.observe(Mine.ins().postSceneUpdate, this.updateScene);
        this.observe(Mine.ins().postRecordHasUpdate, this.recordHasUpdate);//显示红点
        this.observe(Mine.ins().postMineRecord, this.recordHasUpdate);//打开记录就把红点隐藏
        this.observe(Mine.ins().postMineFightState, this.updateScene);//是否开始矿洞战
        this.observe(Mine.ins().postStartMine,this.MineRedPoint);//返回采矿次数刷新红点
        this.observe(Mine.ins().postFinished,this.MineRedPoint);//完成挖矿刷新红点

        this.updateScene();
    }

    close(){
        TimerManager.ins().removeAll(this);
    }

    private onTap(e:egret.Event) {
        let target = e.currentTarget;
        if(target == this.quickFinish){
            this.openQuick();
        } else if (target == this.xiangqing) {
            ViewManager.ins().open(MineRecordWin);
        } else if (target == this.wakuang ){
            ViewManager.ins().open(MineChoseWorkerWin);
        }
    }

    private openQuick(){
        let sec = Math.floor((this._totalTime * 1000 + Mine.ins().mineStartTime - GameServer.serverTime)/1000);
        let min = Math.ceil(sec/60);
        let cost = GlobalConfig.CaiKuangConfig.quickCost * min;
        if (cost <= 0) return;
        if(Actor.yb < cost) {
            UserTips.ins().showTips(`元宝不足`);
            return;
        }
        let str = `确定消耗<font color='#FFB82A'>${cost}元宝</font>快速完成挖矿？`;
        WarnWin.show(str,()=> {
            Mine.ins().sendQuickFinish();
        },this);
    }

    private updateBase() {
        let myMine = MineData.ins().myMine;

        if (MineFight.ins().isFighting) { 
            this.recordGroup.visible = false;
        } else {
            this.recordGroup.visible = true;
        }
        this.wakuangGroup.visible = this.recordGroup.visible;

        if (GameServer.serverTime < Mine.ins().mineEndTime && myMine) {
            this.myGroup.visible = true;
            let config = GlobalConfig.KuangYuanConfig[myMine.configID];
            this._totalTime = config.needTime;
            this.addTime();
        } else {
            this.removeTime();
            this.myGroup.visible = false;
        }
    }

    private updateScene(){
        let mineData = MineData.ins();
        this.nameTxt.text = `灵脉矿洞${mineData.index}`;
        this.workerNum.text = `矿工：${mineData.mines.length}人`;
        this.recordHasUpdate(Mine.ins().hasNewRecord);
        this.MineRedPoint();
        this.updateBase();
    }

    private recordHasUpdate(b) {
        this.redPoint.visible = !!b;
    }

    private MineRedPoint(){
        this.redPoint1.visible = Mine.ins().mineCount < GlobalConfig.CaiKuangConfig.maxOpenKuangCount && !Mine.ins().mineStartTime;
    }

    private addTime(){
        if(!TimerManager.ins().isExists(this.timeHandler,this)){
            TimerManager.ins().doTimer(1000,0,this.timeHandler,this);
        }
    }

    private timeHandler(){
        // let addTime = 0;
        // if( Recharge.ins().franchise )
        //     addTime = GlobalConfig.PrivilegeData.reduceKuangTime;
        // let sec = Math.floor(((this._totalTime - addTime)*1000 + Mine.ins().mineStartTime - GameServer.serverTime)/1000);
        let sec = Math.floor(((this._totalTime)*1000 + Mine.ins().mineStartTime - GameServer.serverTime)/1000);
        //let sec = Math.floor((Mine.ins().mineEndTime - GameServer.serverTime)/1000);
    
        if (sec >= 0) {
            this.time.text = `（${DateUtils.getFormatBySecond(sec, DateUtils.TIME_FORMAT_3)}）`;
        }
    }

    private removeTime(){
        TimerManager.ins().remove(this.timeHandler, this);
    }
}

ViewManager.ins().reg(MineScenePanel, LayerManager.UI_Main);