class HuanShouSkinSkillItem extends BaseItemRender {
	private skillIcon0: eui.Image;
	private skillRedPoint0: eui.Image;
	private blackImg0: eui.Rect;
	private eff1: eui.Group;

	public constructor() {
		super();
		this.skinName = `huanShouSkillitemSkin`;
	}

	protected dataChanged(): void {
		let skillData = this.data as HSSkinSkillData;
		if (!skillData)
			return;
		this.skillIcon0.source = skillData.conf.skillInfo.icon;
		this.blackImg0.visible = skillData.stage < skillData.conf.stage;
		this.skillRedPoint0.visible = false;
	}
}

class HSSkinSkillData {
	public stage: number;
	public conf: HuanShouSkinStageConf;
	public constructor() {
	}

}