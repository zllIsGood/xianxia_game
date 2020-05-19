class DegreeTpisWin extends BaseEuiView{
	
	private group: eui.Group;
	public background: eui.Image;
	public textInfo: eui.Label;

	public constructor() {
		super();
		this.skinName = "DegreeTipsSkin";
	}

	public open(...param: any[]): void {
		this.addTouchEndEvent(this, this.otherClose);

		this.textInfo.textFlow = TextFlowMaker.generateTextFlow(param[0]);
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

ViewManager.ins().reg(DegreeTpisWin, LayerManager.UI_Popup);