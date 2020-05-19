class ResultCoinItem extends eui.ItemRenderer {
	public constructor() {
		super();
		this.skinName = "ResultCoinItemSkin";
	}

	private labelInfo: eui.Label;
	private imgCoin: eui.Image;
	private labelCount: eui.Label;

	protected dataChanged() {
		let data = this.data as RewardData;
		this.labelInfo.size = 20;
		this.labelInfo.text = `获得${RewardData.getCurrencyName(data.id)}：`;
		this.imgCoin.source = RewardData.getCurrencyRes(data.id);
		this.labelCount.text = `${data.count}`;
		this.labelInfo.x = 0;
		this.imgCoin.x = this.labelInfo.x + this.labelInfo.textWidth;
		this.labelCount.x = this.imgCoin.x + this.imgCoin.width;
	}
}