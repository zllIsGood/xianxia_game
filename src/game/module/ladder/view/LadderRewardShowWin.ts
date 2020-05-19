/**
 * 奖励展示界面
 */
class LadderRewardShowWin extends BaseEuiView {

	public list0: eui.List;
	public list1: eui.List;
	public winNum: eui.Label;
	public winNum0: eui.Label;
	public upImg: eui.Image;
	public levelbg: eui.Image;
	public level: eui.Image;

	constructor() {
		super();
		this.isTopLevel = true;
		this.skinName = `ladderinforewardskin`;
	}

	public createChildren(): void {
		this.list0.itemRenderer = LastWeekRankItemRenderer;
		this.list1.itemRenderer = ItemBase;
	}

	public open(): void {
		this.setPanelInfo();
	}

	public close(): void {
	}

	private setPanelInfo(): void {
		let data: any[] = Ladder.ins().upRankList;
		if (data.length > 5) {
			data = data.slice(0, 5);
		}
		this.list0.dataProvider = new eui.ArrayCollection(data);
		let duanwei: TianTiDanConfig[] = Ladder.ins().configList;
		let reward: RewardData[] = this.getRewardDataList(duanwei);
		this.list1.dataProvider = new eui.ArrayCollection(reward);
		this.winNum.text = `净胜场：${Ladder.ins().upWin}场`;
		this.winNum0.text = `排名：` + (Ladder.ins().upWeekRank > 0 ? `${Ladder.ins().upWeekRank}` : `未上榜`);
		if (Ladder.ins().playUpTime) {
			this.upImg.source = "competition1_icon_" + Ladder.ins().upLevel;
			let config: any = Ladder.ins().getLevelConfig(Ladder.ins().upLevel, Ladder.ins().upId);
			if (config.showDan > 0) {
				this.levelbg.visible = true;
				this.level.source = 'laddergradnum_' + config.showDan;
			} else {
				this.levelbg.visible = false;
				this.level.source = null;
			}
		} else {
			this.upImg.source = "competition1_icon_1";
			this.level.source = 'laddergradnum_' + 5;
		}
	}

	private getRewardDataList(cfgList: TianTiDanConfig[]): RewardData[] {
		let list: any[] = [];
		for (let i: number = 0; i < cfgList.length; i++) {
			list = list.concat(cfgList[i].danAward);
		}
		return list;
	}
}
ViewManager.ins().reg(LadderRewardShowWin, LayerManager.UI_Main);