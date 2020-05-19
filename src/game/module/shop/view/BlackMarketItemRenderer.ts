class BlackMarketItemRenderer extends BaseItemRender {
	private itemIcon: ItemIcon;
	private moneyIcon: eui.Image;
	private arrowIcon: eui.Image;
	private discount: eui.Image;
	private textBG: eui.Image;

	private level: eui.Label;
	private itemName: eui.Label;
	private money: eui.Label;
	private num: eui.Label;

	private CEKey: eui.Label;
	private CEValue: eui.Label;

	private buyBtn: eui.Button;

	public goodsID;
	private wuzhe: eui.Image;
	static moneyTypeToIcon = [
		"占位",
		"com_currency01",
		"com_currency02",
	];

	// static discountTypeToIcon = [
	// 	"",
	// 	"shop_json.shop_12",
	// 	"shop_json.shop_11",
	// ];

	// static jobTypeToIcon = [
	// 	"",
	// 	"job1Item",
	// 	"job2Item",
	// 	"job3Item",
	// ];

	// static qualityToTextBG = [
	// 	"shop_02",
	// 	"shop_07",
	// 	"shop_06",
	// 	"shop_10",
	// 	"shop_03",
	// 	"shop_05",
	// ];

	constructor() {
		super();
		this.goodsID = 0;

		this.skinName = "BlackMarketItem";
		this.itemIcon.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showTip, this);
	}

	public dataChanged(): void {
		let shopItem: ShopEquipData = this.data;
		let itemData = shopItem.item;
		let itemConfig = GlobalConfig.ItemConfig[itemData.configID];
		this.goodsID = shopItem.id;

		let costStr = "";
		if (shopItem.costType == 2) {//元宝显示全部
			costStr = shopItem.costNum + "";
		} else if (shopItem.costNum > 100000) {
			costStr = Math.floor(shopItem.costNum / 10000) + "万";
		} else {
			costStr = shopItem.costNum + "";
		}

		this.money.text = costStr;
		this.itemName.text = itemConfig.name;
		this.itemName.textColor = ItemConfig.getQualityColor(itemConfig);
		if (itemConfig.zsLevel && itemConfig.zsLevel > 0) {
			this.level.text = "(" + itemConfig.zsLevel + "转)";
		} else if (itemConfig.level && itemConfig.level > 0) {
			this.level.text = "(Lv." + itemConfig.level + ")";
		} else
			this.level.text = "";

		this.level.x = this.itemName.x + this.itemName.width;
		this.num.text = (itemData.count == 1 ? "" : itemData.count + "");
		this.moneyIcon.source = BlackMarketItemRenderer.moneyTypeToIcon[shopItem.costType];
		// this.discountIcon.source = BlackMarketItemRenderer.discountTypeToIcon[shopItem.discountType];
		// this.textBG.source = BlackMarketItemRenderer.qualityToTextBG[itemConfig.quality];

		this.itemIcon.setData(itemConfig);
		// this.itemIcon.imgJob.source = BlackMarketItemRenderer.jobTypeToIcon[itemConfig.job];

		if (ItemConfig.getJob(itemConfig) != 0) {
			let ceGap = UserBag.ins().calculationScore(shopItem.item);
			if (ceGap > 0) {
				this.arrowIcon.visible = true;
				this.CEKey.visible = true;
				this.CEValue.visible = true;
				this.CEValue.text = ceGap + "";
			} else {
				this.arrowIcon.visible = false;
				this.CEKey.visible = false;
				this.CEValue.visible = false;
			}
		} else {
			this.arrowIcon.visible = false;
			this.CEKey.visible = false;
			this.CEValue.visible = false;
		}

		let dic = ShopEquipData.discountDic[shopItem.discountType];
		if (dic) {
			this.discount.source = dic.res;
			this.wuzhe.visible = false;//极品预览 不需要推荐
			// //5折
			// if( dic.discount == 0.5 ){
			// 	let eqcfg:EquipConfig = GlobalConfig.EquipConfig[shopItem.item._configID];
			// 	if( eqcfg ){
			// 		if( this.CEValue.visible )
			// 			this.wuzhe.visible = true;//装备 评分提升有推荐
			// 		else
			// 			this.wuzhe.visible = false;
			// 	}
			// 	else
			// 		this.wuzhe.visible = true;//非装备全推荐
			//
			// }else{
			// 	this.wuzhe.visible = false;
			// }
		} else {
			let eqcfg: EquipItemConfig = GlobalConfig.EquipItemConfig[this.goodsID];
			this.discount.source = eqcfg.discountImg;
			this.wuzhe.visible = false;
		}
	}

	private showTip() {
		let configID;
		let shopData: ShopData = Shop.ins().shopData;
		let len: number = shopData.getShopEquipDataLength();
		let sed: ShopEquipData = null;
		for (let i: number = 0; i < len; i++) {
			sed = shopData.getShopEquipDataByIndex(i);
			if (sed != null) {
				if (sed.id == this.goodsID) {
					configID = sed.item.configID;
					break;
				}
			}
		}

		if (configID == undefined) {
			new Error("竟然没有找到该商品ID");
		}

		let itemConfig = GlobalConfig.ItemConfig[configID];
		let type = ItemConfig.getType(itemConfig);
		if (type != undefined) {
			if (type == 0) {
				ViewManager.ins().open(EquipDetailedWin, 1, this.data.item.handle, itemConfig.id);
			} else {
				ViewManager.ins().open(ItemDetailedWin, 0, itemConfig.id, this.data.item.count);
			}
		}
	}

}