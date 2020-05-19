/**
 * 上周排名界面
 */
class LadderLastRankWin extends BaseEuiView {

	public list: eui.List;
	public myRank: eui.Label;
	public WinNum: eui.Label;
	public myDwIng: eui.Image;
	public levelBg: eui.Image;
	public level: eui.Image;
	public titleDesc: eui.Label;
	public rankDesc: eui.Label;

	constructor() {
		super();
		this.isTopLevel = true;
		this.skinName = `ladderinforankingskin`;
	}

	public createChildren(): void {
		this.list.itemRenderer = LadderRankItemRenderer;
	}

	//type 0--当前排行   1-- 上届排行
	public open(...param: any[]): void {
		let type: number = param[0];
		this.setPanelInfo(type);
		this.titleDesc.text = type == 1 ? `本周排名` : `上周排名`;
		this.rankDesc.text = type == 1 ? `我的战绩` : `我的上周战绩`;
	}

	public close(): void {
	}

	private setPanelInfo(type: number): void {
		let config: any = Ladder.ins().getLevelConfig();
		if (type == 1) {
			let rankModel: RankModel = Rank.ins().rankModel[RankDataType.TYPE_LADDER];
			this.list.dataProvider = new eui.ArrayCollection(rankModel.getDataList() ? rankModel.getDataList() : []);
			this.myRank.text = rankModel.selfPos > 0 ? `排名：${rankModel.selfPos}` : `排名：未上榜`;
			this.WinNum.text = `净胜场：${Ladder.ins().winNum}场`;
			this.myDwIng.source = "competition1_icon_" + Ladder.ins().level;
			config = Ladder.ins().getLevelConfig();
		} else {
			this.list.dataProvider = new eui.ArrayCollection(Ladder.ins().getUpRankList());
			this.myRank.text = Ladder.ins().upWeekRank > 0 ? `排名：${Ladder.ins().upWeekRank}` : `排名：未上榜`;
			this.WinNum.text = `净胜场：${Ladder.ins().upWin}场`;
			this.myDwIng.source = "competition1_icon_" + Ladder.ins().upLevel;
			config = Ladder.ins().getLevelConfig(Ladder.ins().upLevel, Ladder.ins().upId);
		}
		if (config.showDan > 0) {
			this.levelBg.visible = true;
			this.level.source = 'laddergradnum_' + config.showDan;
		} else {
			this.levelBg.visible = false;
			this.level.source = null;
		}
	}
}

ViewManager.ins().reg(LadderLastRankWin, LayerManager.UI_Main);