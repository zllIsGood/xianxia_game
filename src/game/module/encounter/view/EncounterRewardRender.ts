class EncounterRewardRender extends BaseItemRender {
	private item0: ItemBase;
	private item1: ItemBase;
	private rank: eui.Label;
	constructor() {
		super();
		// this.skinName = "LastWeekRankItemSkin";
	}

	public dataChanged(): void {
		// egret.log(this.data);
		if (this.data.maxRank == this.data.minRank) {
			this.rank.text = `第${this.data.minRank}名`;
		} else {
			this.rank.text = `第${this.data.minRank}名~第${this.data.maxRank}名`;
		}
		this.item0.data = this.data.rewards[0];
		this.item1.data = this.data.rewards[1];
	}
}
