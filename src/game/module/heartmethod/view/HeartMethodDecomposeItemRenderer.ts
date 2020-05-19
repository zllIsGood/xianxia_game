class HeartMethodDecomposeItemRenderer extends eui.ItemRenderer {

	public itemIcon: HeartMethodDisplay;
	public cb: eui.CheckBox;
	// private mc: MovieClip;

	public constructor() {
		super();
		this.skinName = "heartmethodItemSkin";

		// this.mc = new MovieClip;
		// this.mc.x = 56;
		// this.mc.y = 64;
		// this.mc.scaleX = 1.5;
		// this.mc.scaleY = 1.5;
		// this.addChild(this.mc);
	}

	protected dataChanged(): void {
		//复选框鼠标屏蔽
		this.cb.touchChildren = false;
		this.cb.touchEnabled = false;
		//刷新数据
		let rdid: HeartMethodDecomposeItemData = this.data as HeartMethodDecomposeItemData;
		let itemData: ItemData = rdid.itemData;
		if (itemData && itemData instanceof ItemData) {
			let rbc: HeartMethodStarConfig = HeartMethod.ins().getHeartCfg(itemData);
			if (rbc) {
				//图标
				this.itemIcon.data = itemData;
			} else {
				this.resetView();
			}
		} else {
			this.resetView();
		}
		//勾选
		this.cb.selected = rdid.isSelected;
	}

	private resetView(): void {
		this.itemIcon.data = null;
	}

	public playEffect(): void {
		if (!this.cb.selected)
			return;
		// this.mc.playFile(RES_DIR_EFF + "litboom", 1);
	}
}