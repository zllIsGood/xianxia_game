/**
 *通用确认购买界面
 * @author ade
 *
 */
class HuntWarnBuyWin extends BaseEuiView {
	public BG: eui.Rect;
	public yesBtn: eui.Button;
	public noBtn: eui.Button;
	public tipsCheckbox: eui.CheckBox;
	public desTxt: eui.Label;

	private static loginRecords: any = {};

	private callback: Function;

	private panel: any;

	private des: string;

	constructor() {
		super();
		this.skinName = "WarnBuySkin";
		this.isTopLevel = true;
	}

	public open(...args: any[]): void {
		this.panel = args[0];
		this.callback = args[1];
		this.des = args[2];

		this.addTouchEndEvent(this, this.onTouch);

		this.update();
	}

	public close(): void {
		this.panel = null;
		this.callback = null;
		this.removeTouchEvent(this, this.onTouch);
	}

	public static showBuyWarn(panel: any, callback: Function, des: string): void {
		if (HuntWarnBuyWin.loginRecords[panel] == true) {
			callback && callback();
		}
		else {
			ViewManager.ins().open(HuntWarnBuyWin, panel, callback, des);
		}
	}

	private update(): void {
		this.tipsCheckbox.selected = false;
		this.desTxt.textFlow = TextFlowMaker.generateTextFlow(this.des);
	}

	private onTouch(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.noBtn:
			case this.BG:
				ViewManager.ins().close(this);
				break;
			case this.yesBtn:
				HuntWarnBuyWin.loginRecords[this.panel] = this.tipsCheckbox.selected;
				this.callback && this.callback();
				ViewManager.ins().close(this);
				break;
		}
	}

}

ViewManager.ins().reg(HuntWarnBuyWin, LayerManager.UI_Popup);