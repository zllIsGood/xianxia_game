class BoxDetailItem extends BaseItemRender {
	public constructor() {
		super();
		this.skinName = `ChestShowItemSkin`;
	}

	private item: ItemBase;
	private labelDesc: eui.Label;
	protected dataChanged() {
		let data = this.data as BoxItemData;
		this.labelDesc.textFlow = TextFlowMaker.generateTextFlow1(data.desc);
		this.item.data = data.reward;
	}

}