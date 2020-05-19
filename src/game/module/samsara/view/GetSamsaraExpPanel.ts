/**
 * 获取轮回经验界面
 * Created by Peach.T on 2017/11/27.
 */
class GetSamsaraExpPanel extends BaseEuiView {
	public bgClose: eui.Rect;
	public anigroup: eui.Group;
	public bg: eui.Image;
	public bgt: eui.Image;
	public closeBtn: eui.Button;
	public priceIcon0: PriceIcon;
	public gr1: eui.Group;
	public yeli0: eui.Label;
	public cost0: eui.Label;
	public yeli4: eui.Label;
	public time0: eui.Group;
	public toDay0: eui.Label;
	public btn0: eui.Button;
	public item0: ItemBase;
	public redPoint0: eui.Image;
	public gr2: eui.Group;
	public yeli1: eui.Label;
	public name1: eui.Label;
	public toDay1: eui.Label;
	public btn1: eui.Button;
	public item1: ItemBase;
	public priceIcon1: PriceIcon;
	public redPoint1: eui.Image;
	public gr3: eui.Group;
	public yeli2: eui.Label;
	public toDay2: eui.Label;
	public name2: eui.Label;
	public btn2: eui.Button;
	public item2: ItemBase;
	public priceIcon2: PriceIcon;
	public redPoint2: eui.Image;
	public priceIcon3: PriceIcon;
	public limit: eui.Label;

	public lastYeli: number;

	constructor() {
		super();
		this.isTopLevel = true;
		this.skinName = "GainYeLiSkin";
	}

	public open(...param: any[]): void {
		this.redPoint1.visible = false;
		this.redPoint2.visible = false;
		let reward: RewardData = new RewardData();
		reward.type = 0;
		reward.id = 0;
		reward.count = 0;
		this.item0.data = reward;
		this.item0.isShowName(false);
		this.item1.isShowName(false);
		this.item2.isShowName(false);

		this.addTouchEvent(this.bgClose, this.closeWin);
		this.addTouchEvent(this.btn0, this.expUpgrade);
		this.addTouchEvent(this.btn1, this.normalUpgrade);
		this.addTouchEvent(this.btn2, this.advanceUpgrade);

		this.observe(SamsaraCC.ins().postSamsaraInfo, this.updateView);
		this.observe(Shop.ins().postBuyResult, this.updateView);
		this.observe(Shop.ins().postBuyCount, this.updateView);
		this.updateView();
	}

	private expUpgrade(): void {
		if (this.btn0.enabled){
			if(Actor.level >= GlobalConfig.ReincarnationBase.levelLimit)
			{
				this.lastYeli = SamsaraModel.ins().samsaraInfo.exp;
				SamsaraCC.ins().exchangeSamsaraExp(SamsaraUpgradeType.level);
			}
			else {
				UserTips.ins().showTips(`等级达到${GlobalConfig.ReincarnationBase.levelLimit}级可以兑换`);
			}
		}
	}

	private normalUpgrade(): void {
		if (this.btn1.label == "购买") {
			this.buy(1, GlobalConfig.ReincarnationBase.normalItem.id);
		} else {
			this.lastYeli = SamsaraModel.ins().samsaraInfo.exp;
			SamsaraCC.ins().exchangeSamsaraExp(SamsaraUpgradeType.normal);
		}
	}

	private advanceUpgrade(): void {
		if (this.btn2.label == "购买") {
			this.buy(2, GlobalConfig.ReincarnationBase.advanceItem.id);
		} else {
			this.lastYeli = SamsaraModel.ins().samsaraInfo.exp;
			SamsaraCC.ins().exchangeSamsaraExp(SamsaraUpgradeType.advanced);
		}
	}

	private buy(index: number, id: number): void {
		let price: number = (<PriceIcon>this['priceIcon' + index]).getPrice();
		if (Actor.yb < price) {
			UserTips.ins().showTips("元宝不足");
			ViewManager.ins().close(this);
		}
		else {
			let conf = CommonUtils.getObjectByAttr(GlobalConfig.ItemStoreConfig, "itemId", id);
			this.buyGoods(conf.id);
		}
	}

	private buyGoods(id): void {
		if (Shop.ins().shopData.checkBuyGoodsId(id)) {
			ViewManager.ins().open(BuyWin, id);
		}
	}

	protected closeWin(): void {
		ViewManager.ins().close(this);
	}

	private updateView(): void {
		if(this.lastYeli != undefined && (SamsaraModel.ins().samsaraInfo.exp - this.lastYeli) > 0){
			UserTips.ins().showTips(`|C:0x00ff00&T:获得业力${SamsaraModel.ins().samsaraInfo.exp - this.lastYeli}|`);
			this.lastYeli = SamsaraModel.ins().samsaraInfo.exp;
		}
		if (Actor.level >= GlobalConfig.ReincarnationBase.levelLimit) {
			let cfg = GlobalConfig.ReincarnationExchange[Actor.level];
			this.yeli0.text = cfg.value.toString();
			this.redPoint0.visible = (SamsaraModel.ins().getExpExchangeTimes() > 0);
			this.btn0.enabled = (SamsaraModel.ins().getExpExchangeTimes() > 0);
			this.limit.visible = false;
		} else {
			this.yeli0.text = GlobalConfig.ReincarnationExchange[GlobalConfig.ReincarnationBase.levelLimit].value.toString();
			this.redPoint0.visible = false;
			this.limit.visible = true;
		}
		this.toDay0.text = SamsaraModel.ins().getExpExchangeTimes().toString();
		this.updateItem(GlobalConfig.ReincarnationBase.normalItem, 1, SamsaraModel.ins().getNormalExchangeTimes());
		this.updateItem(GlobalConfig.ReincarnationBase.advanceItem, 2, SamsaraModel.ins().getAdvancedExchangeTimes());
	}

	private updateItem(vo: ExchangeVO, index: number, times: number): void {
		let itemCfg = GlobalConfig.ItemConfig[vo.id];
		this[`item${index}`].data = vo.id;
		this[`toDay${index}`].text = times.toString();
		if (times > 0) {
			this[`toDay${index}`].textColor = 0x00ff00;
		}
		else {
			this[`toDay${index}`].textColor = 0xff0000;
		}
		this[`yeli${index}`].text = vo.value.toString();
		let count = UserBag.ins().getItemCountById(0, vo.id);
		if (count > 0) {
			this[`name${index}`].text = `${itemCfg.name} 剩余：${count}个`;
			this[`priceIcon${index}`].visible = false;
			this[`redPoint${index}`].visible = times > 0;
			this[`btn${index}`].label = "立即使用";
		} else {
			this[`name${index}`].text = itemCfg.name;
			this[`priceIcon${index}`].visible = true;
			this[`priceIcon${index}`].setPrice(CommonUtils.getObjectByAttr(GlobalConfig.ItemStoreConfig, "itemId", vo.id).price);
			this[`redPoint${index}`].visible = false;
			this[`btn${index}`].label = "购买";
		}
	}
}
ViewManager.ins().reg(GetSamsaraExpPanel, LayerManager.UI_Popup);