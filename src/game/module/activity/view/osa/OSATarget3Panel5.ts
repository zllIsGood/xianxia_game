/**
 * Created by hjh on 2017/11/2.
 */

class OSATarget3Panel5 extends BaseView {
    private reward0:eui.List;
    private reward1:eui.List;
    private getBtn0:eui.Button;
    private getBtn1:eui.Button;
    private actTime:eui.Label;
    private actDesc:eui.Label;
    // private target0:eui.Label;
    // private target1:eui.Label;
    public activityID:number;
    private _time:number;
    private _index:number;
    private bar:eui.ProgressBar;
    private title:eui.Image;
    private addchong:eui.Image;
    constructor() {
        super();
        this.skinName = `hefuSeriesRechargeSkin`;
    }

    protected childrenCreated() {
        super.childrenCreated();
        this.init();
    }

    public init() {
        this.reward0.itemRenderer = ItemBase;
        this.reward1.itemRenderer = ItemBase;

    }

    open() {
        this.addTouchEvent(this.getBtn0, this.onTap);
        this.addTouchEvent(this.getBtn1, this.onTap);
        TimerManager.ins().doTimer(1000,0,this.setTime,this);
        this.initData();
    }
    private initData(){
        this.setIndex(0);
        this.setIndex(1);
        this.updateTime();
    }

    private setIndex(type) {
        let index:number,curValue:number;
        let act = Activity.ins().getActivityDataById(this.activityID) as ActivityType3Data;
        let btncfg:ActivityBtnConfig = GlobalConfig.ActivityBtnConfig[this.activityID];
        if( btncfg )
            this.title.source = btncfg.title;
        if(type == 0){
            index = act.getCurIndex(3);
            this._index = index;
            curValue = act.chongzhiNum;
        } else {
            index = act.getCurIndex(2);
            curValue = act.chongzhiTotal;
        }
        let config = GlobalConfig.ActivityType3Config[this.activityID][index];
        this[`reward${type}`].dataProvider = new eui.ArrayCollection(config.rewards);
        this[`redPoint${type}`].visible = false;
        let already:eui.Label = this[`already${type}`];
        let getBtn:eui.Button = this[`getBtn${type}`];
        // let record:eui.Label = this[`record${type}`];
        already.visible = false;
        if (curValue >= config.val) {
            let state = (act.recrod>>index) & 1;
            if (state == 0) {
                getBtn.label = `立即领取`;
                getBtn.visible = true;
                getBtn.enabled = true;
                this[`redPoint${type}`].visible = true;
            } else {
                getBtn.label = `已领取`;
                getBtn.visible = false;
                already.visible = true;
            }
            // record.textColor = 0x00ff00;
        } else {
            getBtn.label = `未完成`;
            getBtn.visible = true;
            getBtn.enabled = false;
            // record.textColor = 0xff9900;
        }

        if(type==0) {
            // this.target0.text = `今日累计充值${config.val}元宝可领取`;
        } else {
           // this.target1.text = `7日累计充值${config.val}元宝可领取`;
            this[`state`].text = `累计充值:${curValue}/${config.val}元宝`;
        }

        if( this.bar ){
            this.bar.maximum = config.val;
            this.bar.value   = curValue;
        }

        if( this.activityID == 158 ){
            this.addchong.source = "l_biaoti_leichong800";
        }else if( this.activityID == 212 ){
            this.addchong.source = "l_biaoti_leichong800";
        }
    }

    private updateTime(){
        let act = Activity.ins().getActivityDataById(this.activityID) as ActivityType3Data;
        let sec = act.getLeftTime();
        this._time = sec;

        this.actTime.text = DateUtils.getFormatBySecond(this._time, DateUtils.TIME_FORMAT_5, 3);

        let config: ActivityConfig = GlobalConfig.ActivityConfig[this.activityID];
        this.actDesc.text = config.desc;

    }

    private setTime() {
        if(this._time > 0) {
            this._time -= 1;
            this.actTime.text = DateUtils.getFormatBySecond(this._time, DateUtils.TIME_FORMAT_5, 3);
        }
    }

    private onTap(e:egret.TouchEvent){
        let tar = e.currentTarget;
        if(tar == this.getBtn0) {
            Activity.ins().sendReward(this.activityID, this._index);
        } else if (tar == this.getBtn1) {
            let act = Activity.ins().getActivityDataById(this.activityID) as ActivityType3Data;
            Activity.ins().sendReward(this.activityID, act.getCurIndex(2));
        }
    }

    close(){
        this.removeTouchEvent(this.getBtn0, this.onTap);
        this.removeTouchEvent(this.getBtn1, this.onTap);
        TimerManager.ins().removeAll(this);
    }

    updateData(){
        this.initData();
    }
}