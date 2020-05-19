class WingHintWin extends BaseEuiView {

	public BG: eui.Rect;
	public desc: eui.Label;
	public closeBtn: eui.Button;
	public up: eui.Button;
	public nextHint: eui.CheckBox;

	private type: number;
	private index: number;
	private data: WingsData;
	private lastTimeDown: number;

	constructor() {
		super();
		this.isTopLevel = true;
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "WingWarnTips";
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onClick);
		this.addTouchEvent(this.up, this.onClick);
		this.addTouchEvent(this.BG, this.onClick);

		this.type = param[0];
		this.index = param[1];
		this.data = param[2];

		this.lastTimeDown = Math.floor((DateUtils.formatMiniDateTime(this.data.clearTime) - GameServer.serverTime) / 1000);
		this.lastTimeDown = (DateUtils.formatMiniDateTime(this.data.clearTime) - GameServer.serverTime) / 1000;
		this.lastTimeDown = Math.max(0, this.lastTimeDown);
		this.desc.textFlow = TextFlowMaker.generateTextFlow(`你的羽翼有祝福值：|C:0xf8b141&T:${this.data.exp}|,将在|C:0xf3311e&T:${DateUtils.getFormatBySecond(this.lastTimeDown, 1)}|清空，请尽快升阶?`);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onClick);
		this.removeTouchEvent(this.up, this.onClick);
		this.removeTouchEvent(this.BG, this.onClick);
	}

	private onClick(e: egret.TouchEvent): void {
		ViewManager.ins().close(WingHintWin);
		switch (e.currentTarget) {
			case this.closeBtn:
				if (this.type == 1) {
					let view: BaseView = ViewManager.ins().getView(RoleWin);
					(view as RoleWin).setTabSelectedIndex(this.index);
				} else if (this.type == 2) {
					ViewManager.ins().close(RoleWin);
				}
				break;
		}
		Wing.hint = !this.nextHint.selected;
	}
}
ViewManager.ins().reg(WingHintWin, LayerManager.UI_Popup);