class ActivityType5Panel extends ActivityPanel {

	public date:eui.Label;
	public desc:eui.Label;
	public list1:eui.List;
	public sureBtn1:eui.Button;
	public btn1:eui.Button;
	public btn2:eui.Button;
	public btn3:eui.Button;
	public btn6:eui.Button;
	public btn7:eui.Button;
	public btn4:eui.Button;
	public btn5:eui.Button;
	public btn8:eui.Button;
	public btn9:eui.Button;
	public btn10:eui.Button;
	public sign:eui.Image;

	public rewardIndex:number = -1;
	public selectBtn:eui.Button;
	public btnMax:number = 0;

	constructor() {
		super();
	}

	protected childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}

	public init() {
		this.refushSkin();
	}

	 public open(...param: any[]): void {
		this.refushSkin();
		this.updateData();
		this.addTouchEvent(this.sureBtn1, this.onClick);
		// MessageCenter.ins().addListener(MessagerEvent.ACTIVITY_IS_AWARDS, this.updateData, this);
		this.observe(Activity.ins().postActivityIsGetAwards,this.updateData);
		for(let i:number = 1; i <= this.btnMax ; i++)
		{
			this.addTouchEvent(this["btn"+i], this.onClick);
		}
	}

	public close(...param: any[]): void {
		debug.log("close");
		this.removeTouchEvent(this.sureBtn1, this.onClick);
		for(let i:number = 1; i <= this.btnMax ; i++)
		{
			this.removeTouchEvent(this["btn"+i], this.onClick);
		}

		this.removeObserve();
	}

	private refushSkin(): void {
		if (this.activityBtnType == ActivityBtnType.ZHONG_QIU) {
			this.btnMax = 7;
			this.skinName = "ActMidLogSkin";
		} else if (this.activityBtnType == ActivityBtnType.SHENG_XIA) {
			this.btnMax = 5;
			this.skinName = "SunmerLogSkin";
		} else {
			this.btnMax = 10;
			this.skinName = "ActNatLogSkin";
		}
		this.list1.itemRenderer = ItemBase;
	}

	public updateData() {
		let activityData: ActivityType5Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType5Data;
		let beganTime = Math.floor((DateUtils.formatMiniDateTime(activityData.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(activityData.endTime) - GameServer.serverTime) / 1000);
		if (beganTime >= 0) {
			this.date.text = "活动未开启";
		} else if (endedTime <= 0) {
			this.date.text = "活动已结束";
		} else {
			this.date.text = DateUtils.getFormatBySecond(endedTime, DateUtils.TIME_FORMAT_5, 3); 
		}
		this.desc.text = GlobalConfig.ActivityConfig[this.activityID].desc;

		this.refushBtnReward();
	}

	public refushBtnReward(index:number = 0):void
	{
		let activityData: ActivityType5Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType5Data;
		if(index == 0)
		{
			index = activityData.logTime;
			if(!activityData.logTime)
			{
				index = 1;
			}
		}
		this.rewardIndex = index;
		let config:any = GlobalConfig['ActivityType5Config'][this.activityID][(this.rewardIndex-1)+""];
		this.list1.dataProvider = new eui.ArrayCollection(config.rewards);
		if(this.selectBtn)
		{
			this.selectBtn.currentState = "up";
		}
		this.selectBtn = this["btn"+index];
		this.selectBtn.currentState = "down";
		if(index <= activityData.logTime)
		{
			if(activityData.checkOneDayStatu(index))
			{
				//  可领取
				this.sign.visible = false;
				this.sureBtn1.visible = true;
			}else{
				//已领取
				this.sign.visible = true;
				this.sureBtn1.visible = false;
			}
		}else{
			this.sign.visible = false;
			this.sureBtn1.visible = false;
		}
	}

	private onClick(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.sureBtn1:
				//  ControllerManager.ins().applyFunc(ControllerConst.Activity, ActivityFunc.SEND_ACTIVITY_REWARD, this.activityID, this.rewardIndex);
				 Activity.ins().sendReward(this.activityID, this.rewardIndex);
				break;
			case this.btn1:
				this.refushBtnReward(1);
			break;
			case this.btn2:
				this.refushBtnReward(2);
			break;
			case this.btn3:
				this.refushBtnReward(3);
			break;
			case this.btn4:
				this.refushBtnReward(4);
			break;
			case this.btn5:
				this.refushBtnReward(5);
			break;
			case this.btn6:
				this.refushBtnReward(6);
			break;
			case this.btn7:
				this.refushBtnReward(7);
			break;
			case this.btn8:
				this.refushBtnReward(8);
			break;
			case this.btn9:
				this.refushBtnReward(9);
			break;
			case this.btn10:
				this.refushBtnReward(10);
			break;
		}
	}
}