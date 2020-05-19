/**
 * Created by Peach.T on 2017/12/29.
 */
class GuardQuitTips extends BaseEuiView {

	public BG: eui.Rect;
	public anigroup: eui.Group;
	public desc: eui.Label;
	public closeBtn: eui.Button;
	public up: eui.Button;

	constructor() {
		super();
		this.skinName = "guardGodWeaponQuiteTip";
		this.isTopLevel = true;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.closeWin);
		this.addTouchEvent(this.BG, this.closeWin);
		this.addTouchEvent(this.up, this.onQuit);
	}

	private onQuit(): void {
		UserFb.ins().sendExitFb();
		this.closeWin();
	}

}

ViewManager.ins().reg(GuardQuitTips, LayerManager.UI_Popup);
