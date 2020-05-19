/**
 * 道具细节窗口
 *
 */
class ItemDetailedWin extends BaseEuiView {

	private nameLabel: eui.Label;
	private lv: eui.Label;
	private description: eui.Label;
	private num: eui.Label;
	private itemIcon: ItemIcon;
	private BG: eui.Image;
	private power: eui.Label;

	constructor() {
		super();
	}


	public initUI(): void {
		super.initUI();
		this.skinName = "ItemTipsSkin";
		this.itemIcon.imgJob.visible = false;
	}

	public open(...param: any[]): void {
		let type: number = param[0];
		let id: number = param[1];
		let num: number = param[2];
		this.addTouchEndEvent(this, this.otherClose);
		this.setData(type, id, num);
	}

	public close(...param: any[]): void {
		this.removeEventListener(egret.TouchEvent.TOUCH_END, this.otherClose, this);
	}

	private otherClose(evt: egret.TouchEvent) {
		ViewManager.ins().close(this);
	}


	private setData(type: number, id: number, num: number): void {
		let numStr = "";
		if (num == undefined) {
			let data = UserBag.ins().getItemByTypeAndId(type, id);
			numStr = data ? (data.count + "") : "0";
		} else
			numStr = num + "";


		let config = GlobalConfig.ItemConfig[id];

		this.nameLabel.text = config.name;
		this.nameLabel.textColor = ItemConfig.getQualityColor(config);
		this.itemIcon.setData(config);
		this.lv.text = (config.level || 1) + "级";
		this.num.text = numStr;
		this.description.textFlow = TextFlowMaker.generateTextFlow1(config.desc);

		if (ItemConfig.getType(config) == 2) {
			let sID: number = MiJiSkillConfig.getSkillIDByItem(config.id);
			this.power.text = "评分：" + GlobalConfig.MiJiSkillConfig[sID].power;
		}
		else
			this.power.text = "";

		this.BG.height = 170 + this.description.height;
	}

}
ViewManager.ins().reg(ItemDetailedWin, LayerManager.UI_Popup);