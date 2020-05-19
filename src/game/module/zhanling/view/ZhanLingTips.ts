class ZhanLingTips extends BaseEuiView {
	private condition0: eui.Label;
	private skillDesc0: eui.Label;
	private skillName0: eui.Label;
	private condition1: eui.Label;
	private skillDesc1: eui.Label;
	private skillName1: eui.Label;
	private bgClose: eui.Rect;
	private id: number;
	private skillid: number;
	private curGroup: eui.Group;
	private nextGroup: eui.Group;

	constructor() {
		super();
		this.skinName = "ZhanlingSkillTipsSkin";
	}

	public initUI(): void {
		super.initUI();

	}

	public open(...param: any[]): void {
		this.addTouchEndEvent(this, this.otherClose);
		this.addTouchEvent(this.bgClose, this.otherClose);

		this.id = param[0] || 0;
		this.skillid = param[1];//有技能就技能tips 没有就是天赋tips


		let tips: { name?: string, desc?: string, lock?: string } = {name: "", desc: "", lock: ""};
		let ntips: { name?: string, desc?: string, lock?: string } = {name: "", desc: "", lock: ""};
		let state = "";
		if (this.skillid) {
			//技能tips
			state = "unactive";
			let zlData: ZhanLingData = ZhanLingModel.ins().getZhanLingDataById(this.id);
			let skill: { id: number, open: number }[] = ZhanLingModel.ins().getZhanLingDataBySkill(this.id);
			let zlBase: ZhanLingBase = GlobalConfig.ZhanLingBase[this.id];
			let level = ZhanLingModel.ins().getZhanLingDataByLevel(this.id);
			// let maxlevel = CommonUtils.getObjectLength(GlobalConfig.ZhanLingLevel[this.id]) - 1;
			for (let i = 0; i < zlBase.skill.length; i++) {
				if (zlBase.skill[i].id == this.skillid) {
					let zlskill: ZhanLingSkill = GlobalConfig.ZhanLingSkill[zlBase.skill[i].id];
					let skillconfig: SkillsConfig = GlobalConfig.SkillsConfig[zlskill.passive];
					let descId = skillconfig ? skillconfig.desc : 0;//技能库如果不配 出问题
					let sdconfig: SkillsDescConfig = GlobalConfig.SkillsDescConfig[descId];
					if (!zlData || level < zlBase.skill[i].open) {
						let stage = Math.floor(zlBase.skill[i].open / 10);
						let stage2 = Math.floor(zlBase.skill[i].open % 10);
						if (!stage2) {
							if (zlBase.skill[i].open && zlBase.skill[i].open % 10 == 0)
								stage2 = 10;
							else
								stage += 1;
						} else {
							stage += 1;
						}
						if (sdconfig) {
							tips.name = sdconfig.name;
							tips.desc = sdconfig.desc;
						}
						tips.lock = `${stage}阶${(stage2)}星`;
					} else {
						state = "max";
						if (sdconfig) {
							tips.name = sdconfig.name;
							tips.desc = sdconfig.desc;
						}
					}
					if (skillconfig && sdconfig && tips.desc) {
						tips.desc = StringUtils.replace(tips.desc, `${skillconfig.desc_ex[0]}`);
					}
					//名字配了指定覆盖
					if (zlskill.desc && zlskill.desc.name)
						tips.name = zlskill.desc.name;

					//描述
					if (zlskill.desc && zlskill.desc.desc) {
						tips.desc = zlskill.desc.desc;
					}
					//技能属性
					if (zlskill.attrs) {
						if (tips.desc)
							tips.desc += "\n";
						tips.desc += `|C:0xff00ff&T:${AttributeData.getAttStr(zlskill.attrs, 0, 1, "：")}|`;
					}
					break;
				}
			}
		}
		else {
			//天赋tips
			let talentId = ZhanLingModel.ins().getZhanLingDataByTalentId(this.id);
			let talentLv = ZhanLingModel.ins().getZhanLingDataByTalentLv(this.id);
			let maxTalentLv = CommonUtils.getObjectLength(GlobalConfig.ZhanLingTalent[talentId]);
			let zltalent: ZhanLingTalent = GlobalConfig.ZhanLingTalent[talentId][talentLv];
			if (!zltalent) {
				state = "unactive";
				zltalent = GlobalConfig.ZhanLingTalent[talentId][1];
				if (!zltalent.costCount) {//无消耗就是配表
					// let stageLv = ZhanLingModel.ins().getZhanLingDataByStage(this.id) + 1;//默认十阶升级一个天赋
					// tips.lock = `${stageLv}阶1星`;
					let stages = ZhanLingModel.ins().getZhanLingDataByNextStage(this.id);
					if (stages)
						tips.lock = `${stages[0]}阶${stages[1]}星`;
				} else {
					tips.lock = `激活皮肤后`;
				}
			} else if (talentLv >= maxTalentLv) {
				state = "max";
			} else {
				state = "active";
				let nzlBase: ZhanLingBase = GlobalConfig.ZhanLingBase[this.id];
				let itemcfg = GlobalConfig.ItemConfig[nzlBase.mat];
				let nzltalent: ZhanLingTalent = GlobalConfig.ZhanLingTalent[talentId][talentLv + 1];
				if (!nzltalent.talentDesc) {
					let skillid = nzltalent.passive[0].id;
					let skconfig = GlobalConfig.SkillsConfig[skillid];
					let descId = skconfig.desc;
					let sdconfig: SkillsDescConfig = GlobalConfig.SkillsDescConfig[descId];
					ntips.name = sdconfig.name;
					ntips.desc = StringUtils.replace(sdconfig.desc, `${skconfig.desc_ex[0]}`);
					if (!nzltalent.costCount) {//无消耗就是配表
						// let stageLv = ZhanLingModel.ins().getZhanLingDataByStage(this.id) + 1;
						let stages = ZhanLingModel.ins().getZhanLingDataByNextStage(this.id);
						if (stages)
							ntips.lock = `${stages[0]}阶${stages[1]}星`;
						// ntips.lock = `${stageLv}阶1星`;
					} else {
						ntips.lock = `|C:0xFFFFCC&T:升级条件:|C:0xff0000&T:${itemcfg.name}皮肤*${nzltalent.costCount}`;
						DisplayUtils.removeFromParent(this[`lock1`]);
					}
				} else {
					ntips.name = nzltalent.talentDesc.name;
					ntips.desc = StringUtils.replace(nzltalent.talentDesc.desc, `${nzltalent.rate / 100}`);
					if (!nzltalent.costCount) {//无消耗就是配表
						// let stageLv = ZhanLingModel.ins().getZhanLingDataByStage(this.id) + 1;
						// ntips.lock = `${stageLv}阶1星`;
						let stages = ZhanLingModel.ins().getZhanLingDataByNextStage(this.id);
						if (stages)
							ntips.lock = `${stages[0]}阶${stages[1]}星`;
					} else {
						ntips.lock = `|C:0xFFFFCC&T:升级条件:|C:0xff0000&T:${itemcfg.name}皮肤*${nzltalent.costCount}`;
						DisplayUtils.removeFromParent(this[`lock1`]);
					}
				}
			}
			if (!zltalent.talentDesc) {
				let skillid = zltalent.passive[0].id;
				let descId = GlobalConfig.SkillsConfig[skillid].desc;
				let sdconfig: SkillsDescConfig = GlobalConfig.SkillsDescConfig[descId];
				tips.name = sdconfig.name;
				tips.desc = sdconfig.desc;
				tips.desc = StringUtils.replace(tips.desc, `${GlobalConfig.SkillsConfig[skillid].desc_ex[0]}`);
			} else {
				tips.name = zltalent.talentDesc.name;
				tips.desc = StringUtils.replace(zltalent.talentDesc.desc, `${zltalent.rate / 100}`);
			}
		}
		this.currentState = state;
		this.validateNow();
		this.skillName0.textFlow = TextFlowMaker.generateTextFlow1(tips.name);
		this.skillDesc0.textFlow = TextFlowMaker.generateTextFlow1(tips.desc);
		if (!tips.lock)//已激活 lock为空 技能移除解锁标识
			DisplayUtils.removeFromParent(this.condition0.parent);
		else
			this.condition0.textFlow = TextFlowMaker.generateTextFlow1(tips.lock);
		if (ntips.name) {
			if (state == "active") {
				this.skillName1.textFlow = TextFlowMaker.generateTextFlow1(ntips.name);
				this.skillDesc1.textFlow = TextFlowMaker.generateTextFlow1(ntips.desc);
				if (!ntips.lock)//已激活 lock为空 技能移除解锁标识
					DisplayUtils.removeFromParent(this.condition1.parent);
				else
					this.condition1.textFlow = TextFlowMaker.generateTextFlow1(ntips.lock);
			} else {
				DisplayUtils.removeFromParent(this.nextGroup);
			}
		}


	}

	public close(...param: any[]): void {
		this.removeEventListener(egret.TouchEvent.TOUCH_END, this.otherClose, this);
	}

	private otherClose(e: egret.TouchEvent) {
		ViewManager.ins().close(this);
	}

}

ViewManager.ins().reg(ZhanLingTips, LayerManager.UI_Popup);
