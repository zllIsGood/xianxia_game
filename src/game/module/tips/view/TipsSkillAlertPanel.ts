class TipsSkillAlertPanel extends BaseView {
	// public itemName: eui.Label;
	public desc: eui.Label;
	public skillName: eui.Label;
	public item: ItemBase;
	public isUsing: boolean;

	constructor() {
		super();
		// this.skinName = "SkillNoticeSkin";
		this.skinName = "OrangeEquipNoticeSkin2";

		this.isUsing = false;
		this.horizontalCenter = 0;
		// this.verticalCenter = 0;
	}

	public set data(skillid: number) {
		let skillConfig = new SkillData(skillid);
		this.item.setItemImg(skillConfig.icon);
		this.skillName.text = skillConfig.name;
		this.skillName.textColor = ItemBase.QUALITY_COLOR[4];
		this.item.isShowName(false);
		this.item.showNum(false);
	}
}
