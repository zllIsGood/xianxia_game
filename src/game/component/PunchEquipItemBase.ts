/**
 * Created by hrz on 2017/6/14.
 */

class PunchEquipItemBase extends BaseComponent {
	public addBtn: eui.Image;
	public img: eui.Image;
	public redPoint: eui.Image;
	public wearData: ItemData

	public constructor() {
		super();
		this.skinName = 'PunchEquipItemSkin';
	}

	protected dataChanged(): void {
		this.validateNow();
		this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		// let data: ItemData;
		let award = this.data;

		let data = this.wearData = new ItemData();
		data.configID = award.id;

		this.addBtn.visible = false;
		this.redPoint.visible = false;
		this.img.source = "";
		if (data && data.itemConfig) {
			this.img.source = `${data.itemConfig.zsLevel||0}${data.itemConfig.level}_${ItemConfig.getSubType(data.itemConfig) + 1}_png`;
		} else {
			this.img.source = "";
		}
	}

	public destruct(): void {
		this.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
	}

	private onTap(): void {
		if (this.wearData && this.wearData.configID != 0)
			ViewManager.ins().open(HejiEquipTipsWin, this.wearData, true);
		else
			ViewManager.ins().open(PunchEquipChooseWin, this.data, 0);
	}
}