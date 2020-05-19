class LastWeekRankItemRenderer extends BaseItemRender {

	public bg: eui.Image;
	public rank: eui.Label;
	public nameLabel: eui.Label;
	public winNum: eui.Label;
	public dwImg: eui.Image;
	public item1: ItemBase;
	public img: eui.Image;
	public rankImg: eui.Image;
	public level: eui.Label;
	public headBg: eui.Image;
	public head: eui.Image;
	public levelBg: eui.Image;

	public index: number;

	constructor() {
		super();
		// this.skinName = "LastWeekRankItemSkin";
	}

	public dataChanged(): void {
		this.index = this.itemIndex + 1;
		if (this.index <= 3) {
			this.rankImg.source = "paihang" + this.index;
			this.rank.text = "";
		} else {
			this.rank.text = this.index + "";
			this.rankImg.source = "";
		}
		if (this.data instanceof RankDataLadder) {
			let rankData: RankDataLadder = this.data as RankDataLadder;
			this.dwImg.source = "competition1_icon_" + rankData.challgeLevel;
			this.nameLabel.text = rankData.player;
			this.winNum.text = rankData.winNum + "场";
			this.head.source = `head_${rankData.job}${rankData.sex}`;
			// this.headBg.source = "ladder_level_" + rankData.challgeLevel;
			let config: any = Ladder.ins().getLevelConfig(rankData.challgeLevel, rankData.challgeId);
			this.item1.data = Ladder.ins().creatRewardData(GlobalConfig.TianTiRankAwardConfig[this.index + ""].award[0]);
			this.level.text = config.showDan + "";
			this.setlevelInfo(rankData.challgeLevel < 4);
			if (this.index == 1) {
				// this.headBg.source = "ladder_level_5";
			}
		} else if (this.data instanceof TianTiDanConfig) {
			let danConfig: TianTiDanConfig = this.data as TianTiDanConfig;
			this.winNum.text = "";
			this.nameLabel.text = danConfig.showLevel + "段位";
			this.item1.data = Ladder.ins().creatRewardData(danConfig.danAward[0]);
			this.setlevelInfo(true);
			this.dwImg.source = "competition1_icon_" + danConfig.level;
			this.level.text = danConfig.showDan + "";
			// this.headBg.source = "ladder_level_" + danConfig.level;
			this.setlevelInfo(false);
			this.rankImg.source = "";
			this.rank.text = "";
		} else {
			this.winNum.text = "";
			this.nameLabel.text = "钻石段位第" + this.index + "名";
			this.item1.data = Ladder.ins().creatRewardData(GlobalConfig.TianTiRankAwardConfig[this.index + ""].award[0]);
			this.dwImg.source = "competition1_icon_4";
			// this.headBg.source = "ladder_level_4";
			this.setlevelInfo(false);
			if (this.index == 1) {
				// this.headBg.source = "ladder_level_5";
			}
		}
	}

	private setlevelInfo(boo: boolean): void {
		this.levelBg.visible = this.level.visible = boo;
	}
}
