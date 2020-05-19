class WingSkillItemRender extends BaseItemRender {
	public icon: eui.Image;
	public skillIcon: eui.Image;
	public blackImg: eui.Rect;
	public constructor() {
		super();
		this.touchEnabled = false;
		this.skinName = "WingSkillItemSkin";
	}

	public dataChanged(): void {
		// this.icon.visible = false;
		// let config: SkillsConfig = GlobalConfig.SkillsConfig[this.data];
		// let skillConfig = GlobalConfig.SkillsConfig[this.data]
		if (this.data) {
			this.skillIcon.visible = true;
			// this.skillIcon.source = skillConfig.icon + "";
			this.skillIcon.source = `${this.data}_png`;
			this.blackImg.visible = false;
		}
	}
}