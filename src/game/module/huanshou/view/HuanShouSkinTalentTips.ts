class HuanShouSkinTalentTips extends HuanShouSkinSkillTips {
	public constructor() {
		super();
	}

	protected setData(zlId: number, confStage: number, conf: { name: string, desc: string }): void {
		let nextConf: HuanShouTalentConf;
		let hsData = UserHuanShou.ins().skinList[zlId];
		let talentLv = hsData ? hsData.talentLv : 0;
		if (talentLv < confStage) {
			this.currentState = "unactive";
			// this.validateNow();
		} else {
			let confs = GlobalConfig.HuanShouTalentConf[zlId];
			for (let key in confs) {
				if (confs[key].skillInfo && confs[key].level > confStage) {
					nextConf = confs[key];
					break;
				}
			}
			if (nextConf) {
				this.currentState = "active";
			} else {
				this.currentState = "max";
			}

		}
		this.validateNow();

		this.skillName0.text = conf.name;
		this.skillDesc0.textFlow = TextFlowMaker.generateTextFlow(conf.desc);
		if (this.currentState == "active" && nextConf) {
			this.skillName1.text = nextConf.skillInfo.name;
			this.skillDesc1.textFlow = TextFlowMaker.generateTextFlow(nextConf.skillInfo.desc);
			let itemconf = GlobalConfig.ItemConfig[nextConf.itemId];
			this.lock1.text = `${itemconf.name} x${nextConf.count}`
		}
	}
}
ViewManager.ins().reg(HuanShouSkinTalentTips, LayerManager.UI_Popup);
