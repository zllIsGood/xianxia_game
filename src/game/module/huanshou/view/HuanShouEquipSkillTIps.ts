class HuanShouEquipSkillTIps extends BaseEuiView {
	private bgClose: eui.Image;
	private skillName2: eui.Label;
	private skillDesc2: eui.Label;
	private condition2: eui.Label;
	private skillName0: eui.Label;
	private skillDesc0: eui.Label;
	private condition0: eui.Label;

	private ins: UserHuanShou;
	private maxLevel: number = 10;

	public constructor() {
		super();
		this.skinName = `huanShouEquipTIps`;

	}

	public initUI(): void {
		super.initUI();

	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.bgClose, this.onTouch);
		this.ins = UserHuanShou.ins();
		this.maxLevel = CommonUtils.getObjectLength(GlobalConfig.HuanShouSuitConf);
		this.updateView();
	}

	public close(...param: any[]): void {

	}

	private onTouch(): void {
		ViewManager.ins().close(this);
	}

	private udpateSate(): void {
		if (this.ins.equipSuitLevel > 0) {

			this.currentState = this.maxLevel > this.ins.equipSuitLevel ? "nomal" : "max";
		} else {
			this.currentState = "jihuo";
		}
		this.validateNow();
	}

	private updateView(): void {
		this.udpateSate();
		let len = 6;
		let suitCount = 0;
		let nSuitCount = 0;
		for (let i = 0; i < len; i++) {
			let eData = this.ins.equipList[i];
			if (eData.equipId) {
				let conf = this.ins.getEquipConfById(eData.equipId);
				if (this.ins.equipSuitLevel == 0 || conf.stage >= this.ins.equipSuitLevel) {
					suitCount++;
				}
				if (conf.stage >= this.ins.equipSuitLevel + 1) {
					nSuitCount++;
				}
			}
		}
		let suitConf: HuanShouSuitConf;
		let jihuoStr = suitCount >= len ? `` : `（未激活）`;
		if (this.currentState == "nomal" || this.currentState == "max") {
			suitConf = GlobalConfig.HuanShouSuitConf[this.ins.equipSuitLevel];
		} else {
			suitConf = GlobalConfig.HuanShouSuitConf[1];
		}
		let conf = GlobalConfig.SkillsConfig[suitConf.skillId];
		let descConf = GlobalConfig.SkillsDescConfig[conf.desc];
		this.skillName2.textFlow = TextFlowMaker.generateTextFlow(conf.skinName + ` ` + jihuoStr);
		this.skillDesc2.textFlow = TextFlowMaker.generateTextFlow(descConf ? descConf.desc : ``);
		let str = suitCount >= len ? `|C:0x00ff00&T:${suitCount}|` : `|C:0xff0000&T:${suitCount}|`;
		this.condition2.textFlow = suitCount < len ? TextFlowMaker.generateTextFlow(`装备满全套${suitConf.stage}阶幻兽装备激活 （${str}/${len}）`) : TextFlowMaker.generateTextFlow(`已激活`);

		let nextConf = GlobalConfig.HuanShouSuitConf[this.ins.equipSuitLevel + 1];
		if (nextConf) {

			let nextSkillConf = GlobalConfig.SkillsConfig[nextConf.skillId];
			let descConf = GlobalConfig.SkillsDescConfig[nextSkillConf.desc];
			this.skillName0.textFlow = TextFlowMaker.generateTextFlow(nextSkillConf.skinName + ` ` + jihuoStr);
			this.skillDesc0.textFlow = TextFlowMaker.generateTextFlow(descConf ? descConf.desc : ``);
			let str = nSuitCount >= len ? `|C:0x00ff00&T:${nSuitCount}|` : `|C:0xff0000&T:${nSuitCount}|`;
			this.condition0.textFlow = TextFlowMaker.generateTextFlow(`装备满全套${nextConf.stage}阶幻兽装备激活 （${str}/${len}）`);
		}
	}

}

ViewManager.ins().reg(HuanShouEquipSkillTIps, LayerManager.UI_Popup);