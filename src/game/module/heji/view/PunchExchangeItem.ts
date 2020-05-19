class PunchExchangeItem extends eui.ItemRenderer {
	private goBtn: eui.Button;
	private descLab: eui.Label;
	private nameLab: eui.Label;
	private icon: eui.Image;
	private redPoint: eui.Image;
	private itemIcon0: ItemIcon;
	private count: number = 0;
	private exchangeNum: number = 0;
	private itemConfig: ItemConfig;

	public constructor() {
		super();
		this.skinName = 'PunchExchangeItemSkin';
	}

	public childrenCreated(): void {
		super.childrenCreated();
	
		this.init();
	}


	

	public init() {
		
		this.goBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
			if (this.count < this.exchangeNum) {
				UserTips.ins().showTips("|C:0x35e62d&T:材料数量不足|");
				(<ShopGoodsWarn>ViewManager.ins().open(ShopGoodsWarn)).setData(this.data.exchangeMaterial[0].id == MoneyConst.punch1 ? 909998:909999);
				return;
			}
			if(UserBag.ins().getSurplusCount() < 1){
				UserTips.ins().showTips("背包已满");
				return;
			}
			UserSkill.ins().sendExchangeHejiEquip(this.data.id)
		}, this);

		this.itemIcon0.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onClick, this);

	}

	protected dataChanged(): void {
		let item = GlobalConfig.ItemConfig[this.data.getItem.id];
		let material:RewardData = this.data.exchangeMaterial[0];
		this.exchangeNum = material.count;
		if (material.id == MoneyConst.punch1) {
			this.count = Actor.togeatter1;
		} else {
			this.count = Actor.togeatter2;
		}
		this.icon.source = RewardData.getCurrencyRes(material.id);
		this.redPoint.visible = UserSkill.ins().getPunchExchangeItemRedPoint(this.data.id);

		let str: string = this.data.zsLevel > 0 ? `${this.data.zsLevel}转` : `${this.data.level}级`
		this.nameLab.text = item.name;

		let color: string = (this.count < this.exchangeNum) ? "#F3311E" : "#35E62D";

		this.descLab.textFlow = new egret.HtmlTextParser().parser(`<font color = '${color}'>${this.count}</font><font color = '#9F946D'>/${this.exchangeNum}</font>`);

		this.itemConfig = item;
		this.itemIcon0.setData(item);

		if (this.data.zsLevel > 0) {
			this.goBtn.visible = UserZs.ins().lv >= this.data.zsLevel;
		} else {
			this.goBtn.visible = Actor.level >= this.data.level;
		}
		// this.itemIcon0.data = this.data.getItem;
	}

	public onClick() {
		if (!this.itemConfig)
			return;
		switch (ItemConfig.getType(this.itemConfig)) {
			case 5:
				// ViewManager.ins().open(ItemDetailedWin, 0, this.itemConfig.id, this.count);
				ViewManager.ins().open(HejiEquipTipsWin, {id:this.itemConfig.id}, false,true);
				break;
			default:
				UserTips.ins().showTips("没有找到道具类型提示页");
		}
	}

	public setBtnStatu(): void {

	}
}