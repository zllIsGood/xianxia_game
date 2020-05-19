/**
 * 道具获取框
 */
class ShopGoodsWarn extends BaseEuiView {

	private bgGroup: eui.Group;
	private frame: eui.Image;
	// private body: eui.Image;
	private titleTxt: eui.Label;
	private goodsGroup: eui.Group;
	private itemIcon: ItemIcon;
	private price: PriceIcon;
	private nameTxt: eui.Label;
	private decBtn: eui.Button;
	private addBtn: eui.Button;
	private dec10Btn: eui.Button;
	private add10Btn: eui.Button;
	private countTxt: eui.TextInput;
	private totalPrice: PriceIcon;
	private buyBtn: eui.Button;
	private topUpBtn: eui.Button;
	private listGroup: eui.Group;
	private gainList: eui.List;
	public itemInfoBg: eui.Image;

	private _goodsId: number;
	private _totalNum: number;
	private bgClose: eui.Rect;
	private gainListGroup: eui.Group;
	private tipGroup: eui.Group;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "GainGoodsSkin";
		this.gainList.itemRenderer = GainGoodsItem;
		this.countTxt.restrict = "0-9";
		this.price.setType(MoneyConst.yuanbao);
		this.totalPrice.setType(MoneyConst.yuanbao);
		this.itemIcon.imgJob.visible = false;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.decBtn, this.onTap);
		this.addTouchEvent(this.addBtn, this.onTap);
		this.addTouchEvent(this.dec10Btn, this.onTap);
		this.addTouchEvent(this.add10Btn, this.onTap);
		this.addTouchEvent(this.buyBtn, this.onTap);
		this.addTouchEvent(this.topUpBtn, this.onTap);
		this.addTouchEvent(this.bgClose, this.onTap);
		this.gainList.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTouchList, this);
		this.addChangeEvent(this.countTxt, this.onTxtChange);

		this.observe(Shop.ins().postBuyResult, this.buyCallBack);
		this.topUpBtn.visible = WxTool.shouldRecharge();
	}

	public close(...param: any[]): void {
		this.gainList.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTouchList, this);
		this.removeTouchEvent(this.decBtn, this.onTap);
		this.removeTouchEvent(this.addBtn, this.onTap);
		this.removeTouchEvent(this.dec10Btn, this.onTap);
		this.removeTouchEvent(this.add10Btn, this.onTap);
		this.removeTouchEvent(this.buyBtn, this.onTap);
		this.removeTouchEvent(this.topUpBtn, this.onTap);
		this.removeTouchEvent(this.bgClose, this.onTap);
		this.countTxt.removeEventListener(egret.TouchEvent.CHANGE, this.onTxtChange, this);
	}

	public onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.decBtn:
				this.setTotalPrice(this._totalNum - 1);
				break;
			case this.addBtn:
				this.setTotalPrice(this._totalNum + 1);
				break;
			case this.dec10Btn:
				this.setTotalPrice(this._totalNum - 10);
				break;
			case this.add10Btn:
				this.setTotalPrice(this._totalNum + 10);
				break;
			case this.buyBtn:
				if (Actor.yb >= this.totalPrice.getPrice()) {
					Shop.ins().sendBuy(1, [[this._goodsId, this._totalNum]]);
				}
				else {
					if(WxTool.shouldRecharge()) {
						UserTips.ins().showTips(`|C:0xf3311e&T:元宝不足|`);
						ViewManager.ins().close(this);
					} else {
						UserTips.ins().showTips(`|C:0xf3311e&T:元宝不足!|`);
					}
				}
				break;
			case this.topUpBtn:
				if(WxTool.shouldRecharge()) {
					let rdata: RechargeData = Recharge.ins().getRechargeData(0);
					if (!rdata || rdata.num != 2) {
						ViewManager.ins().close(ShopGoodsWarn);
						ViewManager.ins().open(Recharge1Win);
					} else {
						ViewManager.ins().open(ChargeFirstWin);
					}
				}
				break;
			case this.bgClose:
				ViewManager.ins().close(ShopGoodsWarn);
				break;
		}
	}

	private onTouchList(e: eui.ItemTapEvent): void {
		let item: Array<any> = e.item;
		if (e.item == null) {
			return;
		}
		let openSuccess: boolean = ViewManager.ins().viewOpenCheck(item[1], item[2]);
		if (openSuccess) {
			// ViewManager.ins().closeTopLevel();
			// if( item[1] != "TreasureHuntWin" && item[2] == 2){//诛仙寻宝
			// 	if( !Heirloom.ins().isHeirloomHuntOpen() ){
			// 		UserTips.ins().showTips(`开服第${GlobalConfig.HeirloomTreasureConfig.openDay+1}天达到${GlobalConfig.HeirloomTreasureConfig.openZSlevel}转后方可参与`);
			// 		return;
			// 	}
			// }
			let isShow: boolean = true;
			if (item[1] == "Recharge2Win") {
				let rdata: RechargeData = Recharge.ins().getRechargeData(0);
				if (!rdata || !rdata.num) {//首冲
					isShow = false;
					ViewManager.ins().open(Recharge1Win);
				}
			}
			if (isShow)
				GameGuider.guidance(item[1], item[2], item[3]);
			ViewManager.ins().close(ShopGoodsWarn);
			ViewManager.ins().close(BookUpWin);
			ViewManager.ins().close(WeaponPanel);
			ViewManager.ins().close(WeaponSoulBreakWin);
			if (item[1] != "HeirloomCom")
				ViewManager.ins().close(HeirloomCom);
			if (item[1] == "LadderWin")
				ViewManager.ins().close(ForgeWin);
			if (item[1] == "PlayFunView") {
				ViewManager.ins().close(ShopWin);
			}

		}
	}

	private buyCallBack(num: number): void {
		if (num > 0) {
			ViewManager.ins().close(ShopGoodsWarn);
		} else {
			UserTips.ins().showTips(`|C:0xf3311e&T:元宝不足|`);
			ViewManager.ins().close(this);
		}
	}

	private onTxtChange(e: egret.Event): void {
		let num = Number(this.countTxt.text);
		this.setTotalPrice(num);
	}

	public setData(id: number, num?: number): void {
		let shopConfig: ItemStoreConfig;
		if (id > 20000) {

			let itemConfig: ItemConfig = GlobalConfig.ItemConfig[id];
			this.itemIcon.setData(itemConfig);
			this.nameTxt.text = "" + itemConfig.name;
			this.nameTxt.textColor = ItemConfig.getQualityColor(itemConfig);
			shopConfig = ItemStoreConfig.getStoreByItemID(id);
			this.titleTxt.text = `材料不足，通过以下方式获得`;
		} else {
			this.itemIcon.setData(null);
			switch (id) {
				//金币
				case MoneyConst.gold:
					this.itemIcon.imgIcon.source = RewardData.CURRENCY_RES[id];
					this.nameTxt.text = RewardData.CURRENCY_NAME[id];
					this.titleTxt.text = `货币不足，通过以下方式获得`;
					break;
				//魂值
				case MoneyConst.soul:
					this.itemIcon.imgIcon.source = RewardData.CURRENCY_RES[id];
					this.nameTxt.text = RewardData.CURRENCY_NAME[id];
					this.titleTxt.text = `精华不足，通过以下方式获得`;
					break;
				case 7:
					this.itemIcon.imgIcon.source = RewardData.CURRENCY_RES[id];
					this.nameTxt.text = RewardData.CURRENCY_NAME[id];
					this.titleTxt.text = `功勋不足，通过以下方式获得`;
					break;
				case 8:
					this.itemIcon.imgIcon.source = RewardData.CURRENCY_RES[id];
					this.nameTxt.text = RewardData.CURRENCY_NAME[id];
					this.titleTxt.text = `成就积分不足，通过以下方式获得`;
					break;
				case MoneyConst.weiWang: //威望
					this.itemIcon.imgIcon.source = RewardData.CURRENCY_RES[id];
					this.nameTxt.text = RewardData.CURRENCY_NAME[id];
					this.titleTxt.text = `威望不足，通过以下方式获得`;
					break;
			}
			this.nameTxt.textColor = 0xFFB82A;
		}


		let gainConfig: GainItemConfig = GlobalConfig.GainItemConfig[id];
		let listHeight: number = 0;
		if (gainConfig) {
			this.gainList.dataProvider = new eui.ArrayCollection(gainConfig.gainWay);
			listHeight = gainConfig.gainWay.length * 60;
		} else {
			this.gainList.dataProvider = new eui.ArrayCollection([]);
		}


		if (shopConfig) {
			this.itemInfoBg.height = 300;
			this.goodsGroup.visible = true;
			this.nameTxt.x = 225;
			this.nameTxt.y = 155;
			this.nameTxt.textAlign = "center";
			this.itemIcon.x = 145;
			// this.frame.height = 410 + listHeight;
			this.gainListGroup.y = 352;
			this._goodsId = shopConfig.id;
			this.price.setPrice(shopConfig.price);
			this.setTotalPrice(num);
		} else {
			this.itemInfoBg.height = 230;
			this.goodsGroup.visible = false;
			this.nameTxt.x = 182;
			this.nameTxt.y = 155;
			this.nameTxt.textAlign = "center";
			this.itemIcon.x = 172;
			// this.frame.height = 340 + listHeight;
			this.gainListGroup.y = 280;
		}
		this.tipGroup.y = this.gainListGroup.height + this.gainListGroup.y + 3;
	}

	private setTotalPrice(num: number): void {
		if (num <= 0)
			this._totalNum = 1;
		else if (num >= 10000)
			this._totalNum = 9999;
		else
			this._totalNum = num;
		this.countTxt.text = this._totalNum + "";
		this.totalPrice.setPrice(this._totalNum * this.price.getPrice());
	}
}

ViewManager.ins().reg(ShopGoodsWarn, LayerManager.UI_Popup);
