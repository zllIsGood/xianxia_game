/**
 * 剑灵材料框控件
 *
 */
class WeaponSoulbreakItem extends BaseItemRender {
	private itemIcon:ItemIcon;
	private lv:eui.Label;
	private nameTxt:eui.Label;
	constructor() {
		super();
		this.skinName = 'weaponSoulbreakitem';

	}

	protected childrenCreated(): void {
		super.childrenCreated();
	}
	// {costItem:number, costNum:number, sum:number, icon:string};
	protected dataChanged(): void {
		if( !this.data )return;
		let sum:number = this.data.sum;
		let costNum:number = this.data.costNum;
		let costItem:number = this.data.costItem;
		let colorStr: number;
		if (sum >= costNum)
			colorStr = ColorUtil.GREEN;
		else
			colorStr = ColorUtil.RED;
		this.lv.textFlow = TextFlowMaker.generateTextFlow1(`|C:${colorStr}&T:${sum}/${costNum}`);
		// this.lv.text = sum + "/" + costNum;

		// this.item1.imgBg.source = ""
		this.itemIcon.imgJob.visible = false;
		let itemconfig:ItemConfig = GlobalConfig.ItemConfig[costItem];
		this.nameTxt.text = itemconfig.name;
		this.itemIcon.imgIcon.source = itemconfig.icon + "_png";
	}
	public destruct(): void {

	}
	protected clear(): void {

	}
}