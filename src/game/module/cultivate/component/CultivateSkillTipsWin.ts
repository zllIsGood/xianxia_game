/**
 * 培养技能提示窗口
 */
class CultivateSkillTipsWin extends BaseEuiView {
	public BG: eui.Image;
	public nameLabel: eui.Label;
	public subNameLabel: eui.Label;
	public description: eui.Label;

	public constructor() {
		super();
		this.skinName = `flySwordTipsSkin`;
	}

	protected childrenCreated(): void {
		super.childrenCreated();
	}

	public open(...param: any[]): void {
		super.open(...param);
		this.addTouchEvent(this, this.onTapBtn);
		this.updateView(param[0]);
	}

	private onTapBtn(e: egret.TouchEvent): void {
		ViewManager.ins().close(this);
	}

	private updateView(data: any): void {
	}

}

ViewManager.ins().reg(CultivateSkillTipsWin, LayerManager.UI_Popup);