class BoxGetHintTips extends BaseView {
	public information: eui.Label;
	public box: eui.Image;

	constructor() {
		super();
		this.skinName = "ChestInformationSkin";
		this.horizontalCenter = 0;
		this.bottom = 0;
	}

	public set data(type: number) {
		let boxCfg: TreasureBoxConfig = GlobalConfig.TreasureBoxConfig[type];
		if (boxCfg) {
			this.information.text = `恭喜获得${boxCfg.name}`;
			this.box.source = boxCfg.imgClose;
		}
	}
}