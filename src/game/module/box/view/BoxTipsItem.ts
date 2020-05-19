class BoxTipsItem extends BaseItemRender {
	public constructor() {
		super();
		this.skinName = `ChestInformationSkin`;
	}

	private label: eui.Label;

	protected dataChanged() {
		let data = this.data as BoxTipsData;
		let str = "|C:0x12b2ff&T:";
		str += data.name + "|在宝箱中获得";
		let item = GlobalConfig.ItemConfig[data.id];
		str += "|C:" + ItemConfig.getQualityColor(item) + "&T:" + item.name + "|";
		this.label.textFlow = TextFlowMaker.generateTextFlow1(str);
	}
}