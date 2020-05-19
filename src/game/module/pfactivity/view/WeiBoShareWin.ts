/**
 * Created by Administrator on 2016/9/9.
 */
class WeiBoShareWin extends BaseEuiView {

	public closeBtn1: eui.Button;
	public closeBtn: eui.Button;
	public fxBtn: eui.Button;
	public input: eui.TextInput;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "WeiboShareSkin";

		// this.input.textDisplay.fontFamily = "黑体";
		this.input.textDisplay.size = 16;
		this.input.textDisplay.lineSpacing = 0;
		this.input.textDisplay.multiline = true;
		this.input.textDisplay.wordWrap = true;
		this.input.textDisplay.height = 171;
		this.input.textDisplay.maxChars = 40;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn1, this.onTap);
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.fxBtn, this.onTap);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn1, this.onTap);
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.fxBtn, this.onTap);
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.fxBtn:
				if (this.input.text.length <= 0) {
					UserTips.ins().showTips("请输入分享内容");
					return;
				}
				window['weiboShare'](this.input.text, LocationProperty.openID, LocationProperty.openKey);
			case this.closeBtn1:
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
		}
	}
}

ViewManager.ins().reg(WeiBoShareWin, LayerManager.UI_Popup);