class ArtifactAttrDescItem extends eui.ItemRenderer {
	public constructor() {
		super();
		this.skinName = `shenQiAttrDescSkin`;
	}

	private labelInfo: eui.Label;

	protected dataChanged() {
		let data = this.data as AttributeData;
		// let str = AttributeData.getAttStrByType(data,3,`+`,true);
		let str = AttributeData.getAttStrByType(data,0,"：");
		this.labelInfo.text = str;
	}
}