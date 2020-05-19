/**
 * PubBossRemindItem
 */
class PubBossRemindItem extends BaseItemRender {

	private txt: eui.Label;
	public checkBoxs: eui.CheckBox;
	private bossName: eui.Label;
	private levelShow: eui.Label;

	constructor() {
		super();
	}

	public dataChanged(): void {
		let model: WorldBossItemData = this.data;
		let config: WorldBossConfig = GlobalConfig.WorldBossConfig[model.id];
		let canChallenge = UserBoss.isCanChallenge(config);
		let desc;
		if (config.samsaraLv > 0) {
			desc = config.showName;
		}
		else {
			if (config.zsLevel > 0) {
				desc = `${config.zsLevel}转`;
			} else {
				desc = `${config.level}级`;
			}
		}
		this.checkBoxs.visible = canChallenge;
		if (canChallenge) {
			this.checkBoxs.selected = UserBoss.ins().getBossRemindByIndex(model.id,1);
		}
		this.txt.visible = !canChallenge;
		this.checkBoxs.name = model.id + "";

		let boss: MonstersConfig = GlobalConfig.MonstersConfig[config.bossId];
		this.bossName.text = boss.name;
		this.levelShow.text = desc;
	}
}