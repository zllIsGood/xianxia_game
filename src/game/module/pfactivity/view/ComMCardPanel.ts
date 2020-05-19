class ComMCardPanel extends BaseView {
	des: eui.Label
	title: eui.Group
	mc
	titleImg

	constructor() {
		super();
		this.skinName = "ComMCardSkin";
	}
	public open(...param: any[]): void {
		// this.observe(Recharge.ins().postUpdateRecharge, this.setView);

		this.update()
		this.setIconEff()
	}

	update() {
		var str = GlobalConfig.PrivilegeData['allrightDesc']
		this.des.textFlow = TextFlowMaker.generateTextFlow(str)
	}

	public close(...param: any[]): void {
		this.removeObserve();
	}

	private setIconEff() {
		let config: TitleConf = GlobalConfig.TitleConf[15];
		if (!config) return;
		if (config.eff) {
			if (!this.mc)
				this.mc = new MovieClip;
			if (!this.mc.parent)
				this.title.addChild(this.mc);
			this.mc.playFile(RES_DIR_EFF + "chenghaozztq_big", -1);
		} else {
			if (!this.titleImg)
				this.titleImg = new eui.Image(config.img);
			if (!this.titleImg.parent)
				this.title.addChild(this.titleImg);
		}
	}
}
