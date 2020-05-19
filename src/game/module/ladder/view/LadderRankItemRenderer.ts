/**
 * 天梯 - 排名item
 */
class LadderRankItemRenderer extends BaseItemRender {

	public bg: eui.Image;
	public rank: eui.Label;
	public nameLabel: eui.Label;
	public winNum: eui.Label;
	public dwImg: eui.Image;
	public level: eui.Image;
	public levelBg: eui.Image;
	public rankImg: eui.Image;

	constructor() {
		super();

		this.skinName = "TiantiRankItem";
	}

	public dataChanged(): void {
		let rankData: RankDataLadder = this.data as RankDataLadder;
		if (rankData.pos <= 3) {
			this.rankImg.source = "paihang" + rankData.pos;
			this.rank.text = "";
		} else {
			this.rank.text = rankData.pos + "";
			this.rankImg.source = "";
		}
		this.nameLabel.text = rankData.player;
		this.winNum.text = rankData.winNum + "场";
		this.dwImg.source = "competition1_icon_" + rankData.challgeLevel;
		let config: any = Ladder.ins().getLevelConfig(rankData.challgeLevel, rankData.challgeId);
		if (config && config.showDan > 0) {
			this.level.source = 'laddergradnum_' + config.showDan;
			this.levelBg.visible = true;
		} else {
			this.level.source = null;
			this.levelBg.visible = false;
		}
	}
}