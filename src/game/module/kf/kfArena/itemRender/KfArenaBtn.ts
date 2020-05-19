class KfArenaBtn extends BaseItemRender {
	public labelDisplay: eui.Label;
	public constructor() {
		super();
		this.skinName = "BtnTab0Skin";
	}

	protected dataChanged(): void {
		this.labelDisplay.text = this.data;
	}
}
