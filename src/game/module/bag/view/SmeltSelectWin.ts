/**
 *
 * @author
 *
 */
class SmeltSelectWin extends BaseEuiView {

	/** 关闭按钮 */
	public closeBtn: eui.Button;
	public closeBtn0: eui.Button;
	public itemList: eui.List;
	public itemScroller: eui.VScrollBar;
	public sureBtn: eui.Button;
	public countLabel: eui.Label;

	private checkList: ItemData[];
	private len: number;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "SmeltSelectSkin";
		this.isTopLevel = true;
		this.itemList.itemRenderer = SmeltSelectItem;

		this.itemScroller.viewport = this.itemList;

		this.checkList = [];
	}

	public open(...param: any[]): void {
		this.len = param[1];
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.sureBtn, this.onTap);
		this.itemList.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onItemTap, this);

		let list: ItemData[] = param[0];
		list.sort(UserBag.ins().sort2);
		this.itemList.dataProvider = new eui.ArrayCollection(param[0]);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
		this.removeTouchEvent(this.sureBtn, this.onTap);
		this.itemList.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onItemTap, this);
		this.foolChecklist();
		this.removeObserve();
		UserEquip.ins().postEquipCheckList(this.checkList);
	}
	private onItemTap(e: eui.ItemTapEvent): void {
		let item: SmeltSelectItem = <SmeltSelectItem>e.itemRenderer;
		item.checkBoxs.selected = !item.checkBoxs.selected;
		let itemData: ItemData = this.itemList.selectedItem as ItemData;
		if (item.checkBoxs.selected) {
			if (this.checkList.length < this.len) {
				this.checkList[this.checkList.length] = itemData;
				if (this.checkList.length >= this.len) {
					this.autoClose();
					return;
				}
			}
			else {
				this.autoClose();
				return;
			}
		}
		else {
			let index: number = this.checkList.indexOf(itemData);
			if (index < 0)
				return;
			this.checkList.splice(index, 1);
		}
		this.setCountLabel(this.checkList.length);
	}

	private autoClose(): void {
		UserEquip.ins().postEquipCheckList(this.checkList);
		ViewManager.ins().close(SmeltSelectWin);
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(SmeltSelectWin);
				break;

			case this.sureBtn:
				UserEquip.ins().postEquipCheckList(this.checkList);
				ViewManager.ins().close(SmeltSelectWin);
				break;
		}
	}

	public setSmeltEquipList(list: ItemData[]): void {
		this.checkList = list;
		this.checkListData();
		this.setCountLabel(this.checkList.length);
		TimerManager.ins().doTimer(60, 1, () => {
			for (let i: number = 0; i < this.checkList.length; i++) {
				for (let j: number = 0; j < this.itemList.numElements; j++) {
					let item: SmeltSelectItem = this.itemList.getElementAt(j) as SmeltSelectItem;
					if (this.checkList[i] && item && this.checkList[i].handle == (item.data as ItemData).handle) {
						if (this.checkList.length <= this.len) {
							item.checkBoxs.selected = true;
						}
						break;
					}
				}
			}
		}, this)
	}

	private setCountLabel(count: number): void {
		this.countLabel.text = count + "/" + this.len;
	}

	private checkListData(): void {
		let len: number = this.checkList.length;
		for (let i: number = len - 1; i >= 0; i--) {
			if (this.checkList[i] == null) {
				this.checkList.splice(i, 1);
			}
		}
	}

	private foolChecklist(): void {
		let len: number = this.checkList.length;
		for (let i: number = 0; i < this.len; i++) {
			if (i >= len) {
				this.checkList.push(null);
			}
		}
	}
}
ViewManager.ins().reg(SmeltSelectWin, LayerManager.UI_Main);