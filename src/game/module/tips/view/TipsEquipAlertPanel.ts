class TipsEquipAlertPanel extends BaseView {
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

	public set data(itemid: number) {
		let itemConfig:ItemConfig = GlobalConfig.ItemConfig[itemid];
		this.item.setItemImg(itemConfig.icon + "_png");
		this.item.isShowJob(false);
		this.item.setImgBg(ItemConfig.getQuality(itemConfig));
		this.desc.text = itemConfig.name;
		this.skillName.visible = false;
		// this.skillName.text = itemConfig.name;
		// this.skillName.textColor = ItemBase.QUALITY_COLOR[4];
		this.item.isShowName(false);
		this.item.showNum(false);


	}
}
