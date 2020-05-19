class HuanHuaWin extends BaseEuiView {
	private closeBtn0: eui.Button;
	private closeBtn: eui.Button;
	private help: eui.Button;
	public huanhuaPanel:HuanShouSkinPanel;

	public constructor() {
		super();
		this.isTopLevel = true;
		this.skinName = "huanHuaSkin";
	}

	public initUI(): void {
		super.initUI();
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.help, this.onTap);
		this.huanhuaPanel.open();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
		this.removeTouchEvent(this.help, this.onTap);
		this.huanhuaPanel.close();
		this.removeObserve();
	}

	private onTap(e: egret.Event): void {
		switch (e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(this);
				break;
			case this.help:
				ViewManager.ins().open(ZsBossRuleSpeak, 33);
				break;
		}
	}
}

ViewManager.ins().reg(HuanHuaWin, LayerManager.UI_Main);