/**
 * 七天登录格子
 */
class SevenDayItemRender extends BaseItemRender {
	protected checkedMask: eui.Rect;
	protected checked: eui.Image;
	protected select: eui.Image;
	public item: SevenDayIconBase;
	constructor() {
		super();
		this.skinName = 'act14item';
	}

	protected dataChanged(): void {
		let index = this.data;
		let config = GlobalConfig.LoginRewardsConfig[index];
		let actIns = Activity.ins();
		let currDay = actIns.dayNum;
		let flag: boolean = ((actIns.isAwards >> config.day & 1) == 1);
		if (flag) {
			this.select.visible = false;
			this.checkedMask.visible = this.checked.visible = true;
		} else {
			this.checkedMask.visible = this.checked.visible = false;
		}

		this.item.data = config.rewards[0];
	}

	public setSelectImg(boo: boolean): void {
		this.select.visible = boo;
	}
}
