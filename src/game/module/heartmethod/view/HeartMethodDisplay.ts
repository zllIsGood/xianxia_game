class HeartMethodDisplay extends BaseItemRender {
	public itemIcon: ItemIcon;
	public nameTF: eui.Label;
	public nameBG: eui.Image;

	public constructor() {
		super();
		this.skinName = "heartmethodItemIconSkin";
	}


	protected dataChanged(): void {
		if (!this.data)return;
		if (this.data instanceof ItemData) {
			let itemData: ItemData = this.data;
			let itemCfg: ItemConfig = GlobalConfig.ItemConfig[itemData.itemConfig.id];
			this.itemIcon.setData(itemCfg);
			let color = ItemConfig.getQualityColor(itemCfg);
			this.nameTF.textFlow = TextFlowMaker.generateTextFlow1(`|C:${color}&T:${itemCfg.name}`);
		}

	}

	public destruct(): void {

	}


}