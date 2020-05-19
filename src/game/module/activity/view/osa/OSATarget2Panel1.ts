class OSATarget2Panel1 extends BaseView {

	public activityID: number;

	private actTime1:eui.Label;
	private actDesc:eui.Label;
	private gift:eui.List;
	private dataArr: eui.ArrayCollection;
	private _time:number = 0;
	constructor() {
		super();
		this.skinName = "OSADailyGiftSkin";
	}

	protected childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}

	public init() {
		this.gift.itemRenderer = OSATargetItemRender1;

	}

	public open(...param: any[]): void {
		this.observe(Activity.ins().postRewardResult,this.GetCallBack);
		TimerManager.ins().doTimer(1000,0,this.setTime,this);
		this.dataArr = new eui.ArrayCollection;
		this.gift.dataProvider = this.dataArr;
		this.updateData();
	}
	private setTime() {
		if(this._time > 0) {
			this._time -= 1;
			this.actTime1.text = DateUtils.getFormatBySecond(this._time, DateUtils.TIME_FORMAT_5, 3);
		}
	}
	public close(...param: any[]): void {
		// this.removeTouchEvent(this.buy, this.onTap);
		TimerManager.ins().removeAll(this);
		this.removeObserve();
	}
	private GetCallBack(activityID:number){
		this.updateData();
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {

		}
	}
	private updateData(){
		let activityData: ActivityType2Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType2Data;
		let beganTime = Math.floor((DateUtils.formatMiniDateTime(activityData.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(activityData.endTime) - GameServer.serverTime) / 1000);
		if (beganTime >= 0) {
			this.actTime1.text = "活动未开启";
		} else if (endedTime <= 0) {
			this.actTime1.text = "活动已结束";
		} else {
			this._time = endedTime;
			if (this._time < 0) this._time = 0;
			this.actTime1.text = DateUtils.getFormatBySecond(endedTime, DateUtils.TIME_FORMAT_5, 3);
		}
		let actcfg:ActivityConfig = GlobalConfig.ActivityConfig[this.activityID];
		this.actDesc.text = actcfg.desc;

		let config:ActivityType2Config[] = GlobalConfig.ActivityType2Config[this.activityID];
		let arrconfig:ActivityType2Config[] = [];
		for( let k in config ){
			arrconfig.push(config[k]);
		}
		this.dataArr.replaceAll(arrconfig);
		// this.gift.dataProvider = new eui.ArrayCollection(config);

	}


}