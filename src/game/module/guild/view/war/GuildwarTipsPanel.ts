class GuildwarTipsPanel extends BaseEuiView {
	public initUI(): void {
		super.initUI();
		this.skinName = "GameTipsSkin";
		this.isTopLevel = true;
	}
	public open(...param: any[]): void {
		this.addTouchEvent(this, this.onTap);
	}
	public close(...param: any[]): void {
		this.removeTouchEvent(this, this.onTap);
	}

	public onTap(e: egret.TouchEvent): void {
		ViewManager.ins().close(GuildwarTipsPanel);
	}
}
ViewManager.ins().reg(GuildwarTipsPanel, LayerManager.UI_Main);