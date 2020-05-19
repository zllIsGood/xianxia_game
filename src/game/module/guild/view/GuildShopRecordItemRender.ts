class GuildShopRecordItemRender extends BaseItemRender {
	public rank: eui.Label;

	public constructor() {
		super();
		this.skinName = "GuildStoreItemSkin";
	}

	protected dataChanged(): void {
		if (this.data instanceof GuildStoreRecordInfo) {
			let config: ItemConfig = GlobalConfig.ItemConfig[this.data.itemId];
			if (config)
				this.rank.textFlow = new egret.HtmlTextParser().parser(`${this.data.roleName}   获得了   <font color=${ItemConfig.getQualityColor(config)}>${config.name}</font>`);
			else
				this.rank.text = "";
		}
	}
}