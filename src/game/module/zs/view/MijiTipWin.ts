class MijiTipWin extends BaseEuiView {

	public colorCanvas: eui.Image;
	public group: eui.Group;
	public info: eui.Label;
	public item: MijiItem;
	public power: eui.Label;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "MijiTipSkin";
		this.isTopLevel = true;
	}

	public open(...param: any[]): void {

		this.item.data = param[0];
		let data: ItemConfig = GlobalConfig.ItemConfig[GlobalConfig.MiJiSkillConfig[param[0].id].item];
		this.info.textFlow = TextFlowMaker.generateTextFlow1(data.name + "\n\n" + data.desc);
		this.power.text = "评分：" + GlobalConfig.MiJiSkillConfig[param[0].id].power;

		this.addTouchEvent(this, this.onClose);
	}

	private onClose(e: egret.TouchEvent): void {
		ViewManager.ins().close(this);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this, this.onClose);
	}
}

ViewManager.ins().reg(MijiTipWin, LayerManager.UI_Main);