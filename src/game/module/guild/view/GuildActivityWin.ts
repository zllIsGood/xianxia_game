class GuildActivityWin extends BaseEuiView {
	private closeBtn: eui.Button;
	private closeBtn0: eui.Button;
	private tab: eui.TabBar;
	private viewStack: eui.ViewStack;
	private taskPanel: GuildTaskPanel;
	// private fubenPanel: GuildFubenWin;
	private activityPanel: GuildActityPanel;
	public redPoint1: eui.Image;
	public redPoint0: eui.Image;

	private lastSelect: number;
	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "GuildActivityBgSkin";

		this.tab.dataProvider = this.viewStack;

		// this.fubenPanel = new GuildFubenWin();

		this.activityPanel = new GuildActityPanel();

	}

	public static openCheck(...param: any[]): boolean {
		let rtn = (Guild.ins().guildID != 0);
		if(!rtn){
			UserTips.ins().showTips("还未加入仙盟！");
		}
		return rtn;
	}

	public open(...param: any[]): void {

		this.lastSelect = 0;
		this.viewStack.selectedIndex = this.lastSelect;
		// if (GameServer.serverOpenDay >= (GlobalConfig.guildfbconfig.openDay - 1)) {
		// 	this.viewStack.addChild(this.fubenPanel);
		// }
		if (GameServer.serverOpenDay >= (GlobalConfig['GuildActivityConfig']["1"].openDay - 1)) {
			this.viewStack.addChild(this.activityPanel);
		}
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addChangeEvent(this.tab, this.setSelectedIndex);
		this.observe(GuildFB.ins().postGuildFubenInfo, this.updateRedpoint);
		this.viewStack.getElementAt(this.lastSelect)['open']();
		this.updateRedpoint();
	}

	private updateRedpoint(): void {
		this.redPoint1.visible = GuildFB.ins().hasbtn();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
		// if (this.viewStack.getChildIndex(this.fubenPanel) >= 0) {
		// 	this.fubenPanel.close();
		// }
		this.removeObserve();

		// this.removeObserve();
	}
	private onTap(e: egret.TouchEvent): void {

		switch (e.currentTarget) {
			case this.closeBtn0:
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
		}
	}
	private setSelectedIndex(e: egret.Event) {
		this.viewStack.getElementAt(this.lastSelect)['close']();
		this.lastSelect = this.viewStack.selectedIndex;
		this.viewStack.getElementAt(this.lastSelect)['open']();
	}
}

ViewManager.ins().reg(GuildActivityWin, LayerManager.UI_Main);