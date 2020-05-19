/**
 * 活动类型28
 * 限时掉落
 */
class OSATarget28Panel extends ActivityPanel {
    private rewardList:eui.List;
    private actDesc:eui.Label;
    private actTime:eui.Label;
    private _time:number;
    private title:eui.Image;
    public constructor() {
        super();
        // this.skinName = `LaBaActivityTimeDrop`;
    }

    public close(...param: any[]): void {
        this.removeObserve();
        TimerManager.ins().removeAll(this);
        TimerManager.ins().remove(this.setTime,this);
    }
    private setCurSkin():void
    {
        let aCon:ActivityConfig = GlobalConfig.ActivityConfig[this.activityID];
        if (aCon.pageSkin)
            this.skinName = aCon.pageSkin;
        else
            this.skinName = "LaBaActivityTimeDrop";
    }
    public open(...param: any[]): void {
        this.setCurSkin();
        // this.observe(Activity.ins().postKuaFuRank, this.updateData);
        this.rewardList.itemRenderer = ItemBase;
        this.updateData();
        this.updateUI();
        TimerManager.ins().doTimer(1000,0,this.setTime,this);
    }

    /**更新数据 */
    public updateData(): void {
        let config:ActivityBtnConfig = GlobalConfig.ActivityBtnConfig[this.activityID];
        if( config.showReward )
            this.rewardList.dataProvider = new eui.ArrayCollection(config.showReward);
    }
    private updateUI(){
        let activityData: ActivityType21Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType21Data;
        let beganTime = Math.floor(DateUtils.formatMiniDateTime(activityData.startTime)/DateUtils.MS_PER_SECOND - GameServer.serverTime / DateUtils.MS_PER_SECOND);
        let endedTime = Math.floor(DateUtils.formatMiniDateTime(activityData.endTime)/DateUtils.MS_PER_SECOND - GameServer.serverTime / DateUtils.MS_PER_SECOND);

        if (beganTime >= 0) {
            this.actTime.text = "活动未开启";
        } else if (endedTime <= 0) {
            this.actTime.text = "活动已结束";
        } else {
            this._time = endedTime;
            if (this._time < 0) this._time = 0;
            this.actTime.text = DateUtils.getFormatBySecond(endedTime, DateUtils.TIME_FORMAT_5, 3);
        }
        let config:ActivityConfig = GlobalConfig.ActivityConfig[this.activityID];
        this.actDesc.text = config.desc;
        let btnconfig:ActivityBtnConfig = GlobalConfig.ActivityBtnConfig[this.activityID];
        if( btnconfig ){
            this.title.source = btnconfig.title;
        }

    }

    private setTime() {
        let activityData: ActivityType28Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType28Data;
        if( activityData ){
            this._time = activityData.getleftTime();
            this.actTime.text = DateUtils.getFormatBySecond(this._time, DateUtils.TIME_FORMAT_5, 3);
        }
    }


}
