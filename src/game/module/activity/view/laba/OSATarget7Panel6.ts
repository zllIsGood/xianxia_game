/** 腊八兑换活动 */
class OSATarget7Panel6 extends BaseView {

	private _activityID: number;
	private _activityData: ActivityType7Data;

	public title: eui.Image;
	public infoBg: eui.Group;
	public actTime0: eui.Label;
	public actInfo0: eui.Label;
	public num: eui.Label;
	public content: eui.List;

	private _dataCollect: ArrayCollection;

	private _leftTime: number = 0;

	public constructor() {
		super();
		this.skinName = "LaBaexchangeSkin";
	}

	public childrenCreated(): void {
		super.childrenCreated();

		this.actInfo0.text = GlobalConfig.ActivityConfig[this.activityID].desc;
		this.content.itemRenderer = LabaChangeItemRender;
	}

	public get activityID(): number {
		return this._activityID;
	}

	public set activityID(value: number) {
		this._activityID = value;
	}

	public open(...args: any[]): void {
		this.observe(UserBag.ins().postItemAdd, this.updateList);
		this.observe(UserBag.ins().postItemChange, this.updateList);
		this.observe(Activity.ins().postActivityIsGetAwards, this.updateList);
		this.updateData();
	}

	public close(): void {
		this.removeObserve();
		TimerManager.ins().remove(this.setTime, this);
		this._leftTime = 0;
	}

	public updateData(): void {
		this._activityData = Activity.ins().getActivityDataById(this.activityID) as ActivityType7Data;
		this.checkTime();
		this.updateList();
	}

	private updateList(): void {
		let datas: Array<any> = [];
		let configs: ActivityType7Config[] = GlobalConfig.ActivityType7Config[this.activityID];
		for (let i in configs) {
			let state = this._activityData.getExchange(configs[i].index);
			datas.push({config: configs[i], state: state});
		}
		datas.sort(this.sort);

		if (!this._dataCollect) {
			this._dataCollect = new ArrayCollection();
			this.content.dataProvider = this._dataCollect;
		}

		this._dataCollect.replaceAll(datas);

	}

	private sort(a: { config: ActivityType7Config, state: number }, b: { config: ActivityType7Config, state: number }): number {

		// if (a.state < b.state )
		// 	return -1;
		// else{
		if (a.config.index < b.config.index)
			return -1;
		else
			return 1;
		// }
	}

	private checkTime(): void {
		this._leftTime = 0;
		if (Math.floor((DateUtils.formatMiniDateTime(this._activityData.startTime) - GameServer.serverTime) / 1000) >= 0)
			this.actTime0.text = "活动未开启";
		else {
			this._leftTime = Math.floor((DateUtils.formatMiniDateTime(this._activityData.endTime) - GameServer.serverTime) / 1000);
			if (this._leftTime <= 0)
				this.actTime0.text = "活动已结束";
			else {
				this.actTime0.text = DateUtils.getFormatBySecond(this._leftTime, DateUtils.TIME_FORMAT_5, 3);
				if (!TimerManager.ins().isExists(this.setTime, this))
					TimerManager.ins().doTimer(1000, 0, this.setTime, this);
			}
		}
	}

	private setTime(): void {
		if (this._activityData) {
			this._leftTime = this._activityData.getLeftTime();
			this.actTime0.text = DateUtils.getFormatBySecond(this._leftTime, DateUtils.TIME_FORMAT_5, 3)
			if (this._leftTime <= 0)
				this.checkTime();
		}
	}
}