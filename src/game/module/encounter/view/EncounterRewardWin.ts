/**
 * 追血令奖励展示界面
 */
class EncounterRewardWin extends BaseEuiView {
	public list0: eui.List;
	private myRankText: eui.Label;
	private bgClose: eui.Rect;
	constructor() {
		super();
		this.isTopLevel = true;
		this.skinName = `Zaoyurewardskin`;
	}

	private rewardList: any[];
	public createChildren(): void {
		this.list0.itemRenderer = EncounterRewardRender;
		this.rewardList = [];

		for (let k in GlobalConfig.SkirmishRankConfig) {
			this.rewardList.push(GlobalConfig.SkirmishRankConfig[k])
		}
	}

	public open(): void {
		this.addTouchEvent(this.bgClose, this.onTap);
		this.setPanelInfo();
	}

	public close(): void {
		this.removeTouchEvent(this.bgClose, this.onTap);
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.bgClose:
			ViewManager.ins().close(EncounterRewardWin);
			break
		}
	}

	private setPanelInfo(): void {
		this.list0.dataProvider = new eui.ArrayCollection(this.rewardList);
		let rank = Encounter.ins().encounterRank;
		if (rank == 0) {
			this.myRankText.textFlow = TextFlowMaker.generateTextFlow1(`我的当前排名：|C:0xFB9409&T:未上榜|`);
		} else {
			this.myRankText.textFlow = TextFlowMaker.generateTextFlow1(`我的当前排名：|C:0xFB9409&T:${rank}名|`);
		}
	}
}
ViewManager.ins().reg(EncounterRewardWin, LayerManager.UI_Main);