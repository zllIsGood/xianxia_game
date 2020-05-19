class OSATarget22Panel1 extends BaseView {

	public title: eui.Image;
	public infoBg: eui.Group;
	public actTime1: eui.Label;
	public actInfo1: eui.Label;
	public leftTopBg: eui.Group;
	public rightTopBg: eui.Group;
	public reward: eui.Group;
	public rewardList: eui.List;
	public project: eui.Group;
	public projectList: eui.List;
	public totalScore: eui.Label;

	private _rewardCollect: ArrayCollection;

	private _achieveCollect: ArrayCollection;

	public activityID: number;

	public constructor(id: number) {
		super();
		this.activityID = id;
		this.setCurSkin();
	}

	private setCurSkin(): void {
		let aCon: ActivityConfig = GlobalConfig.ActivityConfig[this.activityID];
		if (aCon.pageSkin)
			this.skinName = aCon.pageSkin;
		else
			this.skinName = "NYHighSkin";
	}

	public childrenCreated(): void {
		super.childrenCreated();

		this.rewardList.itemRenderer = HighRewardItemRender;
		this.projectList.itemRenderer = HighProjectItemRender;
	}

	public open(...param: any[]): void {

		this.setCurSkin();
		let aCon: ActivityConfig = GlobalConfig.ActivityConfig[this.activityID];
		this.actInfo1.text = aCon.desc;

		this.observe(Activity.ins().postActivityIsGetAwards, this.updateData);
		TimerManager.ins().doTimer(1000, 0, this.setTime, this);
		this.updateData();
	}

	public close(...param: any[]): void {
		this.removeObserve();
		TimerManager.ins().removeAll(this);
	}

	public updateData(): void {
		let data: ActivityType22Data = Activity.ins().activityData[this.activityID] as ActivityType22Data;
		if (!data)return;
		let len: number = Object.keys(GlobalConfig.ActivityType22_1Config[this.activityID]).length;
		let state: number = 0;
		let list: any[] = [];
		list.length = len;
		let config: ActivityType22_1Config;
		let i: number;
		for (i = 1; i <= len; i++) {
			config = GlobalConfig.ActivityType22_1Config[this.activityID][i];
			if (data.rewardInfo >> i & 1) //已领取
				state = 2;
			else if (data.hiScore >= config.score) //可领取
				state = 1;
			else
				state = 0;

			list[i - 1] = {activityID: this.activityID, index: i, state: state, config: config};
		}

		//list.sort(this.sort);

		if (!this._rewardCollect) {
			this._rewardCollect = new ArrayCollection();
			this.rewardList.dataProvider = this._rewardCollect;
		}

		this._rewardCollect.source = list;

		len = Object.keys(GlobalConfig.ActivityType22_2Config[this.activityID]).length;
		let config2: ActivityType22_2Config;
		list = [];
		list.length = len;
		let total: number = 0;
		for (i = 0; i < len; i++) {
			let info = data.achieveInfo[i];
			config2 = GlobalConfig.ActivityType22_2Config[this.activityID][i + 1];
			list[i] = {config: config2, times: info.times};

			let cur = Math.floor(info.times / config2.target);
			let max = Math.floor(config2.dayLimit / config2.target);
			if (cur > max) cur = max;

			total += config2.score * cur;
		}

		if (!this._achieveCollect) {
			this._achieveCollect = new ArrayCollection;
			this.projectList.dataProvider = this._achieveCollect;
		}
		this._achieveCollect.source = list;

		this.totalScore.text = "当前嗨积分:" + total;

		//时间
		this.setTime();
	}

	/**private sort(a: any, b: any): number {
        if (a.state == 1 && b.state != 1)
            return -1;
        
        if (a.state == 2 && b.state != 2)
            return 1;
        
        if (a.config.index < b.config.index)
            return -1;
        
        if (a.config.index > b.config.index)
            return 1;

        return 0;
	}**/

	private setTime() {
		let data: ActivityType9Data = Activity.ins().activityData[this.activityID] as ActivityType9Data;
		if (data)
			this.actTime1.text = data.getRemainTime();
	}
}