/**
 * Created by Administrator on 2017/3/3.
 */
class RuneWin extends BaseEuiView {

	public roleSelect: RoleSelectPanel;
	public viewStack: eui.ViewStack;

	public runePanel: RunePanel;
	public decomPanel: RuneDecomposePanel;
	// public exchangePanel: RuneExchangePanel;
	public tab: eui.TabBar;

	public redPoint1: eui.Image;
	// public redPoint2: eui.Image;
	private closeBtn: eui.Button;
	constructor() {
		super();
		this.skinName = "RuneSkin";
		// this.setSkinPart("roleSelect", new RoleSelectPanel());
		// this.setSkinPart("runePanel", new RunePanel());
		// this.setSkinPart("decomPanel", new RuneDecomposePanel());
		// this.setSkinPart("exchangePanel", new RuneExchangePanel());
		this.isTopLevel = true;
	}

	public destoryView(): void {
		super.destoryView();

		this.roleSelect.destructor();
	}

	public open(...param: any[]): void {
		let selectedIndex = param ? (param[0] ? param[0] : 0) : 0;
		let viewIndex = param ? (param[1] ? param[1] : 0) : 0;
		this.roleSelect.setCurRole(selectedIndex);
		this.switchTab(viewIndex);

		this.addChangeEvent(this.roleSelect, this.onChange);
		this.addChangeEvent(this.tab, this.onTabTouch);
		this.addTouchEndEvent(this.closeBtn, this.onClick);
		let gameLogic = GameLogic.ins();
		let rune = Rune.ins();
		this.observe(gameLogic.postRuneExchange, this.refushRedPoint);
		this.observe(gameLogic.postRuneShatter, this.refushRedPoint);
		this.observe(UserBag.ins().postHuntStore, this.refushRedPoint);
		this.observe(rune.postInlayResult, this.refushRedPoint);
		this.observe(rune.postUpgradeResult, this.refushRedPoint);
		this.setRoleId(this.roleSelect.getCurRole());
		this.refushRedPoint();
	}
	private onClick(e: egret.TouchEvent) {
		ViewManager.ins().close(this);
	}
	public close(...param: any[]): void {
		this.removeObserve();
		let vim = ViewManager.ins();
		if (vim.isShow(RuneBookWin))
			vim.close(RuneBookWin);
		this.runePanel.close();
		this.decomPanel.close();
		this.removeTouchEvent(this.closeBtn, this.onClick);
	}

	private onChange(e: egret.Event): void {
		this.setRoleId(this.roleSelect.getCurRole());
		this.refushRedPoint();
	}
	public switchTab(index: number) {
		this.viewStack.selectedIndex = index;
		this.setOpenIndex(this.viewStack.selectedIndex);
	}
	/**
	 * 点击标签页按钮
	 */
	private onTabTouch(e: egret.TouchEvent): void {
		this.setOpenIndex(this.tab.selectedIndex);
	}

	private setRoleId(roleId: number): void {
		// this.runePanel.curRole = this.decomPanel.curRole = this.exchangePanel.curRole = roleId;
		this.runePanel.curRole = this.decomPanel.curRole = roleId;
		this.setOpenIndex(this.viewStack.selectedIndex);
	}

	private setOpenIndex(selectedIndex: number): void {
		switch (selectedIndex) {
			case 0:
				this.runePanel.open();
				break;
			case 1:
				this.decomPanel.open();
				break;
			case 2:
				// this.exchangePanel.open();
				break;
		}
	}

	private refushRedPoint(): void {
		this.redPoint1.visible = RuneRedPointMgr.ins().checkAllSituation(false);
		// this.redPoint2.visible = RuneRedPointMgr.ins().checkCanExchange();
		let len: number = SubRoles.ins().subRolesLen;
		for (let i: number = 0; i < len; i++) {
			let flag: boolean = RuneRedPointMgr.ins().checkRoleAllSituation(i);
			this.roleSelect.showRedPoint(i, flag);
		}
	}

	public static openCheck(...param) {
		let level = GlobalConfig.RuneOtherConfig.zsLevel;
		if (Actor.level < level) {
			UserTips.ins().showTips(`${level}级开启`);
			return false;
		}
		return true;
	}
}
ViewManager.ins().reg(RuneWin, LayerManager.UI_Main);
