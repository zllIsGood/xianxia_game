/**客服窗口 */
class CustomServiceWin extends BaseEuiView {

	public closeBtn: eui.Button;
	public closeBtn0: eui.Button;
	public sendBtn: eui.Button;
	public input: eui.TextInput;

	private defaultText: string;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "CustomServiceSkin";

		this.defaultText = "点击输入咨询内容";
	}


	protected childrenCreated(): void {
		super.childrenCreated();
	}

	public open(...param: any[]): void {

		// this.input.textDisplay.fontFamily = "黑体";
		this.input.textDisplay.size = 16;
		this.input.textDisplay.lineSpacing = 0;
		this.input.textDisplay.multiline = true;
		this.input.textDisplay.wordWrap = true;
		this.input.textDisplay.height = 335;

		if (this.input.text.length == 0) {
			this.input.text = this.defaultText;
			this.input.textColor = 0x6C6C6C;
		}
		else
			this.input.textColor = 0xDFD1B5;

		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.sendBtn, this.onTap);
		this.input.addEventListener(egret.FocusEvent.FOCUS_IN, this.updateInput, this);
	}

	public close(...param: any[]): void {

		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
		this.removeTouchEvent(this.sendBtn, this.onTap);
		this.input.removeEventListener(egret.FocusEvent.FOCUS_IN, this.updateInput, this);
	}

	private updateInput(): void {
		if (this.input.text == this.defaultText) {
			this.input.text = "";
			this.input.textColor = 0xDFD1B5;
		}
	}

	private onTap(e: egret.TouchEvent): void {

		switch (e.target) {
			case this.closeBtn0:
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;

			case this.sendBtn:
				if (this.input.text.length == 0 || this.input.text == this.defaultText) {
					UserTips.ins().showTips( "内容不能为空");
					return;
				}
				ReportData.getIns().advice(this.input.text, this.callBack, this);
				break;
		}
	}

	private callBack(): void {
		this.input.text = "";
	}
}

ViewManager.ins().reg(CustomServiceWin, LayerManager.UI_Main);
