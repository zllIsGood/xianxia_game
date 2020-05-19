class OSATarget26Panel extends BaseView {

	public activityID: number;

	private actTime:eui.Label;
	private actDesc:eui.Label;
	private gift:eui.List;
	private dataArr: eui.ArrayCollection;
	private _time:number = 0;
	constructor() {
		super();
		this.skinName = "YYMSSkin";
	}

	protected childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}
	
	public init() {
		this.gift.itemRenderer = OSATargetItemRender26;
	}

	public open(...param: any[]): void {
		TimerManager.ins().doTimer(1000,0,this.setTime,this);
		this.observe(Activity.ins().postYYMSInfo, this.updateData);
		this.dataArr = new eui.ArrayCollection;
		this.gift.dataProvider = this.dataArr;
		this.updateData();
		//一元秒杀活动，登录时显示红点，进入一元秒杀界面后去掉红点
		Activity.ins().yymsRed = false;
	}


	private setTime() {
		if(this._time > 0) {
			this._time -= 1;
			this.actTime.text = DateUtils.getFormatBySecond(this._time, DateUtils.TIME_FORMAT_5, 3);
		}
	}
	public close(...param: any[]): void {
		TimerManager.ins().removeAll(this);
		this.removeObserve();
	}

	private updateData(){
		let activityData: ActivityType26Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType26Data;
		let beganTime = Math.floor((DateUtils.formatMiniDateTime(activityData.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(activityData.endTime) - GameServer.serverTime) / 1000);
		if (beganTime >= 0) {
			this.actTime.text = "活动未开启";
		} else if (endedTime <= 0) {
			this.actTime.text = "活动已结束";
		} else {
			this._time = endedTime;
			if (this._time < 0) this._time = 0;
			this.actTime.text = DateUtils.getFormatBySecond(endedTime, DateUtils.TIME_FORMAT_5, 3);
		}
		let actcfg:ActivityConfig = GlobalConfig.ActivityConfig[this.activityID];
		this.actDesc.text = actcfg.desc;

		let config:ActivityType26Config[] = GlobalConfig.ActivityType26Config[this.activityID];
		let arrconfig:ActivityType26Config[] = [];
		for( let k in config ){
			if ((config[k].platform == 0 && LocationProperty.isNotNativeMode) || (config[k].platform == 1 && LocationProperty.isWeChatMode))   arrconfig.push(config[k]);
		}
		this.dataArr.replaceAll(arrconfig);
	}

}