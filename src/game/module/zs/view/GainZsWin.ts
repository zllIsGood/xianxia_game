/**
 * 获取修为面板
 */
class GainZsWin extends BaseEuiView {

	public closeBtn: eui.Button;
	public closeBtn0: eui.Button;
	public btn0: eui.Button;
	public btn1: eui.Button;
	public btn2: eui.Button;

	private infoTxts: eui.Label[];
	private toDays: eui.Label[];
	private items: ItemBase[];
	private btns: eui.Button[];

	private priceIcon1: PriceIcon;
	private priceIcon2: PriceIcon;

	private vipLb1: eui.Label;
	private vipLb2: eui.Label;

	private colorCanvas: eui.Image;
	private bgClose: eui.Rect;
	private tipsExp: number;
	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "GainZsSkin";

		this.infoTxts = [this['infoTxt0'], this['infoTxt1'], this['infoTxt2']];
		this.toDays = [this['toDay0'], this['toDay1'], this['toDay2']];
		this.items = [this['item0'], this['item1'], this['item2']];
		this.btns = [this['btn0'], this['btn1'], this['btn2']];

		for (let i: number = 0; i < this.items.length; i++) {
			this.items[i].isShowName(false);
		}

		this.priceIcon1.setType(MoneyConst.yuanbao);
		this.priceIcon2.setType(MoneyConst.yuanbao);

		let reward: RewardData = new RewardData();
		reward.type = 0;
		reward.id = 0;
		reward.count = 0;
		this.items[0].data = reward;

