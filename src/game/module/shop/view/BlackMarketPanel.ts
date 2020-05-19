/**
 *
 * @author hepeiye
 *
 */
class BlackMarketPanel extends BaseComponent {

	private buyAllItemBtn: eui.Button;
	private refreshShopBtn: eui.Button;
	private tipsBg:eui.Image;
	private tip: eui.Label;
	private noGoods: eui.Label;
	public price: eui.Label;
	public point: eui.Label;


	private listView: eui.List;
	private keylabel:eui.Label;
	private costGroup:eui.Group;
	private redPoint:eui.Image;
	private goodsOverView:eui.Label;
	constructor() {
		super();
		this.name = "神秘商店";
		// this.skinName = "BlackMarketSkin";
	}

	public childrenCreated(): void {
		this.init();
	}

	public init(): void {

	}

	public open(...param: any[]): void {
		this.listView.itemRenderer = BlackMarketItemRenderer;

		this.addTouchEvent(this, this.onTap);
		this.addTouchEvent(this.buyAllItemBtn, this.buyAllItem);
		this.addTouchEvent(this.refreshShopBtn, this.refreshShop);
		this.addTouchEvent(this.goodsOverView, this.onClick);
		this.observe(Shop.ins().postUpdateShopData, this.updateData);
		this.observe(Shop.ins().postBuyResult, this.buyResultCB);
		this.observe(ShopRedPoint.ins().postBlackMarketRedPoint,this.updateRedPoint);

		this.price.text = GlobalConfig.StoreCommonConfig.refreshYuanBao + "";
		let text = this.goodsOverView.text;
		this.goodsOverView.textFlow = TextFlowMaker.generateTextFlow1(`|U:&T:${text}`);
		this.updateData();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.buyAllItemBtn, this.buyAllItem);
		this.removeTouchEvent(this.refreshShopBtn, this.refreshShop);
		this.removeTouchEvent(this, this.onTap);
		this.removeTouchEvent(this.goodsOverView, this.onClick);
		this.removeObserve();

