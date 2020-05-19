class RoleChooseEquipWin extends BaseEuiView {

	// public closeBtn0: eui.Button;
	public list: eui.List;
	public scroll: eui.Scroller;

	private wearItem: RoleEquipChooseItem;
	private itemList: ItemData[] = [];

	private pos: number = 0;
	public roleSelect: number = 0;
	private itemGroup: eui.Group;
	private bgClose: eui.Image;

	public initUI(): void {
		super.initUI();
		this.isTopLevel = true;
		this.skinName = "RoleChooseEquipSkin";
		this.list.itemRenderer = RoleEquipChooseItem;
		this.wearItem = new RoleEquipChooseItem();
		this.itemGroup.addChild(this.wearItem);
	}


	public open(...param: any[]): void {
		this.roleSelect = param[0];
		this.pos = param[1];

		let model: Role = SubRoles.ins().getSubRoleByIndex(this.roleSelect);
		let data: EquipsData = model.getEquipDataByPos(this.pos);

		this.wearItem.setUpImage(false);
		this.wearItem.data = data.item;
		this.wearItem.setBtnStatu();
		let power: number = 0;
		if (data && data.item.configID != 0) {
			this.scroll.y = 170;
			this.scroll.height = 400;
			this.wearItem.visible = true;
			// let att = UserBag.ins().getEquipAttrs(data.item);
			power = data.item.point;
			let job: number = ItemConfig.getJob(data.item.itemConfig) == 0 ? model.job : ItemConfig.getJob(data.item.itemConfig);
			UserBag.ins().setEquipPowerDic(job, ItemConfig.getSubType(data.item.itemConfig), power);
		} else {
			this.scroll.y = 50;
			this.scroll.height = 520;
			this.wearItem.visible = false;
		}
		this.itemList = UserBag.ins().getEquipByPos(this.roleSelect, this.pos);
		// this.itemList.sort(this.sortFun);
		this.list.dataProvider = new eui.ArrayCollection(this.itemList);
		this.list.validateNow();
		// this.closeBtn0.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		//this.list.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.itemTap, this);
		this.addTouchEvent(this.bgClose, this.onTap);
		this.addTouchEvent(this, this.itemTap)

	}

	public itemTap(e: egret.TouchEvent): void {
		if (e.target.name == "changeBtn") {
			let item: ItemData = e.target.parent.data as ItemData;
			if (item && item instanceof ItemData) {
				let lv: number = Actor.level;
				let zsLv: number = UserZs.ins().lv;
				if (item.itemConfig) {
					if (zsLv >= (item.itemConfig.zsLevel || 0) && lv >= (item.itemConfig.level || 1)) {

					} else {
						if (ItemConfig.getQuality(item.itemConfig) == 5) {
							UserTips.ins().showTips(`|C:0xF3311E&T:${item.itemConfig.name}）达到${item.itemConfig.zsLevel}转${item.itemConfig.level || 1}级可穿戴|`);
							return;
						}
						UserTips.ins().showTips("|C:0xF3311E&T:等级不足，无法穿戴|");
						return;
					}
				}
				UserEquip.ins().sendWearEquipment(item.handle, this.pos, this.roleSelect);
				ViewManager.ins().close(this);
				SoundUtil.ins().playEffect(SoundUtil.EQUIP);
			}
		}
	}

	private onTap(e: egret.TouchEvent): void {
		ViewManager.ins().close(this);
		// switch (e.target) {

		// case this.closeBtn0:
		// 	ViewManager.ins().close(PunchEquipChooseWin);
		// 	break;
		// }
	}

	private sortFun(aItem: ItemData, bItem: ItemData): number {
		let att1 = UserBag.ins().getEquipAttrs(aItem);
		let itemPoint1: number = UserBag.getAttrPower(att1);
		let att2 = UserBag.ins().getEquipAttrs(bItem);
		let itemPoint2: number = UserBag.getAttrPower(att2);
		if (itemPoint1 < itemPoint2)
			return 1;
		if (itemPoint1 > itemPoint2)
			return -1;
		return 0;
	}
}

ViewManager.ins().reg(RoleChooseEquipWin, LayerManager.UI_Popup);

