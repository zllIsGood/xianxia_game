/**
 *
 * @author hepeiye
 *
 */
class ItemShopPanel extends BaseView {
	private listView: eui.List;

	constructor() {
		super();
		this.name = "道具商城";
		// this.skinName = "ItemShopSkin";
	}

	public childrenCreated(): void{
		this.init();
	}

	public init(): void {

		this.listView.itemRenderer = ItemShopItemRenderer;
	}

	public open(...param: any[]): void {
		this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		this.observe(Shop.ins().postBuyCount,this.refreshList);
		this.updateData();
	}

	public close(...param: any[]): void {
		this.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		this.removeObserve();
	}

	private refreshList() {
		let len = this.listView.dataProvider.length;
		for (let i = 0; i < len; i++) {
			let dataProvider:eui.ArrayCollection = this.listView.dataProvider as eui.ArrayCollection;
			let item = dataProvider.getItemAt(i);
			dataProvider.itemUpdated(item);
		}
	}

	private updateData() {
		let arr = [];
		let dataProvider = GlobalConfig.ItemStoreConfig;
		for (let k in dataProvider) {
			arr.push(dataProvider[k]);
		}
		this.listView.dataProvider = new eui.ArrayCollection(arr);
	}

	private onTap(e: egret.TouchEvent) {
		if (e.target.name == "buy") {
			let goodsID = e.target.parent['goodsID'];
			let shopItem = GlobalConfig.ItemStoreConfig[goodsID];

			if(Shop.ins().shopData.checkBuyGoodsId(goodsID)) {
				ViewManager.ins().open(BuyWin, goodsID);
			}

			// let arr = [goodsID, 1];
		}
	}
}

