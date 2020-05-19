/**
 * 心法部位控件
 * heartmethodPosSkin
 * */
class HeartMethodItemRenderer extends BaseItemRender {
	private itemIcon: ItemIcon;
	private blank: eui.Image;
	private redPoint: eui.Image;

	constructor() {
		super();

	}

	protected childrenCreated(): void {
		super.childrenCreated();
	}

	public dataChanged(): void {
		if (!this.data)return;
		if (this.data) {
			if (this.data.itemid) {
				//开启
				this.itemIcon.setData(GlobalConfig.ItemConfig[this.data.itemid]);
				this.itemIcon.visible = true;
				this.blank.visible = false;
			} else {
				//未开启
				this.itemIcon.visible = false;
				this.blank.source = this.data.blank;
				this.blank.visible = true;
			}
			this.redPoint.visible = this.data.redPoint;
		}

	}

}