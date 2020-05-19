
/**熔炼窗口*/
class SmeltEquipTotalWin extends BaseEuiView {
	// public viewStack: eui.ViewStack;
	// public equiprong: SmeltEquipRongluPanel;
	// public tab: eui.TabBar;
	public closeBtn0: eui.Button;
	public closeBtn: eui.Button;
	public redPoint: eui.Image;

	private equip: SmeltEquipNormalPanel;
	private lastSelect: number;
	private bgClose: eui.Rect;
	constructor() {
		super();
		this.skinName = "SmeltMainViewSkin";
		this.isTopLevel = true;//设为1级UI
		// this.setSkinPart("equip", new SmeltEquipNormalPanel());
	}

	public initUI(): void {
		super.initUI();
		
		// this.tab.dataProvider = this.viewStack;	
	}

	public open(...param: any[]): void {
		this.lastSelect = 0;
		// this.viewStack.selectedIndex = this.lastSelect;
		// this.addTouchEvent(this.closeBtn, this.onTap);
		// this.addTouchEvent(this.closeBtn0, this.onTap);
		this.equip.open();
		this.addTouchEvent(this.bgClose, this.onTap);
		// this.observe(Bless.ins().postBlessRongluSuccess,this.itemUpdate);
		// this.viewStack.getElementAt(this.lastSelect)['open']();
		// this.itemUpdate();
	}

	public close(...param: any[]): void {
		// this.removeTouchEvent(this.closeBtn, this.onTap);
		// this.removeTouchEvent(this.closeBtn0, this.onTap);
		// this.tab.removeEventListener(egret.Event.CHANGE, this.onTabTouch, this)
		this.equip.close();
		this.removeTouchEvent(this.bgClose, this.onTap);
		// this.equiprong.close();
	}

	// private itemUpdate(): void {
	// 	this.redPoint.visible = false;
	// 	let config: RongLuLevelConfig = GlobalConfig.RongLuLevelConfig[Bless.ins().level + 1];
	// 	if (UserBag.ins().getWingZhuEquip().length >= 10 && config) {
	// 		this.redPoint.visible = true;
	// 	}
	// }

	/**
	 * 点击标签页按钮
	 */
	// private onTabTouch(e: egret.Event): void {
	// 	this.viewStack.getElementAt(this.lastSelect)['close']();
	// 	this.lastSelect = this.viewStack.selectedIndex;
	// 	this.viewStack.getElementAt(this.lastSelect)['open']();
	// }

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.bgClose:
				ViewManager.ins().close(this);
				break
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(this);
				break;
		}
	}
}
ViewManager.ins().reg(SmeltEquipTotalWin, LayerManager.UI_Popup);