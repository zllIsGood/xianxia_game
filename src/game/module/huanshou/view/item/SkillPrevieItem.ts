class SkillPrevieItem extends HuanShouSkillItem {
	public isTap: boolean = true;
	public constructor() {
		super();
		this.init();
	}

	/**触摸事件 */
	protected init(): void {
		this.currentState = "manual";
		this.addEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
	}

	private onClick() {
		if (this.isTap && this.itemConfig)
			ViewManager.ins().open(HuanShouSkillTips, this.itemConfig.id, 1);
	}

	protected dataChanged(): void {
		this.clear();
		if (!this.data) {

		} else if (!isNaN(this.data)) {
			this.itemConfig = GlobalConfig.ItemConfig[this.data];

		} else if (this.data instanceof ItemData) {
			//道具数据
			this.itemConfig = this.data.itemConfig;
			if (!this.itemConfig)
				return;
			(<ItemData>this.data).count > 1 ? this.setCount((<ItemData>this.data).count + "") : this.setCount("");
		}

		this.updateShow();
	}
}