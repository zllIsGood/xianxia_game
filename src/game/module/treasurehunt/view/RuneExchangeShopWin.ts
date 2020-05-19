/**
 * 碎片商店
 *
 */
class RuneExchangeShopWin extends BaseEuiView {
	/** 关闭按钮 */
	public closeBtn: eui.Button;
	public closeBtn0: eui.Button;
	/** tabPanel */
	public viewStack: eui.ViewStack;
	/** 标签页 */
	public tab: eui.TabBar;


	/**角色选择面板 */
	public roleSelect: RoleSelectPanel;
	public runeShop: RunePanel;

	private panelArr: any[];

	private curSelectIndex: number = 0;

	private menulist1:eui.List;

	constructor() {
		super();
		this.skinName = "RuneExchangeShop";
		this.isTopLevel = true;
		// this.setSkinPart("roleSelect", new RoleSelectPanel());
		// this.setSkinPart("runeShop", new RuneExchangePanel());
	}

	public initUI(): void {
		super.initUI();
		this.panelArr = [this.runeShop];
		this.viewStack.selectedIndex = 0;
		this.tab.dataProvider = this.viewStack;
		// this.roleSelectPanel.visible = false;
	}

	public destoryView(): void {
		super.destoryView();
		// this.roleSelectPanel.destructor();
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.menulist1, this.onClick);
		this.addTouchEvent(this.tab, this.onTabTouch);
		// this.addChangeEvent(this.roleSelectPanel, this.switchRole);
		this.runeShop.curRole = 0;
		this.setSelectedIndex(0);

	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.menulist1, this.onClick);
		this.tab.removeEventListener(egret.Event.CHANGE, this.onTabTouch, this);
		// this.roleSelectPanel.removeEventListener(egret.Event.CHANGE, this.switchRole, this);
		this.removeObserve();
		this.panelArr[this.curSelectIndex].close();

	}
	/**
	 * 点击标签页按钮
	 */
	private onTabTouch(e: egret.TouchEvent): void {
		this.setOpenIndex(this.tab.selectedIndex);
	}
	private setOpenIndex(selectedIndex: number): void {
		switch (selectedIndex) {
			case 0:
				this.runeShop.open();
				break;
		}
	}

	private onClick(e: egret.TouchEvent): void {

		// switch (e.currentTarget) {
		//
		// }
	}

	private setSelectedIndex(selectedIndex: number) {
		this.curSelectIndex = selectedIndex;
		// this.roleSelectPanel.visible = false;
		this.panelArr[selectedIndex].open();
		this.viewStack.selectedIndex = selectedIndex;
	}


}

ViewManager.ins().reg(RuneExchangeShopWin, LayerManager.UI_Main);