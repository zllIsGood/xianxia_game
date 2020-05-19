/**
 * HomeBossRemindItem
 */
class HomeBossAutoFighItem extends BaseItemRender {

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

		let levelConfig: BossHomeConfig;
		for (let k in GlobalConfig.BossHomeConfig) {
			if (GlobalConfig.BossHomeConfig[k].boss.lastIndexOf(model.id) != -1) {
				levelConfig = GlobalConfig.BossHomeConfig[k];
				break;
			}
		}
		let canChallenge: boolean = false;
		if (levelConfig && UserVip.ins().lv >= levelConfig.vip) {
			if (config.zsLevel > 0) {
				canChallenge = UserZs.ins().lv >= config.zsLevel;
			} else {
				canChallenge = Actor.level >= config.level;
			}
			if (!canChallenge) this.txt.text = "未满足挑战等级";
			this.levelShow.text = config.zsLevel > 0 ? config.zsLevel + "转" : config.level + "级";
		} else {
			canChallenge = false;
			this.levelShow.text = "";
			this.txt.text = "未满足挑战VIP等级";
		}

		this.checkBoxs.visible = canChallenge;
		if (canChallenge) {
			this.checkBoxs.selected = UserBoss.ins().getBossRemindByIndex(model.id,2);
		}

		this.txt.visible = !this.checkBoxs.visible;
		this.checkBoxs.name = model.id + "";

		let boss: MonstersConfig = GlobalConfig.MonstersConfig[config.bossId];
		this.bossName.text = boss.name;
	}
}