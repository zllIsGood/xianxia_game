class HuanShouItemTips extends BaseEuiView {
	public bgClose: eui.Rect;
	private use0: eui.Label;
	private info0: eui.Group;
	private num2: eui.Label;
	private attr0: eui.Label;
	private itemIcon0: ItemIcon;
	private nameLabel0: eui.Label;

	constructor() {
		super();
		this.skinName = 'huanShouUpTipsSkin';
	}

	public close(...param: any[]): void {

	}

	public open(...args: any[]): void {
		this.addTouchEvent(this.bgClose, this.closeWin);
		let type = args[0];
		let gcIns = GlobalConfig;
		let hsIns = UserHuanShou.ins();
		let maxStage = CommonUtils.getObjectLength(GlobalConfig.HuanShouStageConf) - 1;//从开始的要减1

		let itemId: number;
		let used: number;
		let curMax: number;

		let conf = GlobalConfig.HuanShouStageConf[hsIns.rank];
		if (type == 0) {
			itemId = gcIns.HuanShouConf.qianNengId;
			used = hsIns.qianNengCount;
			curMax = conf.qianNengLimit;
		} else {
			itemId = gcIns.HuanShouConf.feiShengId;
			used = hsIns.feiShengCount;
			curMax = conf.feiShengLimit;
		}


		let itemConfig: ItemConfig = GlobalConfig.ItemConfig[itemId];
		this.itemIcon0.setData(itemConfig);
		this.nameLabel0.text = itemConfig.name;
		this.nameLabel0.textColor = ItemBase.QUALITY_COLOR[itemConfig.quality];
		this.use0.text = used + "/" + curMax;
		// this.num.text = info.count + "";
		this.attr0.textFlow = TextFlowMaker.generateTextFlow1(itemConfig.desc);

		let show: boolean = hsIns.rank < maxStage;

		if (show) {
			this.info0.visible = true;
			this.num2.text = `${hsIns.rank + 1}阶`;
		}
		else {
			this.info0.visible = false;
		}


	}

}
ViewManager.ins().reg(HuanShouItemTips, LayerManager.UI_Popup);