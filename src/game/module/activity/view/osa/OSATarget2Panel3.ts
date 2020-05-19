/**
 * 活动2-3
 * @author ade
 */
class OSATarget2Panel3 extends BaseView {

	public turnNextBtn: eui.Button;
	public turnBackBtn: eui.Button;
	public already0: eui.Label;
	public get0: eui.Button;
	public buyred: eui.Image;
	public vip0: eui.Group;
	public vipLv0: eui.BitmapLabel;
	public times0: eui.Label;
	public reward0: eui.List;
	public ggtxt0: eui.Image;
	public actTime0: eui.Label;
	public tu0: eui.Image;
	public leftred: eui.Image;
	public rightred: eui.Image;

	public activityType: number;

	private _activityID: number;

	private _time: number = 0;

	private _config: ActivityType2Config[];

	private _activityData: ActivityType2Data;

	private _curPage: number = 1;

	private _maxPage: number = 1;

	private _collect: ArrayCollection;

	private isGet: boolean;//是否可领取

	public mc: MovieClip;

	public constructor() {
		super();
	}

	protected childrenCreated(): void {
		super.childrenCreated();
		this.reward0.itemRenderer = ItemBase;
	}

	private setCurSkin(): void {
		let aCon: ActivityConfig;
		if (this.activityType == ActivityType.Normal) {
			aCon = GlobalConfig.ActivityConfig[this.activityID];
		} 

		if (aCon.pageSkin)
			this.skinName = aCon.pageSkin;
		else
			this.skinName = "SFVipGiftSkin";
	}

	public get activityID(): number {
		return this._activityID
	}

	public set activityID(value: number) {
		this._activityID = value;
		this.activityType = ActivityPanel.getActivityTypeFromId(this._activityID);
		this.setCurSkin();
	}

	public open(...param: any[]): void {
		this.setCurSkin();

		this.mc = new MovieClip();
		this.addChild(this.mc);
		this.mc.x = 160, this.mc.y = 330;
		this.mc.playFile(`${RES_DIR_EFF}artifacteff2`, -1);

		this.observe(Activity.ins().postRewardResult, this.GetCallBack);
		// this.observe(PActivity.ins().postRewardResult, this.GetCallBack);
		this.addTouchEvent(this, this.onTouch);

		TimerManager.ins().doTimer(1000, 0, this.setTime, this);
		this.updateData();
	}

	private setTime() {

		let endedTime = Math.floor((DateUtils.formatMiniDateTime(this._activityData.endTime) - GameServer.serverTime) / 1000);
		this._time = endedTime;
		if (this._time < 0) this._time = 0;
		this.actTime0.text = DateUtils.getFormatBySecond(this._time, DateUtils.TIME_FORMAT_5, 3);
	}

	public close(...param: any[]): void {
		TimerManager.ins().removeAll(this);
	}

	private GetCallBack(activityID: number) {
		if (this.activityID != activityID)return;
		this.updateData();
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {

		}
	}

	private updateData() {
		if (this.activityType == ActivityType.Normal) {
			this._activityData = Activity.ins().getActivityDataById(this.activityID) as ActivityType2Data;
			this._config = GlobalConfig.ActivityType2Config[this.activityID];
		} 

		let beganTime = Math.floor((DateUtils.formatMiniDateTime(this._activityData.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(this._activityData.endTime) - GameServer.serverTime) / 1000);
		if (beganTime >= 0) {
			this.actTime0.text = "活动未开启";
		} else if (endedTime <= 0) {
			this.actTime0.text = "活动已结束";
		} else {
			this._time = endedTime;
			if (this._time < 0) this._time = 0;
			this.actTime0.text = DateUtils.getFormatBySecond(endedTime, DateUtils.TIME_FORMAT_5, 3);
		}

		this._maxPage = Object.keys(this._config).length;
		this._curPage = 1;
		let config: ActivityType2Config
		for (let i: number = 1; i <= this._maxPage; i++) {
			config = this._config[i];
			if (this._activityData.buyData[config.index] < config.count) {
				this._curPage = i;
				break;
			}
		}

		this.updatePage();
	}

	private updatePage(): void {
		this.turnBackBtn.visible = this._curPage > 1;
		this.turnNextBtn.visible = this._curPage < this._maxPage;

		let config: ActivityType2Config = this._config[this._curPage];
		this.ggtxt0.source = "viptitle" + config.index + "_png";
		this.tu0.source = "vipshow" + config.index + "_png";
		this.vipLv0.text = config.vip + "";
		this.times0.text = "活动期间仅可购买" + config.count + "次";
		this.get0.label = config.price + "元宝";

		if (!this._collect) {
			this._collect = new ArrayCollection();
			this.reward0.dataProvider = this._collect;
		}

		this._collect.source = config.rewards;

		this.buyred.visible = false;
		this.already0.visible = false;
		this.get0.visible = true;
		//已领取
		if (this._activityData.buyData[config.index] >= config.count) {
			this.isGet = false;
			this.already0.visible = true;
			this.get0.visible = false;
		}
		else {
			//未领取
			this.isGet = UserVip.ins().lv >= config.vip && Actor.yb >= config.price;
			this.buyred.visible = this.isGet;
		}

		//翻页按钮红点
		this.leftred.visible = this.rightred.visible = false;
		for (let i: number = 1; i < this._curPage; i++) {
			config = this._config[i];
			if (this._activityData.buyData[config.index] < config.count && UserVip.ins().lv >= config.vip && Actor.yb >= config.price) {
				this.leftred.visible = true;
				break;
			}
		}

		for (let i: number = this._curPage + 1; i <= this._maxPage; i++) {
			config = this._config[i];
			if (this._activityData.buyData[config.index] < config.count && UserVip.ins().lv >= config.vip && Actor.yb >= config.price) {
				this.rightred.visible = true;
				break;
			}
		}
	}

	private onTouch(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.get0:
				let config: ActivityType2Config = this._config[this._curPage];
				if (this.isGet) {
					if (config instanceof ActivityType2Config)
						Activity.ins().sendReward(config.Id, config.index);
				}
				else {
					if (UserVip.ins().lv < config.vip)
						UserTips.ins().showTips(`|C:0xff0000&T:VIP等级不满足要求|`);
					else
						UserTips.ins().showTips(`|C:0xf3311e&T:元宝不足|`);
				}
				break;
			case this.turnBackBtn:
				if (this._curPage > 1) {
					this._curPage--;
					this.updatePage();
				}
				break;
			case this.turnNextBtn:
				if (this._curPage < this._maxPage) {
					this._curPage++;
					this.updatePage();
				}
				break;
		}
	}

}