class CdkeyPanle extends BaseView {

	public sendBtn:eui.Button;
	public input:eui.TextInput;

	constructor() {
		super();
		this.skinName = "CDkeySkin";
		this.input.maxChars = 28;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.sendBtn, this.onTap);
	}
	
	public close(...param: any[]): void {
		this.removeTouchEvent(this.sendBtn, this.onTap);
	}

	 private onTap(e: egret.TouchEvent): void {
		switch(e.currentTarget) {
			case this.sendBtn:
				CDKey.ins().sendCdkey(this.input.text);
			break;
		}
	}
}