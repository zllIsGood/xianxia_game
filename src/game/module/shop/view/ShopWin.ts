
class ShopWin extends BaseEuiView {
	/** 关闭按钮 */
	public closeBtn: eui.Button;
	public closeBtn0: eui.Button;
	/** tabPanel */
	public viewStack: eui.ViewStack;
	/** 标签页 */
	public tab: eui.TabBar;

	public itemShopPanel: ItemShopPanel;
	public blackMarketPanel: BlackMarketPanel;
	public honorMarketPanel: HonorMarketPanel;


	private lastIndex: number = 0;
	
	private redPoint0:eui.Image;
	constructor() {
		super();
		this.skinName = "ShopSkin";
		this.isTopLevel = true;
		// this.setSkinPart("roleSelect", new RoleSelectPanel());
		// this.setSkinPart("itemShopPanel", new ItemShopPanel());
		// this.setSkinPart("blackMarketPanel", new BlackMarketPanel());

	}

	public initUI(): void {
		super.initUI();
	}

	private scrollBottom:boolean = false
	public open(...param: any[]): void {
		// this.tab.selectedIndex = param ? param[0] : 0;
		// this.viewStack.selectedIndex = param ? param[0] : 0;
		this.addTouchEvent(this.closeBtn, this.onClick);
		this.addTouchEvent(this.closeBtn0, this.onClick);
		this.addChangeEvent(this.tab, this.onTabTouch);
		this.observe(UserBag.ins().postItemAdd,this.buyToUse);
		this.observe(ShopRedPoint.ins().postBlackMarketRedPoint,this.updateRedPoint);


		this.lastIndex = param[0] == undefined ? this.lastIndex : param[0];
		if(param[1])this.scrollBottom = param[1];
		this.tab.selectedIndex = this.lastIndex;
		this.viewStack.selectedIndex = this.lastIndex;
		this.setOpenIndex(this.lastIndex);
		Shop.ins().postRefreshGoodsSuccess(false);

		this.updateRedPoint();
	}
	public updateRedPoint(){
		this.redPoint0.visible = ShopRedPoint.ins().blackMarketRedPoint;
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onClick);
		this.removeTouchEvent(this.closeBtn0, this.onClick);
		this.itemShopPanel.close();
		this.blackMarketPanel.close();
		this.honorMarketPanel.close();
	}

	private onClick(e: egret.TouchEvent): void {

		switch (e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(this);
				break;
		}
	}

	/**
 	点击标签页按钮
 	*/
	private onTabTouch(e: egret.TouchEvent): void {
		this.setOpenIndex(e.currentTarget.selectedIndex);
	}

	private setOpenIndex(selectedIndex: number): void {
		switch (selectedIndex) {
			// case 0:
			// 	this.blackMarketPanel.open();
			// 	break;
			case 0:
				this.blackMarketPanel.open();
				// this.itemShopPanel.open();
				break;
			case 1:
				this.itemShopPanel.open();
	
				break;
			case 2:
				this.honorMarketPanel.open();
				break;
		}
		if (this.lastIndex != selectedIndex) {
			this.viewStack.getElementAt(this.lastIndex)['close']();
			this.lastIndex = selectedIndex;
		} else {
			this.tab.selectedIndex = this.viewStack.selectedIndex = selectedIndex;
		}
	}
	private buyToUse() {
		if( !Shop.ins().shopBuyArr ) Shop.ins().shopBuyArr = [];
		for (let i = 0; i < Shop.ins().shopBuyArr.length; i++) {//金砖直接使用
			let tmp:{id:number,count:number} = Shop.ins().shopBuyArr[i];
			UserBag.ins().sendUseItem(tmp.id,tmp.count);
		}
	}
}

ViewManager.ins().reg(ShopWin, LayerManager.UI_Main);