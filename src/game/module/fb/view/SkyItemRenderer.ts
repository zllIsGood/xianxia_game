class SkyItemRenderer extends eui.ItemRenderer {

	public passAllTip0: eui.Label;

	public constructor() {
		super();
		this.touchEnabled = false;
		this.skinName = "chuangtianguanItem";
	}

	public dataChanged(): void {
		let info: FbChallengeConfig = this.data;
		if (info) {
			this.passAllTip0.text = info.layer + "层";
			this.currentState = info.id == SkyLevelModel.ins().cruLevel ? "down" : "up";
		}
	}
}