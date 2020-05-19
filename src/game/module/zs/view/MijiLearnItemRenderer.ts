class MijiLearnItemRenderer extends BaseItemRender {
	public item: ItemBaseNoTap;
	public label: eui.Label;

	public constructor() {
		super();
		this.skinName = "MijiLearnItemSkin";
	}

	protected dataChanged(): void {
		let obj: Object = this.data;
		this.item.data = obj["item"];
		if (obj["islearn"]) {
			this.label.visible = true;
			// this.item.setItemImg(`hui${obj["item"].itemConfig.icon}_png`);
			this.item["itemIcon"]["imgIcon"].filters = FilterUtil.ARRAY_GRAY_FILTER;
		} else {
			this.item["itemIcon"]["imgIcon"].filters = null;
			this.label.visible = false;
		}
	}

}