		this.isTopLevel = true;
		this.tipsExp = 0;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this, this.onTap);
		this.observe(UserZs.ins().postZsData, this.setData);
		this.observe(Actor.ins().postLevelChange, this.setData);
		this.observe(Shop.ins().postBuyResult, this.setData);
		this.observe(Shop.ins().postBuyCount, this.setData);
		this.setData();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this, this.onTap);
		this.removeObserve();
	}

	private setData(): void {
		let config: ZhuanShengConfig = GlobalConfig.ZhuanShengConfig;
		let lowestLv: number = config.level + 1;
		let lv: number = Math.max(Actor.level, lowestLv);
		let lvConfig: ZhuanShengLevelConfig = GlobalConfig.ZhuanShengLevelConfig[lv];
		let expConfig: ZhuanShengExpConfig = GlobalConfig.ZhuanShengExpConfig[lv];
		let ins: UserZs = UserZs.ins();
		let sCount: number;

		this.toDays[0].textColor = Actor.level < lowestLv ? 0xf3311e : 0xF9AD2A;
		this.infoTxts[0].textFlow = (new egret.HtmlTextParser()).parser(`增加<font color="#9de242">${expConfig.exp}</font>修为\n\n等级兑换：降1级`);
		sCount = config.conversionCount - ins.upgradeCount[0];
		this.toDays[0].textFlow = (new egret.HtmlTextParser()).parser(Actor.level <= 80 ? `大于${lowestLv - 1}级才能兑换` : `今天还可兑换<font color="#9de242">${sCount}</font>次`);
		this.btns[0].enabled = sCount > 0;

		let itemID: number = config.normalItem;
		let itemConfig: ItemConfig = GlobalConfig.ItemConfig[itemID];
		let count: number = UserBag.ins().getItemCountById(0, itemID);
		let itemStoreConfig: ItemStoreConfig = ItemStoreConfig.getStoreByItemID(itemID);
		this.items[1].data = itemID;
		this.btns[1].label = count ? "立即使用" : "购买";
		this.btns[1].name = config.normalExp + "";
		this.priceIcon1.visible = count == 0;
		this.priceIcon1.setPrice(itemStoreConfig.price);
		this.priceIcon1.name = itemConfig.name;
		this.infoTxts[1].textFlow = (new egret.HtmlTextParser()).parser(`增加<font color="#9de242">${config.normalExp}</font>修为\n\n${itemConfig.name}：${count ? `剩余${count}个` : ""}`);
		sCount = config.normalCount - ins.upgradeCount[1];
		this.toDays[1].textFlow = (new egret.HtmlTextParser()).parser(`今天还可兑换<font color="#9de242">${sCount}</font>次`);
		this.btns[1].enabled = sCount > 0;
		if (itemStoreConfig.viplv && UserVip.ins().lv < itemStoreConfig.viplv) {
			this.vipLb1.visible = true;
			this.vipLb1.text = `${UserVip.formatLvStr(itemStoreConfig.viplv)}可购买`
		} else {
			this.vipLb1.visible = false;
		}

		itemID = config.advanceItem;
		itemConfig = GlobalConfig.ItemConfig[itemID];
		count = UserBag.ins().getItemCountById(0, itemID);
		itemStoreConfig = ItemStoreConfig.getStoreByItemID(itemID);
		this.items[2].data = itemID;
		this.btns[2].label = count ? "立即使用" : "购买";
		this.btns[2].name = config.advanceExp + "";
		this.priceIcon2.visible = count == 0;
		this.priceIcon2.setPrice(ItemStoreConfig.getStoreByItemID(itemID).price);
		this.priceIcon2.name = itemConfig.name;
		this.infoTxts[2].textFlow = (new egret.HtmlTextParser()).parser(`增加<font color="#cb5ac4">${config.advanceExp}</font>修为\n\n${itemConfig.name}：${count ? `剩余${count}个` : ""}`);
		sCount = config.advanceCount - ins.upgradeCount[2];
		this.toDays[2].textFlow = (new egret.HtmlTextParser()).parser(`今天还可兑换<font color="#9de242">${sCount}</font>次`);
		this.btns[2].enabled = sCount > 0;
		if (itemStoreConfig.viplv && UserVip.ins().lv < itemStoreConfig.viplv) {
			this.vipLb2.visible = true;
			this.vipLb2.text = `${UserVip.formatLvStr(itemStoreConfig.viplv)}可购买`
		} else {
			this.vipLb2.visible = false;
		}

		let sum: number = ins.canGet();
		for (let i: number = 0; i < 3; i++) {
			this['redPoint' + i].visible = (sum >> i) & 1;
			if (this["redPointRule" + i]) {
				this["redPointRule" + i]();
			}
		}

		lv = Math.max(Actor.level + 1, lowestLv);//前一次升级时候的等级
		expConfig = GlobalConfig.ZhuanShengExpConfig[lv];
		if (UserZs.ins().isSendXW[0]) {
			UserZs.ins().isSendXW[0] = false;
			// UserTips.ins().showTips(`|C:0x23CA23&T:修为+${expConfig.exp}|`);
		} else if (UserZs.ins().isSendXW[1]) {
			UserZs.ins().isSendXW[1] = false;
			// UserTips.ins().showTips(`|C:0x23CA23&T:修为+${config.normalExp}|`);
		} else if (UserZs.ins().isSendXW[2]) {
			UserZs.ins().isSendXW[2] = false;
			// UserTips.ins().showTips(`|C:0x23CA23&T:修为+${config.advanceExp}|`);
		}



	}
	//等级兑换红点规则新增
	private redPointRule0() {
		if (!UserZs.ins().exchange)
			UserZs.ins().exchange = true
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.colorCanvas:
			case this.closeBtn0:
			case this.closeBtn:
			case this.bgClose:
				ViewManager.ins().close(this);
				break;

			default:
				let index: number = this.btns.indexOf(e.target);
				if (index > -1) {
					if (index == 0) {
						UserZs.ins().isSendXW[index] = true;
						UserZs.ins().sendGetXiuWei(index + 1);
					} else if (this.btns[index].label == "立即使用") {
						UserZs.ins().isSendXW[index] = true;
						UserZs.ins().sendGetXiuWei(index + 1);
					} else {
						let price: number = (<PriceIcon>this['priceIcon' + index]).getPrice();
						if (Actor.yb < price) {
							UserTips.ins().showTips("元宝不足");
							ViewManager.ins().close(this);
							return;
						}
						//调用商城的购买道具				
						if (index == 1) {
							let conf = GlobalConfig.ItemStoreConfig;
							for (let k in conf) {
								if (conf[k].itemId == 200009) {
									this.buyGoodsId(conf[k].id);
									return;
								}
							}
						} else if (index == 2) {
							let conf = GlobalConfig.ItemStoreConfig;
							for (let k in conf) {
								if (conf[k].itemId == 200010) {
									this.buyGoodsId(conf[k].id);
									return;
								}
							}
						}
					}
				}
		}
	}

	private buyGoodsId(id) {
		if (Shop.ins().shopData.checkBuyGoodsId(id)) {
			ViewManager.ins().open(BuyWin, id);
		}
	}
}

ViewManager.ins().reg(GainZsWin, LayerManager.UI_Popup);