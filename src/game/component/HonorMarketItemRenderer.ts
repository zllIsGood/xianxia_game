class HonorMarketItemRenderer extends BaseItemRender {
	private itemIcon: ItemIcon;
	private textBG: eui.Image;

	private itemName: eui.Label;
	private money: eui.Label;
	private num:eui.Label;

	private buyBtn: eui.Button;

	public goodsID;
	private myTimes:eui.Label;
	private usage:eui.Label;
	constructor() {
		super();
		this.goodsID = 0;

		this.skinName = "HonorMarketItemSkin";
		this.buyBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onClick, this);
		this.itemIcon.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showTip, this);
		this.itemIcon.imgJob.visible = false;
	}
	private isShowTips:boolean;
	public dataChanged(): void {
		let shopItem: FeatsStore = this.data;
		if( !shopItem || !(shopItem instanceof FeatsStore) )return;
		let itemConfig = GlobalConfig.ItemConfig[shopItem.id];
		if( !itemConfig )return;
		this.isShowTips = false;
		this.goodsID = shopItem.id;

		this.money.text = shopItem.feats + "";
		this.itemName.text = itemConfig.name;
		this.itemName.textColor = ItemConfig.getQualityColor(itemConfig);
		this.num.text = shopItem.count + "";

		// this.textBG.source = BlackMarketItemRenderer.qualityToTextBG[itemConfig.quality];
		// this.myTimes.textFlow = TextFlowMaker.generateTextFlow1()

		if (this.itemIcon && this.itemIcon.setData) {
			this.itemIcon.setData(itemConfig);
		}
		this.usage.text = `（${shopItem.use}）`;

		if( shopItem.type == FEATS_TYPE.forever ){
			this.myTimes.visible = true;
			//永久限购
			let myCount:number = Shop.ins().medalData.exchangeCount[shopItem.index];
			myCount = myCount?myCount:0;
			let textcolor = this.myTimes.textColor;
			let colorStr: number;
			let str:string = "";
			if( myCount >= shopItem.daycount ){
				colorStr = ColorUtil.RED;
				str = `永久限购:|C:${colorStr}&T:${myCount}/${shopItem.daycount}`;
			}
			else{
				colorStr = ColorUtil.GREEN;
				str = `永久限购:|C:${colorStr}&T:${myCount}|/|C:${textcolor}&T:${shopItem.daycount}`;
			}
			this.myTimes.textFlow = TextFlowMaker.generateTextFlow1(str);
		}else if( shopItem.type == FEATS_TYPE.infinite ){
			//不限次数
			this.myTimes.visible = false;

		}else if( shopItem.type == FEATS_TYPE.day ){
			this.myTimes.visible = true;
			//每日限购
			let myCount:number = Shop.ins().medalData.exchangeCount[shopItem.index];
			myCount = myCount?myCount:0;
			let textcolor = this.myTimes.textColor;
			let colorStr: number;
			let str:string = "";
			if( myCount >= shopItem.daycount ){
				colorStr = ColorUtil.RED;
				str = `每日限购:|C:${colorStr}&T:${myCount}/${shopItem.daycount}`;
				this.isShowTips = true;
			}
			else{
				colorStr = ColorUtil.GREEN;
				str = `每日限购:|C:${colorStr}&T:${myCount}|/|C:${textcolor}&T:${shopItem.daycount}`;
			}
			this.myTimes.textFlow = TextFlowMaker.generateTextFlow1(str);

		}

	}
	private onClick(){
		if( this.isShowTips ){
			UserTips.ins().showTips(`|C:${0xff0000}&T:今日已无兑换次数，请明日再来`);
			return;
		}
		ViewManager.ins().open(BuyWin, this.data.index,2);//2代表区分功勋商店
	}
	private showTip() {
		let items = GlobalConfig.FeatsStore;
		let configID;
		for (let k in items) {
			if (items[k].id == this.goodsID) {
				configID = items[k].id;
			}
		}

		if (configID == undefined) {
			new Error("竟然没有找到该商品ID");
		}

		let itemConfig = GlobalConfig.ItemConfig[configID];
		let shopItem: FeatsStore = this.data;
		ViewManager.ins().open(ItemDetailedWin, 0, itemConfig.id, shopItem.count);

	}

}