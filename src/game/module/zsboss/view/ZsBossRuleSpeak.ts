class ZsBossRuleSpeak extends BaseEuiView {

	private group: eui.Group;
	public background: eui.Image;
	public textInfo: eui.Label;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "HelpTipsSkin";

		this.isTopLevel = true;
	}

	public open(...param: any[]): void {
		this.addTouchEndEvent(this, this.otherClose);

		let index: number = param[0];

		let cfg = GlobalConfig.HelpInfoConfig[index];
		if (Assert(cfg, "HelpInfoConfig do not have index:" + index)) return;

		this.textInfo.textFlow = TextFlowMaker.generateTextFlow(GlobalConfig.HelpInfoConfig[index].text);
		this.textInfo.height = this.textInfo.textHeight;
		this.background.height = this.textInfo.textHeight + 60;
		this.anigroup.y = (StageUtils.ins().getHeight() - this.background.height) / 2

	}

	public close(...param: any[]): void {
		this.removeEventListener(egret.TouchEvent.TOUCH_END, this.otherClose, this);
	}

	private otherClose(evt: egret.TouchEvent) {
		ViewManager.ins().close(this);
	}
}

ViewManager.ins().reg(ZsBossRuleSpeak, LayerManager.UI_Popup);