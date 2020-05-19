class ExpFbItemRender extends BaseItemRender {
	public bg: eui.Image;
	public chosen: eui.Image;
	public txtImg: eui.Image;


	constructor() {
		super();
		this.skinName = "BtnTab7Skin";
	}

	protected dataChanged(): void {
		if(!this.data) return;
		this.bg.source = this.data;
	}
}