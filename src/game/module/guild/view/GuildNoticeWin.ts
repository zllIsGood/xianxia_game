class GuildNoticeWin extends BaseEuiView {
	private closeBtn0: eui.Button;
	private saveBtn: eui.Button;
	private textInput: eui.Label;
	private closeBtn1: eui.Button;
	private bgrect: eui.Rect;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "GuildNoticeSkin";
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.closeBtn1, this.onTap);
		this.addTouchEvent(this.saveBtn, this.onTap);
		this.addTouchEvent(this.bgrect, this.onTap);
		this.textInput.text = Guild.ins().notice;
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn0, this.onTap);
		this.removeTouchEvent(this.closeBtn1, this.onTap);
		this.removeTouchEvent(this.saveBtn, this.onTap);
		this.removeTouchEvent(this.bgrect, this.onTap);
	}

	private onTap(e: egret.TouchEvent): void {

		switch (e.currentTarget) {
			case this.closeBtn0:
			case this.closeBtn1:
			case this.bgrect:
				ViewManager.ins().close(this);

				break;
			case this.saveBtn:
				Guild.ins().notice = this.textInput.text;
				Guild.ins().sendChangeNotice(this.textInput.text);
				ViewManager.ins().close(this);
				break;
		}
	}
}

ViewManager.ins().reg(GuildNoticeWin, LayerManager.UI_Main);