class MijiZhWin extends BaseEuiView {

	private closeBtn: eui.Button;
	private closeBtn0: eui.Button;
	private smeltBtn: eui.Button;

	private itemScroller: eui.VScrollBar;
	private itemList: eui.List;

	private mijiItem0: MijiItem;//最左icon
	private mijiItem1: MijiItem;
	private mijiItem2: MijiItem;
	private mijiItem3: MijiItem;//最右icon

	private nameArr: string[];
	private mcEff1: MovieClip;//特效1
	private mcEff2: MovieClip;//特效2
	private mcEff3: MovieClip;//特效3
	private mijiGP: eui.Group;

	public bgClose: eui.Rect;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "MijiZhSkin";
		this.itemList.itemRenderer = ItemBaseNoTap;
		this.itemScroller.viewport = this.itemList;

		this.touchChildren = true;
		this.mijiItem0.touchEnabled = true;
		this.mijiItem0.touchChildren = true;
		this.mijiItem1.touchEnabled = true;
		this.mijiItem1.touchChildren = true;
		this.mijiItem2.touchEnabled = true;
		this.mijiItem2.touchChildren = true;

		this.mcEff1 = new MovieClip();
		this.mcEff1.x = 20 + 43;
		this.mcEff1.y = 60 + 39;
		this.mcEff2 = new MovieClip();
		this.mcEff2.x = 153;
		this.mcEff2.y = 60 + 39;
		this.mcEff3 = new MovieClip();
		this.mcEff3.x = 243;
		this.mcEff3.y = 60 + 39;

		this.nameArr = [];

		this.isTopLevel = true;
	}

	private onItemTap(e: eui.ItemTapEvent) {
		// if (ErrorLog.Assert(this.mijiItem0.data && this.mijiItem1.data && this.mijiItem2.data, "mijizhwin.mijiitem0 is null"))
		// 	return;
		if (this.mijiItem0.data && this.mijiItem1.data && this.mijiItem2.data)
			return;

		let count: number = (<ItemData>e.item).count;
		let id: number = MiJiSkillConfig.getSkillIDByItem((<ItemData>e.item).configID);
		if (this.mijiItem0.data == id)
			count--;
		if (this.mijiItem1.data == id)
			count--;
		if (this.mijiItem2.data == id)
			count--;
		let str: string = "秘术不足";
		if (!count) {
			UserTips.ins().showTips(str);
			return;
		}

		if (!this.mijiItem0.data) {
			this.mijiItem0.data = id;
			this.nameArr[0] = (<ItemData>e.item).itemConfig.name;
		}
		else if (!this.mijiItem1.data) {
			this.mijiItem1.data = id;
			this.nameArr[1] = (<ItemData>e.item).itemConfig.name;
		}
		else if (!this.mijiItem2.data) {
			this.mijiItem2.data = id;
			this.nameArr[2] = (<ItemData>e.item).itemConfig.name;
		}
		this.mijiItem3.data = "";
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.smeltBtn, this.onTap);
		this.addTouchEvent(this.mijiItem0, this.onTap);
		this.addTouchEvent(this.mijiItem1, this.onTap);
		this.addTouchEvent(this.mijiItem2, this.onTap);
		this.addTouchEvent(this.mijiItem3, this.onTap);
		this.addTouchEvent(this.bgClose, this.onTap);
		this.itemList.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onItemTap, this);

		this.observe(UserBag.ins().postItemAdd, this.updateItem);//道具添加
		this.observe(UserBag.ins().postItemDel, this.updateItem);//道具删除
		this.observe(UserBag.ins().postItemChange, this.updateItem);//道具变更
		this.observe(UserMiji.ins().postMijiChange, this.showResult);
		this.clearData();
		this.updateItem();

	}


	private sortFun(aItem: ItemData, bItem: ItemData): number {

		if (aItem.configID < bItem.configID)
			return -1;
		if (aItem.configID > bItem.configID)
			return 1;
		return 0;
	}

	private updateItem(): void {
		let arr: ItemData[] = UserBag.ins().getItemByType(2);
		arr.sort(this.sortFun);
		this.itemList.dataProvider = new eui.ArrayCollection(arr);
	}

	private clearData(): void {
		this.itemList.selectedIndex = -1;
		this.mijiItem0.data = "";
		this.mijiItem1.data = "";
		this.mijiItem2.data = "";
		this.mijiItem3.data = "";
	}

	private playEffect(): void {
		this.mcEff1.playFile(RES_DIR_EFF + "forgeSuccess", 1);
		this.anigroup.addChild(this.mcEff1);
		this.mcEff2.playFile(RES_DIR_EFF + "forgeSuccess", 1);
		this.anigroup.addChild(this.mcEff2);
		this.mcEff3.playFile(RES_DIR_EFF + "forgeSuccess", 1);
		this.anigroup.addChild(this.mcEff3);
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.smeltBtn:
				if (!this.mijiItem0.data || !this.mijiItem1.data || !this.mijiItem2.data) {
					UserTips.ins().showTips("请先放入3本秘术");
					return;
				}

				WarnWin.show("是否消耗《" + this.nameArr[0] + "》、《" + this.nameArr[1] + "》、《" + this.nameArr[2] + "》随机置换一本新的秘术？",
					() => {
						let skillID1: number = this.mijiItem0.data;
						let skillID2: number = this.mijiItem1.data;
						let skillID3: number = this.mijiItem2.data;
						UserMiji.ins().sendMijiChange(skillID1, skillID2, skillID3);
						this.clearData();
						this.playEffect();
					}, this);
				break;
			case this.closeBtn:
			case this.closeBtn0:
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
			case this.mijiItem0:
			case this.mijiItem1:
			case this.mijiItem2:
				e.currentTarget.data = "";
				break;
			case this.mijiItem3:
				if (this.mijiItem3 && this.mijiItem3.data) {
					let tempData = GlobalConfig.MiJiSkillConfig[this.mijiItem3.data];
					if (tempData) {
						let tempItem = UserBag.ins().getBagItemById(tempData.item);
						if (tempItem) ViewManager.ins().open(ItemDetailedWin, 0, tempItem.itemConfig.id, tempItem.count);
					}
				}
				break;
		}

	}

	private showResult(itemID: number): void {
		this.mijiItem3.data = MiJiSkillConfig.getSkillIDByItem(itemID);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
		this.removeTouchEvent(this.smeltBtn, this.onTap);
		this.itemList.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.onItemTap, this);
		this.removeTouchEvent(this.mijiItem0, this.onTap);
		this.removeTouchEvent(this.mijiItem1, this.onTap);
		this.removeTouchEvent(this.mijiItem2, this.onTap);

		this.removeObserve();
		DisplayUtils.removeFromParent(this.mcEff1);
		DisplayUtils.removeFromParent(this.mcEff2);
		DisplayUtils.removeFromParent(this.mcEff3);
	}
}

ViewManager.ins().reg(MijiZhWin, LayerManager.UI_Popup);