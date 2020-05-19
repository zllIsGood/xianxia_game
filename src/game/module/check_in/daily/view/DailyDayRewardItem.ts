class DailyDayRewardItemx extends eui.ItemRenderer {
	public item: ItemBase;
	public stateText: eui.Label;

	public id: number = 0;
	public constructor() {
		super();
		this.skinName = "DailyDayRewardItemSkin";
	}

	public dataChanged(): void {

		// this.resetView();
		//根据数据刷新
		let rewardCfg: MonthSignDaysConfig = this.data as MonthSignDaysConfig;

		this.item.data = rewardCfg.rewards[0];
		this.item.touchChildren = false;
		this.item.touchEnabled = false;
		this.item.isShowName(false);

		// let stateList: number[] = DailyCheckIn.ins().rewardList;
		// if (rewardCfg && stateList) {
		// 	let state: boolean = DailyCheckIn.ins().loginTimes >= rewardCfg.days;
		// 	if (state) {
		// 		let boo: boolean = DailyCheckIn.ins().rewardList[this.data.days] == 2;
		// 		if (boo) {
		// 			this.stateText.text = "已领取";
		// 		} else {
		// 			this.stateText.text = "可领取";
		// 		}
		// 	} else {
		// 		this.stateText.text = "";
		// 	}
		// }
	}

	/**
	 * 重置视图
	 * @returns void
	 */
	private resetView(): void {
		// this.stateText.visible = false;
	}
}