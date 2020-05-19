class HuanShouSkillTips extends BaseEuiView {
	private colorCanvas: eui.Image;
	private itemIcon: SkillBookItem2;
	private levelLabel: eui.Label;
	private hsName: eui.Label;
	private attrValue1: eui.Label;
	private attrValue2: eui.Label;
	private closeBtn: eui.Button;

	public powerPanel: PowerPanel;

	private skillId: number;
	private SkillLv: number;
	public constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "huanShouSkillTips";
	}

	public open(...param: any[]): void {
		this.skillId = param[0];
		this.SkillLv = param[1];
		this.addTouchEvent(this.colorCanvas, this.onTap);
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.setData();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.colorCanvas, this.onTap);
		this.removeTouchEvent(this.closeBtn, this.onTap);
	}

	private setData(): void {
		let confs = GlobalConfig.HuanShouSkillConf[this.skillId];
		let conf = confs[this.SkillLv];
		this.itemIcon.data = this.skillId;
		let itemconf: ItemConfig = GlobalConfig.ItemConfig[this.skillId];
		this.hsName.text = itemconf.name;
		this.hsName.textColor = ItemBase.QUALITY_COLOR[itemconf.quality];
		this.levelLabel.text = `Lv.${this.SkillLv}`;
		let power: number = 0;
		if (conf.attr)
			power += UserBag.getAttrPower(conf.attr);
		if (conf.power)
			power += conf.power;
		this.powerPanel.setPower(power);

		this.attrValue1.textFlow = TextFlowMaker.generateTextFlow(conf.desc);
		if (this.SkillLv < Object.keys(confs).length) {
			let nextConf = confs[this.SkillLv + 1];
			this.attrValue2.textFlow = TextFlowMaker.generateTextFlow(nextConf.desc);
		}
	}

	private onTap(): void {
		this.closeWin();
	}
}
ViewManager.ins().reg(HuanShouSkillTips, LayerManager.UI_Popup);