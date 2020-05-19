class RuneDecomposeItemRenderer extends eui.ItemRenderer {

	public itemIcon: RuneDisplay;
	public power: eui.Label;
	public cb: eui.CheckBox;
	private mc: MovieClip;

	public constructor() {
		super();
		this.skinName = "RuneSeletctItemSkin";

		this.mc = new MovieClip;
		this.mc.x = 56;
		this.mc.y = 64;
		this.mc.scaleX = 1.5;
		this.mc.scaleY = 1.5;
		this.addChild(this.mc);
	}

	protected dataChanged(): void {
		//复选框鼠标屏蔽
		this.cb.touchChildren = false;
		this.cb.touchEnabled = false;
		//刷新数据
		let rdid: RuneDecomposeItemData = this.data as RuneDecomposeItemData;
		let itemData: ItemData = rdid.itemData;
		if (itemData && itemData instanceof ItemData) {
			let rbc: RuneBaseConfig = RuneConfigMgr.ins().getBaseCfg(itemData);
			if (rbc) {
				//图标
				this.itemIcon.setData(itemData);
				//战力
				// this.power.text = "评分：" + rbc.power;
				this.power.text = RuneConfigMgr.ins().getcfgAttrDesc(rbc, true);
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
		this.itemIcon.setData(null);
		this.power.text = "";
	}

	public playEffect(): void {
		if (!this.cb.selected)
			return;
		this.mc.playFile(RES_DIR_EFF + "litboom", 1);
	}
}