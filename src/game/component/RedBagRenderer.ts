class RedBagRenderer extends BaseItemRender {

	public num:eui.Label;
	public nameLabel:eui.Label;

	constructor() {
		super();
		this.skinName = "RedBagRendererSkin";
	}

	public dataChanged(): void {
		this.num.text = this.data.robNum;
		this.nameLabel.text = this.data.robName;
	}
}