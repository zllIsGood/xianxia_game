/**
 * 道具细节窗口
 *
 */
class HeirloomSkillItem extends BaseEuiView {

	private itemIcon: HeirloomItemIcon;

	public nameLabel:eui.Label;
	public description:eui.Label;

	constructor() {
		super();
	}


	public initUI(): void {
		super.initUI();
		this.skinName = "heirloomTipsSkin";
	}

	public open(...param: any[]): void {
		let icon: string = param[0];
		let name: string = param[1];
		let desc: string = param[2];

		this.addTouchEndEvent(this, this.onClick);
		this.setData(icon,name,desc)
	}

	public close(...param: any[]): void {
		this.removeEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
	}

	private onClick(evt: egret.TouchEvent) {
		ViewManager.ins().close(this);
	}

	private setData(icon:string,name:string,desc:string): void {
		this.itemIcon.setSkillData(icon);
		this.nameLabel.textFlow = TextFlowMaker.generateTextFlow1(name);
		this.description.textFlow = TextFlowMaker.generateTextFlow1(desc);

	}


}
ViewManager.ins().reg(HeirloomSkillItem, LayerManager.UI_Popup);