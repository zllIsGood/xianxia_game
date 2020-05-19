class HuanShouSkinSkillTips extends BaseEuiView {
	public bgClose: eui.Image;
	// public anigroup: eui.Group;
	// public curGroup: eui.Group;
	public skillName0: eui.Label;
	public skillDesc0: eui.Label;
	// public conditionGroup0: eui.Group;
	public condition0: eui.Label;
	// public lock0: eui.Label;
	public nextGroup: eui.Group;
	public skillName1: eui.Label;
	public skillDesc1: eui.Label;
	// public condition1: eui.Label;
	public lock1: eui.Label;
	// public tipGroup: eui.Group;

	public constructor() {
		super();
		this.skinName = "huanShouSkillTipsSkin";
	}

	public open(...param: any[]): void {
		this.addTouchEndEvent(this, this.otherClose);

		this.setData(param[0], param[1], param[2]);
	}

	protected otherClose() {
		ViewManager.ins().close(this);
	}

	protected setData(zlId: number, confStage: number, conf: { name: string, desc: string }): void {
		let hsData = UserHuanShou.ins().skinList[zlId];
		let currStage = hsData ? hsData.rank : 1;
		if (currStage < confStage) {
			this.currentState = "unactive";
		} else {
			this.currentState = "max";
		}
		this.validateNow();

		this.skillName0.text = conf.name;
		this.skillDesc0.textFlow = TextFlowMaker.generateTextFlow(conf.desc);
		if (this.currentState == "unactive") {
			let conf = GlobalConfig.HuanShouSkinConf[zlId];
			this.condition0.text = `${conf.huanShouName}达到${confStage}阶`;
		} else {
			this.condition0.text = "";
		}
	}
}
ViewManager.ins().reg(HuanShouSkinSkillTips, LayerManager.UI_Popup);