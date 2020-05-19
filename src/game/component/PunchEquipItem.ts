class PunchEquipItem extends BaseComponent {

	public addBtn: eui.Button;
	public img: eui.Image;
	// public quality: eui.Image;
	public redPoint: eui.Image;

	public wearData: ItemData = null;

	public constructor() {
		super();
		this.skinName = 'PunchEquipItemSkin';
	}

	protected dataChanged(): void {
		this.img.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		this.addBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		let data: ItemData = UserSkill.ins().equipListData[this.data];
		this.wearData = UserSkill.ins().getWearEquipsData(this.data);
		this.img.source = "";
		this.addBtn.visible = true;
		if (data && data.itemConfig) {
			let subType = ItemConfig.getSubType(data.itemConfig);
			this.img.source = `${data.itemConfig.zsLevel||0}${data.itemConfig.level||1}_${subType + 1}_png`;
			this.redPoint.visible = UserSkill.ins().checkIsHaveBestEquip(subType);
			// this.addBtn.visible = false;
		} else {
			this.img.source = "";
			// this.redPoint.visible = this.addBtn.visible = UserSkill.ins().checkIsHaveBestEquip(this.data);
			this.redPoint.visible = UserSkill.ins().checkIsHaveBestEquip(this.data);
		}
	}

	public destruct(): void {
		this.img.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		this.addBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		this.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
	}

	private onTap(): void {
		if (this.wearData && this.wearData.configID != 0)
			ViewManager.ins().open(HejiEquipTipsWin, this.wearData, true);
		else
			ViewManager.ins().open(HejiEquipTipsWin, this.data, true);
			// ViewManager.ins().open(PunchEquipChooseWin, this.data, 0);
	}
}