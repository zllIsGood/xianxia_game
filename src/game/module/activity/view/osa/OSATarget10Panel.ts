/**
 * 活动类型10
 * Created by hujinheng 2017/12/6
 */
class OSATarget10Panel extends ActivityPanel {
    public title: eui.Image;
    public actTime:eui.Label;

    //抽奖
    private tttzhi:eui.Image;
    private choujiangBtn: eui.Button;


    //消耗
    private pay0:eui.Label;
    private label_needCharge:eui.Label;

    private list:eui.List;


    private rolling: boolean;
    private level: number;
    private isClick:boolean;//是否点击了抽奖

    private img_level:eui.Image;
    public constructor() {
        super();
        this.skinName = `YbTurntableSkin`;
    }

    public close(...param: any[]): void {
        this.removeObserve();

        egret.Tween.removeTweens(this.tttzhi);

        let data: ActivityType10Data = Activity.ins().activityData[this.activityID] as ActivityType10Data;
        if( data.state )
            Activity.ins().sendReward(this.activityID,this.level);

        this.rolling = false;
        this.isClick = false;
        TimerManager.ins().removeAll(this);
    }

    public open(...param: any[]): void {
        this.observe(Activity.ins().postChangePage, this.resultCallBack);
        // this.observe(Activity.ins().postRewardResult,this.updateView);
        TimerManager.ins().doTimer(1000,0,this.setTime,this);
        this.addTouchEvent(this.choujiangBtn, this.getLottery);

        this.list.itemRenderer = NoticeYBListRenderer;

        this.updateView();
    }


    private updateView():void{
        let data: ActivityType10Data = Activity.ins().activityData[this.activityID] as ActivityType10Data;
        let config:ActivityType10Config[] = GlobalConfig.ActivityType10Config[this.activityID];
        this.level = data.getLevel();//第几轮
        let lv:number = this.level;
        let finish = false;
        if( !this.level ){
            //全部抽取完毕
            lv = Object.keys(config).length;
            finish = true;
        }
        this.img_level.source = `trun_10000${lv}`;
        let cfg:ActivityType10Config = config[lv];
        for( let i = 0;i < cfg.info.length;i++ ){
            this[`multiple${i}`].text = cfg.info[i].multiple + "倍";
        }
        this.pay0.text = cfg.yuanBao + "";
        let color = 0x00ff00;
        let reyb = 0;
        if( data.yb < cfg.recharge ){
            color = 0xff0000;
            reyb = cfg.recharge - data.yb;
        }
        if( finish )
            this.label_needCharge.text = "充值转盘全部抽取完毕";
        else
            this.label_needCharge.textFlow = TextFlowMaker.generateTextFlow1(`再充值|C:${color}&T:${reyb}|C:0x00ff00&T:元宝可激活`);

        this.listRefush();
        this.setTime();

        let btnCfg:ActivityBtnConfig = GlobalConfig.ActivityBtnConfig[this.activityID];
        if( btnCfg )
            this.title.source = btnCfg.title;
    }
    /**有可能别的系统触发更新25-7导致进入这个函数 因此用this.isClick区分是否点击了*/
    private resultCallBack(id:number){
        if( !this.isClick ) return;
        let data: ActivityType10Data = Activity.ins().activityData[this.activityID] as ActivityType10Data;
        if( this.activityID != id )return;
        //正在转动 并且可领奖 第二次请求
        if( data.state )
            this.beginLottery(data.index);
        this.updateView();
        this.listRefush();
    }
    private beginLottery(index: number): void {
        let rotat: number = 360 * 4 + (index - 1) * 36;
        let tween: egret.Tween = egret.Tween.get(this.tttzhi);
        this.rolling = true;
        // let data: ActivityType10Data = Activity.ins().activityData[this.activityID] as ActivityType10Data;
        tween.to({"rotation": rotat}, 4000, egret.Ease.circOut).call(() => {
            Activity.ins().sendReward(this.activityID,this.level);
            this.flyItemEx(this["multiple"+(index-1)] as eui.BitmapLabel);
            egret.setTimeout(() => {
                this.rolling = false;
                this.isClick = false;
            },this, 2000);
        }, this);
    }


    private flyItemEx(itemicon:eui.BitmapLabel){
        let flyItem:eui.Image = new eui.Image(RewardData.getCurrencyRes(2));
        flyItem.x = itemicon.x;
        flyItem.y = itemicon.y;
        // flyItem.width = itemicon.width;
        // flyItem.height = itemicon.height;
        flyItem.scaleX = 1;
        flyItem.scaleY = 1;
        itemicon.parent.addChild(flyItem);
        GameLogic.ins().postFlyItemEx(flyItem);
    }

    private getLottery(): void {
        if( !this.level ){
            UserTips.ins().showTips("充值转盘全部抽取完毕");
            this.isClick = false;
            return;
        }
        let data: ActivityType10Data = Activity.ins().activityData[this.activityID] as ActivityType10Data;
        let cfg:ActivityType10Config = GlobalConfig.ActivityType10Config[this.activityID][this.level];
        if( !data.getCondition(this.level) ){
            UserTips.ins().showTips(`还需要充值${(cfg.recharge - data.yb)}元宝激活`);
            this.isClick = false;
            return;
        }

        if (this.rolling){
            UserTips.ins().showTips("正在抽奖，请稍候");
            return;
        }
        if( this.isClick ){
            UserTips.ins().showTips("等待抽奖结果 请稍后");
            return;
        }

        if ( Activity.ins().getRollSum(this.activityID) || Actor.yb >= cfg.yuanBao ) {
            this.isClick = true;
            Activity.ins().sendReward(this.activityID,this.level);
        }else{
            UserTips.ins().showTips("元宝不足");
            this.isClick = false;
        }
    }


    private listRefush(): void {
        let data: ActivityType10Data = Activity.ins().activityData[this.activityID] as ActivityType10Data;
        if( data ){
            let arr = [];
            for( let i = 0; i < data.noticeArr.length;i++ ){
                let notice = {activityID:this.activityID,name:data.noticeArr[i].name,multiple:data.noticeArr[i].multiple,yb:data.noticeArr[i].yb};
                arr.push(notice);
            }
            this.list.dataProvider = new eui.ArrayCollection(arr);
        }

    }

    private setTime(){
        let data: ActivityType10Data = Activity.ins().activityData[this.activityID] as ActivityType10Data;
        this.actTime.text = "剩余时间："+data.getRemainTime();
    }



}
