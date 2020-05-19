class PunchSkillItemRender extends BaseComponent {
	public imgBg: eui.Image;
	public icon: eui.Image;
	public iconBG: eui.Image;

	public constructor() {
		super();
		this.skinName = "PunchSkillItem";
	}

	public setData(config: SkillData) {
		switch (config.id) {
			case 71000:
				this.iconBG.source = `koskill_icon_001`;
				break;
			case 72000:
				this.iconBG.source = `koskill_icon_002`;
				break;
			case 73000:
				this.iconBG.source = `koskill_icon_003`;
				break;
		}
		// this.iconBG.source = `${config.id}_png`;
	}
}