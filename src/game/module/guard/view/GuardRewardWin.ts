/**
 * Created by Peach.T on 2017/12/28.
 */
class GuardRewardWin extends BaseEuiView {

	public closeBtn:eui.Rect;
	public nameTxt:eui.Label;
	public nameTxt0:eui.Label;
	public giveUp:eui.Image;
	public endItem0:BaseComponent;
	public endItem1:BaseComponent;
	public endItem2:BaseComponent;
	public endItem3:BaseComponent;

	constructor() {
		super();
		this.skinName = "guardGodWeaponTishiSkin";
		this.isTopLevel = true;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.closeWin);
		this.addTouchEvent(this.giveUp, this.closeWin);
	}


}

ViewManager.ins().reg(GuardRewardWin, LayerManager.UI_Popup);
