class CDKeyWin extends BaseEuiView {

	public closeBtn: eui.Button;
	public closeBtn0: eui.Button;
	public sendBtn: eui.Button;
	public input: eui.TextInput;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "CDkeySkin";

		this.input.maxChars = 28;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.sendBtn, this.onTap);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
		this.removeTouchEvent(this.sendBtn, this.onTap);
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(CDKeyWin);
				break;
			case this.sendBtn:
				CDKey.ins().sendCdkey(this.input.text);
				break;
		}
	}
}

ViewManager.ins().reg(CDKeyWin, LayerManager.UI_Main);