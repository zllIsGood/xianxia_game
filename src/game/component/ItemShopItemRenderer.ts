class ItemShopItemRenderer extends BaseItemRender {
	private itemIcon: ItemIcon;
	private textBG: eui.Image;

	private used: eui.Label;
	private itemName: eui.Label;
	private money: eui.Label;
	private num:eui.Label;

	private buyBtn: eui.Button;

	public goodsID;

	constructor() {
		super();
		this.goodsID = 0;

		this.skinName = "ItemShopItem";
		this.itemIcon.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showTip, this);
		this.itemIcon.imgJob.visible = false;
	}

	public dataChanged(): void {
		if (!this.data || Object.keys(this.data).length <= 0 || this.data["null"] != null) return;
		let shopItem: ItemStoreConfig = this.data;
		let itemConfig = GlobalConfig.ItemConfig[shopItem.itemId];
		this.goodsID = shopItem.id;

		let costStr = "";
		if (shopItem.price > 100000) {
			costStr = Math.floor(shopItem.price / 10000) + "万";
		} else {
			costStr = shopItem.price + "";
		}

		this.money.text = costStr;
		this.itemName.text = itemConfig.name;
		this.itemName.textColor = ItemConfig.getQualityColor(itemConfig);
		this.used.text = "（" + shopItem.use + "）";
		this.used.x = this.itemName.x + this.itemName.width;
		// this.textBG.source = BlackMarketItemRenderer.qualityToTextBG[itemConfig.quality];
		if(shopItem.viplv && UserVip.ins().lv < shopItem.viplv) {
			this.num.visible = true;
			this.num.text = `${UserVip.formatLvStr(shopItem.viplv)}可购买`
		} else if (shopItem.vipLimit) {
			let hadBuyItem:ShopHadBuyData = Shop.ins().shopData.getHadBuyCountItem(shopItem.itemId);
			let hadBuyCount = 0;
			if (hadBuyItem) {
				hadBuyCount = hadBuyItem.count;
			}
			let total = shopItem.vipLimit[UserVip.ins().lv];
			this.num.text = `今日可购买${total-hadBuyCount}次`;
			this.num.visible = true;
		} else {
			this.num.visible = false;
		}

		if (this.itemIcon && this.itemIcon.setData) {
			this.itemIcon.setData(itemConfig);
		}
	}

	private showTip() {
		let items = GlobalConfig.ItemStoreConfig;
		let configID;
		for (let k in items) {
			if (items[k].id == this.goodsID) {
				configID = items[k].itemId;
			}
		}

		if (configID == undefined) {
			new Error("竟然没有找到该商品ID");
		}

		let itemConfig = GlobalConfig.ItemConfig[configID];

		ViewManager.ins().open(ItemDetailedWin, 0, itemConfig.id, 1);

	}

}