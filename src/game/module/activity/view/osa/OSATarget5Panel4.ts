/**
 * Created by samson on 2019/2/28.
 * 三八3天登录
 */

class OSATarget5Panel4 extends BaseView {
    public group1: eui.Group;
    public group: eui.Group;
    public suerBtn: eui.Button;
    private itemary: ItemBase[] = [];
    public daylabel: eui.Label;
    private btnMC: MovieClip;
    private day: number;
    private dayindex: number = 1;
    private dayaward: eui.Label;
    private scroller:eui.Scroller;
    private maxNum:number;
    private itemList: ActivityHFRenderItem[] = [];
    private redPoint:eui.Image;
    private _activityData:ActivityType5Data;
    private actTime:eui.Label;//剩余时间
    private arrow0:eui.Image;
    public activityID:number;
    constructor() {
        super();
        this.skinName = "SBloginSkin";
        this.itemary = [];
    }

    public open(...param: any[]): void {
        let config:ActivityType5Config[] = GlobalConfig.ActivityType5Config[this.activityID];
        this.maxNum = 0;
        this.itemList = [];
        for (let i: number = 0; i < 3; i++) {
            this.itemList[i] = this['dayNum' + (i+1)];
            this.itemList[i].touchEnabled = false;
            if(config[i+1]){
                if(this['dayNum' + (i+1)]){
                    this['dayNum' + (i+1)].visible = true;
                }
                if(this['imgDay' + (i+1)]){
                    this['imgDay' + (i+1)].visible = true;
                }
                if(this['arrow' + (i+1)]){
                    this['arrow' + (i+1)].visible = true;
                }
                this.maxNum ++;
            }else{
                if(this['dayNum' + (i+1)]){
                    this['dayNum' + (i+1)].visible = false;
                }
                if(this['imgDay' + (i+1)]){
                    this['imgDay' + (i+1)].visible = false;
                }
                if(this['arrow' + (i+1)]){
                    this['arrow' + (i+1)].visible = false;
                }
            }
        }
        this._activityData = Activity.ins().getActivityDataById(this.activityID) as ActivityType5Data;
        this.addTouchEvent(this.suerBtn, this.onTouch);
        this.addTouchEvent(this.group, this.onTouch);
        for (let i: number = 0; i < this.maxNum; i++) {
            this.addTouchEvent(this.itemList[i], this.itemTouch);
        }
        this.observe(Activity.ins().postActivityIsGetAwards,this.changeList);
        TimerManager.ins().doTimer(1000,0,this.setTime,this);
        this.updateData();
        let dayNum: number = param[0];
        if (dayNum) {
            this.setList(dayNum);
        }

    }
    private setTime(){
        let beganTime = Math.floor((DateUtils.formatMiniDateTime(this._activityData.startTime) - GameServer.serverTime) / 1000);
        let endedTime = Math.floor((DateUtils.formatMiniDateTime(this._activityData.endTime) - GameServer.serverTime) / 1000);
        if (beganTime >= 0) {
            this.actTime.text = "活动未开启";
        } else if (endedTime <= 0) {
            this.actTime.text = "活动已结束";
        } else {
            this.actTime.text = DateUtils.getFormatBySecond(endedTime, DateUtils.TIME_FORMAT_5, 3)
        }
    }

    public close(...param: any[]): void {
        this.removeTouchEvent(this.suerBtn, this.onTouch);
        this.removeTouchEvent(this.group, this.onTouch);
        DisplayUtils.removeFromParent(this.btnMC);
        for (let i: number = 0; i < this.maxNum; i++) {
            this.removeTouchEvent(this.itemList[i], this.itemTouch);
        }
        this.removeObserve();
        TimerManager.ins().removeAll(this);
    }

    private changeList(): void {
        let day: number = 1;
        let dayNum: number = this._activityData.getCurDay();
        if(!dayNum){
            dayNum = day;
        }
        if (dayNum >= this.maxNum)
            day = this.maxNum;
        else
            day = dayNum;
        for (let i: number = 1; i <= day; i++) {
            let config: any =  GlobalConfig['ActivityType5Config'][this.activityID][(i)+""];
            if (config) {
                if (dayNum >= config.day) {
                    if ((this._activityData.recrod >> config.day & 1) == 0) {
                        this.setList(i);
                        return;
                    }
                }
            }
        }
        this.setList(day+1);
    }

    private onTouch(e: egret.TouchEvent): void {
        switch (e.currentTarget) {
            case this.group:
                this.setList(this.group.getChildIndex(e.target));
                break;
            case this.suerBtn:
                if ( this._activityData.getCurDay() >= this.day)
                    Activity.ins().sendReward(this.activityID, this.day);
                else
                    UserTips.ins().showTips("|C:0xf3311e&T:登陆天数不足，无法领取|");
                break;
        }
    }

    private itemTouch(e: egret.TouchEvent): void {
        this.setList(e.currentTarget.data)
    }


    private setList(index: number = -1): void {
        if (index == -1) {
            index = this.dayindex;
        }
        if(index > this.maxNum){
            index = this.maxNum;
        }
        this.dayindex = index;
        let conf:any =  GlobalConfig['ActivityType5Config'][this.activityID][(index)+""];
        let list: RewardData[] = conf.rewards;
        this.day = conf.day;
        let today: number = 1;
        today =  this._activityData.getCurDay();
        this.daylabel.text = `登陆天数：${today}`;
        this.daylabel.visible = true;
        let flag: boolean = ((this._activityData.recrod >> this.day & 1) == 1);
        this.dayaward.text = `第${TextFlowMaker.numberToChinese(index)}天奖励详情`
        this.suerBtn.visible = true;
        if (today >= this.day) {
            if (!flag) {
                this.btnMC = this.btnMC || new MovieClip;
                this.btnMC.x = 79;
                this.btnMC.y = 24;
                this.btnMC.playFile(RES_DIR_EFF + "chargebtn", -1);
                this.suerBtn.addChild(this.btnMC);
                this.redPoint.visible = true;
            } else {
                this.daylabel.visible = false;
                this.suerBtn.visible = false;
                this.redPoint.visible = false;
            }
        } else {
            DisplayUtils.removeFromParent(this.btnMC);
            this.suerBtn.visible = false;
            this.redPoint.visible = false;
        }
        this.itemary.forEach(element => {
            if (element.parent) {
                element.parent.removeChild(element);
                element = null;
            }
        });
        this.itemary = [];
        for (let i: number = 0; i < list.length; i++) {
            let item: ItemBase = new ItemBase();
            this.group1.addChild(item);
            item.data = list[i];
            this.itemary.push(item);
        }

        for (let i: number = 0; i < this.maxNum; i++) {
            this.itemList[i].activityID = this.activityID;
            this.itemList[i].data = i + 1;
            if (i+1 == index || (i+1 == this.maxNum && index == this.maxNum)) {
                this.itemList[i].setSelectImg(true);
            } else {
                this.itemList[i].setSelectImg(false);
            }
        }
        this.showRedPoint();
    }

    private showRedPoint(): void {

    }

    updateData(){
        this.changeList();
        this.showRedPoint();
        this.setTime();
    }
}