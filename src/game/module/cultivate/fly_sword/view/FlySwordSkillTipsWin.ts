/**
 * 飞剑技能提示窗口
 */
class FlySwordSkillTipsWin extends BaseEuiView {
	public BG: eui.Image;
	public nameLabel: eui.Label;
	public subNameLabel: eui.Label;
	public description: eui.Label;

	public constructor() {
		super();
		this.skinName = `flySwordTipsSkin`;
	}

	public open(...param: any[]): void {
		let id: number = param[0];
		this.addTouchEndEvent(this, this.otherClose);
		this.setData(id);
	}

	public close(...param: any[]): void {
		this.removeEventListener(egret.TouchEvent.TOUCH_END, this.otherClose, this);
	}

	private otherClose(evt: egret.TouchEvent) {
		ViewManager.ins().close(this);
	}

	private setData(id: number): void {
		let config = new SkillData(id);
		if (config.name)
			this.nameLabel.text = config.name;
		if (config.desc)
			this.description.textFlow = TextFlowMaker.generateTextFlow(config.desc);

		this.BG.height = 170 + this.description.height;
	}

}

ViewManager.ins().reg(FlySwordSkillTipsWin, LayerManager.UI_Popup);