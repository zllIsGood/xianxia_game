/**
 *
 * @author hepeiye
 *
 */
class ActivityType1Panel extends ActivityPanel {
	private list: eui.List;
	private date: eui.Label;
	private desc: eui.Label;

	private listData: eui.ArrayCollection;

	constructor() {
		super();

		this.skinName = "ActLevelSkin";
		this.list.itemRenderer = ActivityType1ItemRenderer;
	}

	protected childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}

	public init() {
		this.listData = new eui.ArrayCollection;
		this.list.dataProvider = this.listData;
	}

	public open(...param: any[]): void {
		this.updateData();
	}

	public close(...param: any[]): void {

	}


	public updateData() {
		let activityData: ActivityType1Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType1Data;
		let beganTime = Math.floor((DateUtils.formatMiniDateTime(activityData.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(activityData.endTime) - GameServer.serverTime) / 1000);
		if (beganTime >= 0) {
			this.date.text = "活动未开启";
		} else if (endedTime <= 0) {
			this.date.text = "活动已结束";
		} else {
			this.date.text = DateUtils.getFormatBySecond(endedTime, DateUtils.TIME_FORMAT_5, 3)
		}
		this.desc.text = GlobalConfig.ActivityConfig[this.activityID].desc;

		let listData: ActivityType1Config[] = GlobalConfig.ActivityType1Config[activityData.id].slice();

		listData.sort(this.sortFunc);

		this.listData.replaceAll(listData);
	}

	private sortFunc(aConfig: ActivityType1Config, bConfig: ActivityType1Config): number {

		let activityData: ActivityType1Data = Activity.ins().getActivityDataById(aConfig.Id) as ActivityType1Data;

		let aState: number = activityData.getRewardStateById(aConfig.index - 1);
		let bState: number = activityData.getRewardStateById(bConfig.index - 1);
		if (aState < bState)
			return -1;
		if (aState > bState)
			return 1;

		if (aConfig.zslevel < bConfig.zslevel)
			return -1;
		if (aConfig.zslevel > bConfig.zslevel)
			return 1;

		if (aConfig.level < bConfig.level)
			return -1;
		if (aConfig.level > bConfig.level)
			return 1;

		return 0;
	}

}
