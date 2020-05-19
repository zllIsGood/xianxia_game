/*连续充值界面*/
class ActivityType3Panel extends ActivityPanel {

	public date: eui.Label;
	public desc: eui.Label;
	public list: eui.List;
	public list1: eui.List;
	public suerBtn: eui.Button;
	public suerBtn0: eui.Button;

	public label: eui.Label;
	public label1: eui.Label;
	public label2: eui.Label;
	public label3: eui.Label;

	public sureImg: eui.Image;
	public sureImg0: eui.Image;


	public activityData: ActivityType3Data;
	private mc1: MovieClip;
	private mc2: MovieClip;


	public constructor() {
		super();
		this.initUI();
	}

	public initUI(): void {

		this.skinName = "MoneyActSkin";

		this.list.itemRenderer = ItemBase;
		this.list1.itemRenderer = ItemBase;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.suerBtn, this.reward);
		this.addTouchEvent(this.suerBtn0, this.reward);
		// ControllerManager.ins().applyFunc(ControllerConst.Activity, ActivityFunc.SEND_ACTIVITY_LIANXU, this.activityID);
		Activity.ins().sendLianxuReward(this.activityID);
		this.updateData();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.suerBtn, this.reward);
		this.removeTouchEvent(this.suerBtn0, this.reward);
	}

	public updateData() {
		this.sureImg.visible = false;
		this.sureImg0.visible = false;
		this.activityData = Activity.ins().getActivityDataById(this.activityID) as ActivityType3Data;
		let beganTime = Math.floor((DateUtils.formatMiniDateTime(this.activityData.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(this.activityData.endTime) - GameServer.serverTime) / 1000);
		if (beganTime >= 0) {
			this.date.text = "活动未开启";
		} else if (endedTime <= 0) {
			this.date.text = "活动已结束";
		} else {
			this.date.text = DateUtils.getFormatBySecond(endedTime, DateUtils.TIME_FORMAT_5, 3);
		}
		// this.desc.text = GlobalConfig.ActivityConfig[this.activityID].desc;
		this.label.textFlow = new egret.HtmlTextParser().parser(this.activityData.day7text);
		this.label1.textFlow = new egret.HtmlTextParser().parser(this.activityData.totaltext);
		if (this.activityData.chongzhiTotal > this.activityData.maxTotal) {
			this.activityData.chongzhiTotal = this.activityData.maxTotal;
		}
		this.label2.text = `已达成${this.activityData.dabiao ? this.activityData.dabiao[0] : 0}/${this.activityData.openDay()}天`;
		this.label3.text = `已充值${this.activityData.chongzhiTotal}/${this.activityData.maxTotal}元宝`;

		this.list.dataProvider = new eui.ArrayCollection(this.activityData.rewards1);
		this.list1.dataProvider = new eui.ArrayCollection(this.activityData.rewards2);
		this.activityData.canOnlyReward();
		if (this.activityData.btn1) {
			this.mc1 = this.mc1 || new MovieClip;
			this.mc1.x = 50;
			this.mc1.y = 19;
			this.mc1.playFile(RES_DIR_EFF +'normalbtn', -1);
			this.suerBtn.addChild(this.mc1);
		}
		else if (this.mc1) {
			DisplayUtils.removeFromParent(this.mc1);
		}

		if (this.activityData.btn2) {
			this.mc2 = this.mc2 || new MovieClip;
			this.mc2.x = 50;
			this.mc2.y = 19;
			this.mc2.playFile(RES_DIR_EFF +'normalbtn', -1);
			this.suerBtn0.addChild(this.mc2);
		}
		else if (this.mc2) {
			DisplayUtils.removeFromParent(this.mc2);
		}
		this.sureImg0.visible = this.activityData.image1;
		this.sureImg.visible = this.activityData.image2;
		this.suerBtn.visible = !this.activityData.image1;
		this.suerBtn0.visible = !this.activityData.image2;
	}

	private reward(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.suerBtn:
				if (this.activityData.btn1) {
					if (UserBag.ins().getSurplusCount() >= 1) {
						// ControllerManager.ins().applyFunc(ControllerConst.Activity, ActivityFunc.SEND_ACTIVITY_REWARD, this.activityData.id, 1);
						Activity.ins().sendReward(this.activityData.id, 1);
					} else {
						UserTips.ins().showTips("|C:0xf3311e&T:背包已满，请清理背包|");
					}
				}
				else
					UserTips.ins().showTips("|C:0xf3311e&T:未达到活动天数！|");
				break;
			case this.suerBtn0:
				if (this.activityData.btn2) {
					if (UserBag.ins().getSurplusCount() >= 1) {
						// ControllerManager.ins().applyFunc(ControllerConst.Activity, ActivityFunc.SEND_ACTIVITY_REWARD, this.activityData.id, 2);
						Activity.ins().sendReward(this.activityData.id, 2);
					} else {
						UserTips.ins().showTips("|C:0xf3311e&T:背包已满，请清理背包|");
					}
				}
				else
					UserTips.ins().showTips("|C:0xf3311e&T:元宝不足|");
				break;
		}
	}

}