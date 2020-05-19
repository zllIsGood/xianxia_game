class HuanShouSkinTalentSkill extends BaseComponent {
	private skillIcon0: eui.Image;
	private skillRedPoint0: eui.Image;
	public blackImg0: eui.Rect;
	private eff1: eui.Group;
	public constructor() {
		super();
		this.skinName = "huanShouSkillitemSkin";
		this.blackImg0.visible = false;
	}

	protected dataChanged(): void {
		let hsData = this.data as TalentSkillData;
		if (!hsData)
			return;
		let conf = hsData.conf;
		let skinData = UserHuanShou.ins().skinList[hsData.skinId];
		let talentLv = skinData ? skinData.talentLv : 0;

		this.skillIcon0.source = conf.skillInfo.icon;
		this.blackImg0.visible = talentLv < conf.level;
		this.skillRedPoint0.visible = HuanShouRedPoint.ins().skinListTalentRed[hsData.skinId];
	}
}

class TalentSkillData {
	public skinId: number;
	public conf: HuanShouTalentConf;
}