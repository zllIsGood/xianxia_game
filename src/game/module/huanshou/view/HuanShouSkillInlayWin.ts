class HuanShouSkillInlayWin extends BaseEuiView {
	private itemList: eui.List;
	private closeBtn: eui.Button;
	private closeBtn0: eui.Button;
	private mount: eui.Button;
	private skillImage: eui.Image;
	private skillName: eui.Label;
	private skillDesc: eui.Label;

	private _pos: number;

	private selectedItem: number;
	private itemListArray: eui.ArrayCollection;
	private _newitems: ItemData[];

	public constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "huanShouDisplace";
		this.itemList.itemRenderer = SkillBookItem2;
		this.itemListArray = new eui.ArrayCollection();
		this.itemList.dataProvider = this.itemListArray;
	}

	public open(...param: any[]): void {
		this._pos = param[0];
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.mount, this.onTap);
		this.itemList.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onItemList, this);
		this.filterSkill();
		if (!this.itemList.selectedItem && this._newitems.length > 0) {
			this.itemList.selectedIndex = 0;
			this.itemList.dispatchEvent(new egret.Event(eui.ItemTapEvent.ITEM_TAP));
		} else {
			this.selectedSkill();
		}

	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
		this.removeTouchEvent(this.mount, this.onTap);
		this.itemList.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.onItemList, this);
	}

	//把已有技能过虑
	private filterSkill(): void {

		this._newitems = UserHuanShou.ins().getFilterSkillItems();
		this._newitems.sort(UserHuanShou.ins().sortA);
		this.itemListArray.replaceAll(this._newitems);
	}

	private onItemList(): void {
		this.selectedSkill();
	}

	private selectedSkill(): void {
		let itemdata: ItemData = this.itemList.selectedItem;
		if (!itemdata) {
			this.skillImage.source = "";
			this.skillName.text = "";
			this.skillDesc.text = "";
			return;
		}
		let conf = GlobalConfig.HuanShouSkillConf[itemdata.configID][1];//一级技能书
		this.skillImage.source = itemdata.itemConfig.icon + "_png";
		this.skillName.text = itemdata.itemConfig.name;
		this.skillDesc.textFlow = TextFlowMaker.generateTextFlow(conf.desc);
		this.selectedItem = itemdata.configID;
	}

	private onTap(e: egret.Event): void {
		switch (e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn0:
				this.closeWin();
				break;
			case this.mount:
				if (this.selectedItem) {
					UserHuanShou.ins().sendInlaySkill(this._pos, this.selectedItem);
					this.closeWin();
				}
				else
					UserTips.ins().showTips("没有选择技能");
				break;
		}
	}
}

ViewManager.ins().reg(HuanShouSkillInlayWin, LayerManager.UI_Popup);