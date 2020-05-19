class LiLianTips extends BaseEuiView {
	// private colorCanvas: eui.Image;
	private cruDesc: eui.Label;
	private nextDesc: eui.Label;
	private skillName: eui.Label;
	private skillIcon: eui.Image;
	private bgClose: eui.Rect;
	private currTrainName: eui.Label;
	private nextTrainName: eui.Label;

	public initUI(): void {
		super.initUI();
		this.skinName = "LiLianTipsSkin";
		this.isTopLevel = true;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.bgClose, this.onTap);
		this.setPanel();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.bgClose, this.onTap);
		this.removeObserve();
	}

	private setPanel(): void {
		let config: TrainLevelAwardConfig = LiLian.ins().getCruLevelSkillCfg();
		let nextConfig: TrainLevelAwardConfig = LiLian.ins().getCruLevelSkillCfg(true);

		if (config) {
			this.skillIcon.source = config.icon + "";
			this.skillName.text = config.skillname;
			this.cruDesc.textFlow = TextFlowMaker.generateTextFlow(config.desc);
			let levelConfig: TrainLevelConfig = GlobalConfig.TrainLevelConfig[config.level];
			// let color: string = ColorUtil.JUEWEI_COLOR[levelConfig.type - 1];
			let str: string = `·${levelConfig.trainName}`;
			this.currTrainName.textFlow = TextFlowMaker.generateTextFlow(str);
		}
		if (nextConfig) {
			this.nextDesc.textFlow = TextFlowMaker.generateTextFlow(nextConfig.desc);
			let nextLevelConfig: TrainLevelConfig = GlobalConfig.TrainLevelConfig[nextConfig.level];

			// let color1: string = ColorUtil.JUEWEI_COLOR[nextLevelConfig.type - 1];
			let str1: string = `·${nextLevelConfig.trainName}`;
			this.nextTrainName.textFlow = TextFlowMaker.generateTextFlow(str1);
		} else {
			this.nextDesc.text = "";
		}
	}

	private onTap(e: egret.TouchEvent): void {
		ViewManager.ins().close(LiLianTips);
	}
}

ViewManager.ins().reg(LiLianTips, LayerManager.UI_Popup);