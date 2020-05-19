class HsSkillComposeItem extends BaseComponent {
	private skill: eui.Image;
	private lock: eui.Image;
	private skillName: eui.Label;

	public constructor() {
		super();
		this.skinName = "huanShouComposeItemSkin";
	}

	public open(...param: any[]): void {

	}

	public close(...param: any[]): void {

	}

	protected dataChanged(): void {
		let itemdata: ItemData = this.data;
		if (!itemdata) {

			this.currentState = "normal";
			return;
		}
		this.currentState = "huihua";
		this.validateNow();

		let conf = itemdata.itemConfig;//GlobalConfig.ItemConfig[id];
		this.skill.source = conf.icon + "_png";
		this.skillName.text = conf.name;
		this.skillName.textColor = ItemBase.QUALITY_COLOR[conf.quality];
	}
}