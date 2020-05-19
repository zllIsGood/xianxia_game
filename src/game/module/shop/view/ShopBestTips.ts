/**
 * 商城极品预览
 */
class ShopBestTips extends BaseEuiView {
	private shopList:eui.List;
	private bgClose:eui.Rect;
	constructor() {
		super();
		this.skinName = "GoodsOverViewSkin";

	}

	public initUI(): void {
		super.initUI();
		this.shopList.itemRenderer = ItemBase;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.bgClose,this.onClick);
		let items = [];
		for( let k in GlobalConfig.TreasureOverViewConfig ){
			items.push(GlobalConfig.TreasureOverViewConfig[k].itemId);
		}
		this.shopList.dataProvider = new eui.ArrayCollection(items);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.bgClose, this.onClick);
	}

	private onClick(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
		}
	}

}

ViewManager.ins().reg(ShopBestTips, LayerManager.UI_Popup);