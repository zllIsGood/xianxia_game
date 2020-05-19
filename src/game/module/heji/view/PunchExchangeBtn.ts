class PunchExchangeBtn extends eui.ItemRenderer {
	// private rank: eui.Label;
	private grewUpAllBtn:eui.Button;
	private btnText:eui.Label;
	private redPoint:eui.Image;
	public constructor() {
		super();
		this.skinName = 'PunchExchangeBtnSkin';
	}

	protected dataChanged(): void {
		// if (!this.data || !this.data.itemConfig)return;
		// let item = this.data.getItem;
		// this.rank.text = GlobalConfig.ItemConfig[item.id].name;
		// this.rank.text = this.data.name;
		this.btnText.text = this.data.config.name;
		this.redPoint.visible = UserSkill.ins().getPunchExchangePageRedPoint(this.data.index);
	}

	public setBtnStatu(): void {

	}
}