		TimerManager.ins().removeAll(this);
	}
	private onClick(e: egret.TouchEvent){
		switch (e.currentTarget){
			case this.goodsOverView:
				ViewManager.ins().open(ShopBestTips);
				break;
		}

	}
	private updateRedPoint(){
		this.redPoint.visible = ShopRedPoint.ins().blackMarketRedPoint;
	}

	private buyAllItem(e: egret.TouchEvent) {
		let arr = [];  //0:id, 1:num
		let allGold = 0;
		let allYb = 0;
		let bagNum: number = 0;
		let shopData: ShopData = Shop.ins().shopData;
		let len: number = shopData.getShopEquipDataLength();
		let sed: ShopEquipData = null;
		let point: number = 0;
		for (let i: number = 0; i < len; i++) {
			sed = shopData.getShopEquipDataByIndex(i);
			if (sed != null) {
				if (ItemConfig.getType(sed.item.itemConfig) == 0) {
					point = UserBag.ins().calculationScore(sed.item);
					if (point > 0) {
						bagNum += 1;
					}
					else {
						continue;
					}
				}

				arr.push([sed.id, 1]);
				if (sed.costType == 1) {
					allGold += sed.costNum;
				}
				else {
					allYb += sed.costNum;
				}
			}
		}

		if (UserBag.ins().getSurplusCount() < bagNum) {
			let strTips: string = "背包已满，无法全部购买";
			UserTips.ins().showTips(strTips);
			return;
		}

		if (Actor.gold < allGold) {
			UserWarn.ins().setBuyGoodsWarn(1);
			return;
		}

		if (Actor.yb < allYb) {
			UserTips.ins().showTips("|C:0xf3311e&T:元宝不足|");
			return;
		}

		if (allGold == 0 && allYb == 0) {
			UserTips.ins().showTips("|C:0xf3311e&T:没有物品可买！|");
			return;
		}

		Shop.ins().sendBuy(2, arr);
	}

	private refreshShop(e: egret.TouchEvent) {
		if (Shop.ins().shopData.times > GlobalConfig.StoreCommonConfig.refreshLimit) {
			UserTips.ins().showTips("|C:0xf3311e&T:今日刷新次数已用完！|");
			return;
		}
		if( Shop.ins().shopData.refushTime <= 0 ){//免费刷新
			Shop.ins().sendRefreshShop();
		}else{
			let itemData:ItemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_OTHTER,GlobalConfig.StoreCommonConfig.refreshItem);
			let num:number = itemData?itemData.count:0;
			if( num ){
				Shop.ins().sendRefreshShop();
			}else{
				if (Actor.yb < GlobalConfig.StoreCommonConfig.refreshYuanBao) {
					UserTips.ins().showTips("|C:0xf3311e&T:元宝不足|");
					return;
				}
				Shop.ins().sendRefreshShop();
			}
		}

	}

	private onTap(e: egret.TouchEvent) {
		if (e.target.name == "buy") {
			if (UserBag.ins().getSurplusCount() <= 0) {
				let strTips: string = "背包已满，无法购买";
				UserTips.ins().showTips(strTips);
				return;
			}

			let goodsID = e.target.parent['goodsID'];
			let sed: ShopEquipData = Shop.ins().shopData.getShopEquipDataById(goodsID);
			if(Assert(sed, `神秘商店找不到物品：${goodsID}`)) {
				return;
			}
			if (sed.costType == 1) {
				if (Actor.gold < sed.costNum) {
					UserWarn.ins().setBuyGoodsWarn(1);
					return;
				}
			} else {
				if (Actor.yb < sed.costNum) {
					UserTips.ins().showTips("|C:0xf3311e&T:元宝不足|");
					return;
				}
			}

			let item: ItemData = sed.item;
			let job = ItemConfig.getJob(item.itemConfig);
			let type = ItemConfig.getType(item.itemConfig);
			if (type == 0 && job != 0) {
				let point: number = UserBag.ins().calculationScore(item);
				if (point > 0) {
					let arr = [goodsID, 1];
					Shop.ins().sendBuy(2, [arr]);
				} else {
					WarnWin.show("购买失败\n\n<font color='#f3311e'>该装备评分过低无法购买</font>", () => {
					}, this, null, null, "sure");
				}
			} else {
				let arr = [goodsID, 1];
				Shop.ins().sendBuy(2, [arr]);
			}

		}
	}

	private buyResultCB(result) {
		if (result == 1) {
			UserTips.ins().showTips("购买成功");
		} else {
			UserTips.ins().showTips("|C:0xf3311e&T:购买失败|");
		}
		this.updateOthersUI();
	}
	private updateOthersUI(){
		let itemData:ItemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_OTHTER,GlobalConfig.StoreCommonConfig.refreshItem);
		let num:number = itemData?itemData.count:0;
		let colorStr: string = "";
		if( num ){
			colorStr = ColorUtil.GREEN_COLOR;
		}else{
			colorStr = ColorUtil.RED_COLOR;
		}
		this.keylabel.textFlow = TextFlowMaker.generateTextFlow(`<font color=${colorStr}>${num}</font> `);
		if( Shop.ins().shopData.refushTime <= 0 )
			this.refreshShopBtn.label = "免费刷新";
		else
			this.refreshShopBtn.label = "刷   新";

	}

	private updateData() {
		let arr = [];
		let shopData: ShopData = Shop.ins().shopData;
		let len: number = shopData.getShopEquipDataLength();
		let sed: ShopEquipData = null;
		for (let i: number = 0; i < len; i++) {
			sed = shopData.getShopEquipDataByIndex(i);
			if (sed != null) {
				arr.push(sed);
			}
		}
		this.listView.dataProvider = new eui.ArrayCollection(arr);

		if (!TimerManager.ins().isExists(this.refushEndTime, this)) {
			TimerManager.ins().doTimer(1000, Shop.ins().shopData.refushTime, this.refushEndTime, this);
			this.refushEndTime();
		}
		if (arr.length <= 0) {
			this.noGoods.visible = true;
		} else {
			this.noGoods.visible = false;
		}

		this.point.text = "我的积分：" + Shop.ins().shopData.point;
		this.updateOthersUI();
		this.updateRedPoint();
	}

	private refushEndTime(): void {
		this.tip.text = "下批商品刷新时间：" + DateUtils.getFormatBySecond(Shop.ins().shopData.refushTime);
		this.tipsBg.visible = this.tip.visible = this.costGroup.visible = true;
		if( Shop.ins().shopData.refushTime <= 0 ){
			// this.tip.text = "免费刷新";
			this.tipsBg.visible = this.tip.visible = this.costGroup.visible = false;
		}
	}
}

ViewManager.ins().reg(BlackMarketPanel, LayerManager.UI_Main);
