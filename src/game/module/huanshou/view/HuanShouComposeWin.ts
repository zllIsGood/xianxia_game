class HuanShouComposeWin extends BaseEuiView {
	private colorCanvas: eui.Image;
	private itemList: eui.List;
	private closeBtn: eui.Button;
	private closeBtn0: eui.Button;
	private mount: eui.Button;
	private item1: HsSkillComposeItem;
	private item2: HsSkillComposeItem;
	private item3: HsSkillComposeItem;
	private item4: HsSkillComposeItem;

	private itemListArray: eui.ArrayCollection;
	private items: ItemData[];

	public constructor() {
		super();

	}

	public initUI(): void {
		super.initUI();
		this.skinName = "huanShouCompose";

		this.itemList.itemRenderer = SkillBookItem2;
		// this.itemList.allowMultipleSelection = true;
		this.itemListArray = new eui.ArrayCollection();
		this.itemList.dataProvider = this.itemListArray;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.colorCanvas, this.onTap);
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.mount, this.onTap);
		this.addTouchEvent(this.item1, this.onItem);
		this.addTouchEvent(this.item2, this.onItem);
		this.addTouchEvent(this.item3, this.onItem);

		this.itemList.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onItemList, this);

		this.observe(UserHuanShou.ins().postComposeSkill, this.onUpdateComposeSkill);

		this.updateItemList();
		// this.itemList.dataProvider = new eui.ArrayCollection(items);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.colorCanvas, this.onTap);
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
		this.removeTouchEvent(this.mount, this.onTap);
		this.removeTouchEvent(this.item1, this.onItem);
		this.removeTouchEvent(this.item2, this.onItem);
		this.removeTouchEvent(this.item3, this.onItem);
		this.itemList.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.onItemList, this);
		this.removeObserve();
	}

	private updateItemList(): void {
		let tempList = UserBag.ins().getItemByType(ItemType.TYPE_27);//通过技能类型获得技能书
		this.items = [];
		for (let i = 0; i < tempList.length; i++) {
			let tempData: ItemData = new ItemData();
			tempData.handle = tempList[i].handle;
			tempData.count = tempList[i].count;
			tempData.configID = tempList[i].configID;
			this.items.push(tempData);
		}
		this.items.sort(UserHuanShou.ins().sortA);
		this.itemListArray.replaceAll(this.items);
	}


	private onItemList(): void {
		this.selectedSkill();
	}

	private selectedSkill(): void {
		let itemdata: ItemData = this.itemList.selectedItem;
		if (!itemdata) {
			return;
		}

		if (this.item1.data == itemdata || this.item2.data == itemdata || this.item2.data == itemdata) {
			return;//已选择的，不操作
		}

		if (this.item4.data) {
			this.item4.data = null;
		}

		let newItemdata: ItemData = new ItemData();
		newItemdata.configID = itemdata.configID;
		newItemdata.handle = itemdata.handle;
		newItemdata.count = 1;
		if (!this.item1.data || !this.item2.data || !this.item3.data) {
			if (!this.item1.data) {
				this.item1.data = newItemdata;
				// itemdata.count--;
			} else if (!this.item2.data) {
				this.item2.data = newItemdata;
				// itemdata.count--;
			} else if (!this.item3.data) {
				this.item3.data = newItemdata;
				// itemdata.count--;
			}
			this.updateiItemListArray(itemdata, false);
			
		} else {
			UserTips.ins().showTips("置换槽位已满")
		}
	}

	private updateiItemListArray(newItemdata: ItemData, add: boolean = true): void {
		let len = this.items.length;
		let itemdata: ItemData;
		let ishsv: boolean = false;
		for (let i = 0; i < len; i++) {
			itemdata = this.items[i];
			if (itemdata.handle == newItemdata.handle) {
				ishsv = true;
				if (add)
					itemdata.count++;
				else
					itemdata.count--;
				if (itemdata.count <= 0) {
					this.items.splice(i, 1);
				}
				break;
			}
		}

		if (!ishsv) {
			this.items.push(newItemdata);
			this.items.sort(UserHuanShou.ins().sortA)
		}
		// this.items.sort(UserHuanShou.ins().sort);

		if (len == 0) {
			this.itemListArray.source = this.items;
		}

		if (this.items.length == 0) {
			this.itemListArray.source = null;
			//this.itemList.dataProvider = this.itemListArray;
		} else {
			this.itemListArray.replaceAll(this.items);
		}

	}

	private onTap(e: egret.Event): void {
		switch (e.currentTarget) {
			case this.colorCanvas:
			case this.closeBtn:
			case this.closeBtn0:
				this.closeWin();
				break;
			case this.mount:
				if (!this.item1.data || !this.item2.data || !this.item3.data) {
					UserTips.ins().showTips(`置换道具不足`);
					return;
				}
				UserHuanShou.ins().sendComposeSkill(this.item1.data.configID, this.item2.data.configID, this.item3.data.configID);
				break;
		}
	}

	private onItem(e: egret.Event): void {
		let itemdata: ItemData = e.currentTarget.data;
		if (itemdata) {
			e.currentTarget.data = null;
			this.updateiItemListArray(itemdata, true);
		}
	}

	private onUpdateComposeSkill(): void {
		let itemdata = new ItemData();
		itemdata.configID = UserHuanShou.ins().composeSkill[0][0];
		this.item4.data = itemdata;

		this.item1.data = null;
		this.item2.data = null;
		this.item3.data = null;
		this.updateItemList();
	}

}

ViewManager.ins().reg(HuanShouComposeWin, LayerManager.UI_Popup);