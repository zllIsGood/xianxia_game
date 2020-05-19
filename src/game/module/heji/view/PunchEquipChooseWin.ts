class PunchEquipChooseWin extends BaseEuiView {

	// public closeBtn0: eui.Button;
	public list: eui.List;
	public scroll: eui.Scroller;

	private wearItem: PunchEquipListItem;
	private itemList: ItemData[] = [];
	private pos: number = 0;
	private itemGroup: eui.Group;
	private bgClose: eui.Image;
	public initUI(): void {
		super.initUI();
		this.isTopLevel = true;
		this.skinName = "PunchEquipChangeSkin";
		this.list.itemRenderer = PunchEquipListItem;
		this.wearItem = new PunchEquipListItem();
		// this.wearItem.x = 74;
		// this.wearItem.y = 180;
		this.itemGroup.addChild(this.wearItem);
	}

	public open(...param: any[]): void {
		this.pos = param[0];
		let wear: number = param[1];
		let data: ItemData = UserSkill.ins().equipListData[this.pos];
		this.wearItem.data = data;
		this.wearItem.setBtnStatu();
		this.itemList = UserBag.ins().getHejiEquipsByType(this.pos);
		this.list.dataProvider = new eui.ArrayCollection(this.itemList);
		// this.closeBtn0.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		this.list.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.itemTap, this);
		this.addTouchEvent(this.bgClose, this.onTap);
		this.observe(UserSkill.ins().postHejiEquipChange, this.changeEquipSuccess);
		if (wear == 1) {
			this.scroll.y = 232;
			this.scroll.height = 410;
			this.wearItem.visible = true;
		} else {
			this.scroll.y = 50;
			this.scroll.height = 590;
			this.wearItem.visible = false;
		}
	}

	public close(...param: any[]): void {
		// this.closeBtn0.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		this.list.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.itemTap, this);
		this.removeTouchEvent(this.bgClose, this.onTap);
		this.removeObserve();
	}

	private changeEquipSuccess(): void {
		ViewManager.ins().close(PunchEquipChooseWin);
	}

	public itemTap(e: eui.ItemTapEvent): void {
		// let level: number = GameGlobal.lunhuiModel.level;
		let data: ItemData = UserSkill.ins().equipListData[this.pos];
		let item: ItemData = e.item as ItemData;
		if (data) {
			if (data.itemConfig && item.itemConfig.useCond != data.itemConfig.id) {
				let preItem: ItemConfig = GlobalConfig.ItemConfig[data.itemConfig.id + 10];
				UserTips.ins().showTips(`|C:0xff0000&T:请先更换${preItem.name}`);
				return;
			}
		} else {
			if (item.itemConfig.useCond) {
				let preItem: ItemConfig = GlobalConfig.ItemConfig[910000 + this.pos + 1];
				// UserTips.ins().showTips(`请先更换${preItem.name}`);
				UserTips.ins().showTips(`|C:0xff0000&T:必须装备前一个等级的印记，才可进行装备`);
				return;
			}
		}
		let itemlv = item.itemConfig.level?item.itemConfig.level:0;
		let itemzslv = item.itemConfig.zsLevel?item.itemConfig.zsLevel:0;
		if( itemzslv > UserZs.ins().lv || itemlv > Actor.level ){
			UserTips.ins().showTips(`|C:0xff0000&T:印记需要${itemzslv}转${itemlv}级可进行装备`);
			return;
		}
		UserSkill.ins().sendDressHejiEquip(item.handle, this.pos);
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
		}
	}
}

ViewManager.ins().reg(PunchEquipChooseWin, LayerManager.UI_Main);