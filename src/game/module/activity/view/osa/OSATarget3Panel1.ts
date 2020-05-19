/**
 * Created by hrz on 2017/9/6.
 *
 * 7日活动 连冲
 */

class OSATarget3Panel1 extends BaseView {
    private getBtn:eui.Button;
    private state:eui.Label;
    private reward:eui.List;
    private already:eui.Label;
    private redPoint:eui.Image;
    public activityID:number;
    private actTime:eui.Label;
    private actDesc:eui.Label;

    private _state:number = 0;
    private _index:number = 1;

    private _time:number = 0;
    constructor(){
        super();
        this.skinName = `OSASeriesRechargeSkin`;
    }

    protected childrenCreated() {
        super.childrenCreated();
        this.init();
    }

    public init() {
        this.reward.itemRenderer = ItemBase;

    }

    open() {
        this.addTouchEvent(this.getBtn, this.onTap);
        TimerManager.ins().doTimer(1000,0,this.setTime,this);
        this.initData();
    }
    private initData(){
        let act = Activity.ins().getActivityDataById(this.activityID) as ActivityType3Data;
        let index = act.getCurIndex();
        this._index = index;
        let config = GlobalConfig.ActivityType3Config[this.activityID][index];
        this.reward.dataProvider = new eui.ArrayCollection(config.rewards);
        this.redPoint.visible = false;
        this.state.visible = true;
        if ((act.dabiao[index-1]||0)>=config.day) {
            let state = (act.recrod>>index) & 1;
            if (state == 0) {
                this.getBtn.label = `领取`;
                this.getBtn.visible = true;
                this.getBtn.enabled = true;
                this.already.visible = false;
                this.redPoint.visible = true;
                this._state = 1;
            } else {
                this.getBtn.label = `已领取`;
                this.getBtn.visible = false;
                this.already.visible = true;
                this.state.visible = false;
                this._state = 2;
            }
            this.state.textColor = 0x00ff00;
        } else {
            this.getBtn.label = `未完成`;
            this.getBtn.visible = true;
            this.getBtn.enabled = false;
            this.already.visible = false;
            this.state.textColor = 0xff9900;
            this._state = 0;
        }
        this.state.text = `当前进度${act.dabiao[index-1]||0}/${config.day}`;

        this.updateTime();
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

    private onTap(){
        if(this._state == 1) {
            Activity.ins().sendReward(this.activityID, this._index);
        }
    }

    close(){
        this.removeTouchEvent(this.getBtn, this.onTap);
        TimerManager.ins().removeAll(this);
    }

    updateData(){
        this.initData();
    }
}