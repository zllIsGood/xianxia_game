class PunchResWin extends BaseEuiView {
	public itemList: eui.List;
	public smeltBtn: eui.Button;
	/** 可熔炼装备列表 */
	private smeltEquips: ItemData[];
	private dataInfo: eui.ArrayCollection;
	private bgClose: eui.Image;
	constructor() {
		super();
		this.isTopLevel = true;
		this.skinName = "PunchResSkin";
	}

	public initUI(): void {
		super.initUI();
		this.smeltEquips = [];
		this.smeltEquips.length = 9;

		this.itemList.itemRenderer = SmeltEquipItem;

		this.dataInfo = new eui.ArrayCollection(this.smeltEquips);
		this.itemList.dataProvider = this.dataInfo;
	}


	public open(...param: any[]): void {
		this.addTouchEvent(this.smeltBtn, this.onTap);
		this.addTouchEvent(this.itemList, this.onTap);
		this.addTouchEvent(this.bgClose, this.onTap);
		this.observe(UserEquip.ins().postSmeltEquipComplete, this.smeltComplete);
		this.observe(UserEquip.ins().postEquipCheckList, this.setItemList);
		this.setItemData()
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.smeltBtn, this.onTap);
		this.removeTouchEvent(this.itemList, this.onTap);
		this.removeTouchEvent(this.bgClose, this.onTap);
		this.removeObserve();

	}

	private smeltComplete(): void {
		let n: number = this.itemList.numChildren;
		while (n--) {
			(this.itemList.getChildAt(n) as SmeltEquipItem).playEff();
		}
		this.setItemData();
	}

	private setItemData(): void {
		this.smeltEquips = UserBag.ins().getHejiOutEquips();
		this.dataInfo.replaceAll(this.smeltEquips);
	}

	private setItemList(list: ItemData[]): void {
		this.dataInfo.replaceAll(list);
		this.itemList.dataProvider = this.dataInfo;
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.smeltBtn:
				UserEquip.ins().sendSmeltEquip(0, this.smeltEquips);
				break;
			case this.itemList:
				let item: SmeltEquipItem = e.target as SmeltEquipItem;
				if (item && item.data) {
					let i: number = this.smeltEquips.indexOf(item.data);
					if (i >= 0) {
						this.smeltEquips.splice(i, 1);
						item.data = null;
					}
				}
				// else {
				// 	let smeltList: ItemData[] = UserBag.ins().getBagSortQualityEquips(3, 0, 0, UserBag.ins().normalEquipSmeltFilter);
				// 	if (smeltList.length > 0) {
				// 		let smeltSelectWin: SmeltSelectWin = ViewManager.ins().open(SmeltSelectWin, smeltList, 9) as SmeltSelectWin;
				// 		smeltSelectWin.setSmeltEquipList(this.smeltEquips);
				// 	}
				// 	else {
				// 		UserTips.ins().showTips("|C:0xf3311e&T:当前没有可熔炼的装备|");
				// 	}
				// }
				break;
			case this.bgClose:
				ViewManager.ins().close(PunchResWin);
				break
		}
	}
}

ViewManager.ins().reg(PunchResWin, LayerManager.UI_Popup);