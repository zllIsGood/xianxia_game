
/**
 * @Author Ade
 */

class SkillDataModel {
	/** 图标 */
	icon: string;
	/** 技能名称 */
	skillName: string;
	/** 技能描述 */
	desc: string;
	/** 等级, 大招不需要这个字段  */
	lv: number;
	/** 消耗多少金币, 大招不需要这个字段 */
	cost: number;
	/** 是不是大招 */
	isBigSkill: boolean;
	/** 神兵技能ID */
	skillId: number;

	public static initWithSkillData(skillLevel: SkillData): SkillDataModel {
		let skillDataModel = new SkillDataModel();
		skillDataModel.icon = skillLevel.icon;
		skillDataModel.lv = skillLevel.lv;
		skillDataModel.skillName = skillLevel.name + "";
		skillDataModel.desc = skillLevel.desc;
		if (skillLevel.lv > 0) {
			skillDataModel.cost = GlobalConfig.SkillsUpgradeConfig[skillLevel.lv].cost;
		}
		skillDataModel.isBigSkill = false;
		return skillDataModel;
	}

	public static initWithGodWeaponLineConfig(skill: GodWeaponLineConfig, skillId: number): SkillDataModel  {
		let skillDataModel = new SkillDataModel();
		skillDataModel.icon = `gwskill_json.${skill.iconId}_N`;
		skillDataModel.lv = skill.upLevel;
		skillDataModel.skillName = skill.skillName + "";
		skillDataModel.desc = skill.lockDesc;
		skillDataModel.cost = 0;
		skillDataModel.isBigSkill = true;
		/** 要减去1, 才能和神器技能对的上... */
		skillDataModel.skillId = skillId;
		return skillDataModel;
	}
}

class SkillPanel extends BaseView {

	/** 当前选中技能的图片 */
	private icon: eui.Image;
	/** 当前选中技能名称 */
	private skillName: eui.Label;
	/** 当前选中技能详情 */
	private skillDesc: eui.Label;
	/** 全部升级 */
	private grewUpAllBtn: eui.Button;
	/** 升级 */
	private grewUpBtn: eui.Button;
	/** 需要消耗金币 */
	private costAll: eui.Label;
	/** 金币图 */
	private coinIcon1: eui.Image;
	/** 神兵技能未激活提示 */
	private sbskill: eui.Label;

	private skillItem8: eui.Component;
	private skillItem7: eui.Component;
	private skillItem6: eui.Component;
	private skillItem5: eui.Component;
	private skillItem4: eui.Component;
	private skillItem3: eui.Component;
	private skillItem2: eui.Component;
	private skillItem1: eui.Component;

	public curRole: number = 0;

	private curIndex: number = 0;

	private mc: MovieClip;

	private skillDataList: SkillDataModel[] = [];

	private kAllItemCount: number = 8;

	constructor() {
		super();
		this.skinName = "SkillSkin";
	}

	public init(): void {
		this.curRole = 0;
	}

	public open(...param: any[]): void {

		/** 添加按钮点击事件 */
		this.addTouchEvent(this.grewUpBtn, this.handleGrewUpBtnTapped);
		this.addTouchEvent(this.grewUpAllBtn, this.handleAllGrewUpBtnTapped);

		/** 添加item点击事件 */
		this.addItemTouchEvent();

		/** 监听事件 */
		this.observe(UserSkill.ins().postSkillUpgradeAll, this.grewupAllSkillCB);

		/** 设置界面数据 */
		this.updateAllSkillItemAndDesc();
	}

	public close(...param: any[]): void {

		this.removeTouchEvent(this.grewUpAllBtn, this.handleAllGrewUpBtnTapped);
		this.removeTouchEvent(this.grewUpBtn, this.handleGrewUpBtnTapped);

		this.removeObserve();
	}

	/** 这个方法不知道有什么用 */
	public setRoleId(id: number) {
		this.curRole = id;
		this.updateAllSkillItemAndDesc();
	}

	/** Touch Event */
	private handleGrewUpBtnTapped(event: egret.TouchEvent) {
		/** 需要升级的技能 */
		this.onSendUpgrade(this.curIndex);
		/** 播放音效 */
		SoundUtil.ins().playEffect(SoundUtil.SKILL_UP);
		/** 更新数据源 */
		this.setSkillData();
		/** 更新itemUI显示 */
		this.updateItemUI(this.curIndex);
		/** 更新金币数显示 */
		this.updateCostUI();
	}

	private handleAllGrewUpBtnTapped(event: egret.TouchEvent) {

		/** 需要升级的技能 */
		this.onSendUpgrade(0, true);
		/** 播放音效 */
		SoundUtil.ins().playEffect(SoundUtil.SKILL_UP);
		/** 更新所有数据 */
		this.updateAllSkillItemAndDesc();
	}

	private handleSelectItemTapped(event: egret.TouchEvent) {

		/** 判断点击了哪个item */
		let level: number = UserSkill.ins().getSkillLimitLevel();
		switch (event.currentTarget) {
			case this.skillItem1:
				if (level < GlobalConfig.SkillsOpenConfig[1].level)
					return;
				this.curIndex = 0;
				break;
			case this.skillItem2:
				if (level < GlobalConfig.SkillsOpenConfig[2].level)
					return;
				this.curIndex = 1;
				break;
			case this.skillItem3:
				if (level < GlobalConfig.SkillsOpenConfig[3].level)
					return;
				this.curIndex = 2;
				break;
			case this.skillItem4:
				if (level < GlobalConfig.SkillsOpenConfig[4].level)
					return;
				this.curIndex = 3;
				break;
			case this.skillItem5:
				if (level < GlobalConfig.SkillsOpenConfig[5].level)
					return;
				this.curIndex = 4;
				break;
			case this.skillItem6:
				this.curIndex = 5;
				break;
			case this.skillItem7:
				this.curIndex = 6;
				break;
			case this.skillItem8:
				this.curIndex = 7;
				break;
		}
		/** 更新item选中样式 */
		this.changeSelectedUI();

		/** 更新技能介绍 */
		this.updateSkillIntroduce();

		/** 更新金币以及两个升级按钮显示 */
		this.updateCostUI();
	}

	/** Private Methods */
	private onSendUpgrade(skillIndex: number, isAll: boolean = false) {
		UserSkill.ins().sendGrewUpAllSkill(this.curRole, isAll, skillIndex);
	}

	private addItemTouchEvent() {

		for (let i = 0; i < this.kAllItemCount; i++) {
			let index = i+ 1;
			let skillItem = this["skillItem" + index];
			this.addTouchEvent(skillItem, this.handleSelectItemTapped);
		}
	}

	private updateAllSkillItemAndDesc() {
		/** 初始化数据 */
		this.skillDataList = [];
		this.curIndex = 0;
		DisplayUtils.removeFromParent(this.mc);
		this.mc = null;

		this.setSkillData();
		this.updateSkillIntroduce();
		this.changeSelectedUI();
		this.updateCostUI();

		this.grewAllAddEff();
	}

	public isUpGrade: boolean;
	private setSkillData() {
		
		for (let i = 0; i < this.kAllItemCount; i++) {
			
			let index = i + 1;
			if (i < 5) {
				/** 技能 */
				this.isUpGrade = false;
				let skillItem: eui.Component = this["skillItem" + index];
				let role: Role = SubRoles.ins().getSubRoleByIndex(this.curRole);
				if (!role) return;

				let skillLevel = role.skillsData[i];
				skillItem["icon"].source = skillLevel.icon;
				skillItem["skillName"].text = skillLevel.name + "";

				/** 转成model保存 */
				this.skillDataList.push(SkillDataModel.initWithSkillData(skillLevel));
		
			} else {
				
				/** 获取角色 */
				let role: Role = SubRoles.ins().getSubRoleByIndex(this.curRole);
				
				if (role.job == JobConst.None) { return; }

				/** 大招 */
				let data: GodWeaponLineConfig[] = GlobalConfig.GodWeaponLineConfig[role.job];
				let allKeys = Object.keys(data);
				for (let i in data) {

					if (data[i].bigskill == 1) {
						/** 要减去1, 才能和神器技能对的上... */
						this.skillDataList.push(SkillDataModel.initWithGodWeaponLineConfig(data[i], Number(allKeys[i]) - 1));
					}
				}
			}

			this.updateItemUI(i);
		}
	}

	/** 全部升级按钮添加特效 */
	private grewAllAddEff() {
		if (this.grewUpAllBtn.visible && this.isUpGrade) {
			if (!this.mc) {
				this.mc = new MovieClip;
				this.mc.x = this.grewUpAllBtn.width / 2;
				this.mc.y = this.grewUpAllBtn.height / 2;
				// this.mc.scaleX = this.mc.scaleY = 0.8;
				this.grewUpAllBtn.addChild(this.mc);
				this.mc.playFile(RES_DIR_EFF + "chargeff1", -1);
			}
		}
	}

	private updateItemUI(i: number) {
		let index = i + 1;
		/** 需要更新的item */
		let skillItem = this['skillItem' + index];
		/** 需要设置的数据源 */
		let model = this.skillDataList[i];

		/** 是不是大招 */
		if (model.isBigSkill) {
			
			if (this.isOpenWeapon(model.skillId)) {
				skillItem['lock'].visible = false;
				skillItem['lockimg'].visible = false;
			} else {
				skillItem['lock'].visible = true;
				skillItem['lockimg'].visible = true;
			}

			skillItem["skillName"].text = model.skillName;
			skillItem["icon"].source = model.icon;

		} else {
			
			if (model.lv <= 0) {
				if (UserSkill.ins().getSkillLimitLevel() >= GlobalConfig.SkillsOpenConfig[index].level) {
					skillItem['lock'].textColor = 0X00FD61;
					skillItem['lock'].text = "开启";
				} else {
					skillItem['lock'].textColor = 0XFD000A;
					skillItem['lock'].text = GlobalConfig.SkillsOpenConfig[index].level + "级开启";
				}
				skillItem['lock'].visible = true;
				skillItem["lv"].text = "";
			} else {
				skillItem['lock'].visible = false;
				skillItem["lv"].text = "Lv." + model.lv + "";
			}
		}
	}

	private updateSkillIntroduce() {
		let model = this.skillDataList[this.curIndex];
		this.icon.source = model.icon;
		this.skillName.text = model.skillName;
		this.skillDesc.textFlow = TextFlowMaker.generateTextFlow1(model.desc + "");
	}

	private changeSelectedUI(): void {
		for (let i = 0; i < this.kAllItemCount; i++) {
			let index = i + 1;
			let skillItem: eui.Component = this["skillItem" + index];
			skillItem["select"].visible = (i == this.curIndex);
		}
	}

	private updateCostUI() {
		let model = this.skillDataList[this.curIndex];
		let roleLevel: number = Actor.level;
		let coin: number = Actor.gold;
		
		if (model.isBigSkill) {
			this.grewUpAllBtn.visible = false;
			this.grewUpBtn.visible = false;
			this.costAll.visible = false;
			this.coinIcon1.visible = false;
			
			this.sbskill.visible = !this.isOpenWeapon(model.skillId);
		} else {
			this.sbskill.visible = false;
			this.grewUpAllBtn.visible = true;
			this.grewUpBtn.visible = true;
			this.costAll.visible = true;
			this.coinIcon1.visible = true;

			if (model.lv >= UserSkill.ins().getSkillLimitLevel()) {

				this.grewUpBtn.enabled = false;
	
				let skillLevel = SubRoles.ins().getSubRoleByIndex(this.curRole).skillsData[this.curIndex];
				if (skillLevel.lv >= UserSkill.MAX_LEVEL) {
					this.grewUpBtn.labelDisplay.text = "已满级";
					this.costAll.visible = this.coinIcon1.visible = false
				} else {
					let ins: UserZs = UserZs.ins();
					if (model.lv >= 80) {
						this.grewUpBtn.labelDisplay.text = (ins.lv + 1) + "转可升";
					} else {
						this.grewUpBtn.labelDisplay.text =  (roleLevel + 1) + "级可升";
					}
				}
	
				if (model.cost <= coin) {
					this.costAll.textColor = 0x35e62d;
					this.costAll.text = `${model.cost}`;
				}
				else {
					this.costAll.textColor = 0XFD000A;
					this.costAll.text = `${model.cost}`;
				}
			}
			else {
				
				// 当前未满，显示升级消耗
				let costAllNum = UserSkill.ins().getSingleSkillGrewUpCost(this.curRole, this.curIndex);
				this.grewUpBtn.labelDisplay.text = "升级";

				if (costAllNum > 0) {
					this.isUpGrade = true;
					this.costAll.textColor = 0x35e62d;
					this.costAll.text = `${costAllNum}`;
					this.grewUpBtn.enabled = true;
				}
				else {
					this.costAll.textColor = 0XFD000A;
					this.costAll.text = `${model.cost}`;
					this.grewUpBtn.enabled = false;
				}
			}
		}
	}

	private isOpenWeapon(skillId: number): boolean {
		
		/** 获取角色 */
		let role: Role = SubRoles.ins().getSubRoleByIndex(this.curRole);
		let weaponDataAry = GodWeaponCC.ins().weaponDataAry;
		if (weaponDataAry.length == 0) { return false; }

		// 这里拿到的是角色是否有开启神兵技能
		let weaponIds = weaponDataAry.map( (item) => item.weaponId );
		if (weaponIds.indexOf(role.job) > -1) {
			
			let flag: boolean = false;

			for(let i in weaponDataAry) {

				let weaponData = weaponDataAry[i];
				if (weaponData.weaponId == role.job) {

					if (weaponData.openSkillAry.length == 0) { return false; }
					// 拿到具体是开启了哪个神兵技能
					let openSkillIds = weaponData.openSkillAry.map((item) => item.skillId);
					flag = (openSkillIds.indexOf(skillId) > -1);

				} else {
					continue;
				}
			}

			return flag;

		} else {
			return false;
		}
	}
	
	private grewupAllSkillCB(upData: [SkillData[], number]) {
		let old: SkillData[] = upData[0];
		if (upData[1] != this.curRole) return;//解决在网络不佳情况下切换其他角色报错bug
		let role: Role = SubRoles.ins().getSubRoleByIndex(this.curRole);
		for (let i = 0; i < Math.min(old.length, role.skillsData.length); i++) {
			if (old[i].lv && old[i].lv < role.skillsData[i].lv) {
				this.grewupTip(old[i], role.skillsData[i], i);
			}
		}
		this.updateAllSkillItemAndDesc();
		DisplayUtils.removeFromParent(this.mc);
		this.mc = null;
	}

	private grewupTip(skillold: SkillData, skill: SkillData, compIndex: number) {
		let str: string = "";
		let label: eui.Label = new eui.Label;
		label.size = 20;
		label.textColor = 0x20cb30;
		let addAttack: number;
		if (skill.args) {
			if (skillold.args) {
				addAttack = skill.args.b - skillold.args.b;
				str = `增加${addAttack}点伤害`;
			} else {
				Assert(false, `SkillPanel.grewupTip() skillold.args is null!!新技能：id(${skill.id}),lv(${skill.lv}) 旧技能：id(${skillold.id}),lv(${skillold.lv})`);
			}
		} else {
			if (skillold.tarEff && skill.tarEff) {
				let effectsCfg = GlobalConfig.EffectsConfig[skillold.tarEff[0]];
				let nextEffectsCfg = GlobalConfig.EffectsConfig[skill.tarEff[0]];
				let sId: number = Math.floor(skill.id / 1000);
				switch (sId) {
					case SHORT_SKILLID.MAGIC:
						addAttack = Math.ceil((nextEffectsCfg.args.d - effectsCfg.args.d) * 1000) / 10;
						str = `伤害减免增加${addAttack}%`;
						break;
					case SHORT_SKILLID.CURE:
						addAttack = nextEffectsCfg.args.c - effectsCfg.args.c;
						str = `增加${addAttack}点治疗量`;
						break;
					case SHORT_SKILLID.POISONING:
						//因为毒的技能有两个效果 击退和扣血，所以需要特殊处理读第二个buff	
						effectsCfg = GlobalConfig.EffectsConfig[skillold.tarEff[1]];
						nextEffectsCfg = GlobalConfig.EffectsConfig[skill.tarEff[1]];
						addAttack = nextEffectsCfg.args.c - effectsCfg.args.c;
						str = `每秒失去${addAttack}点生命`;
						break;
					case SHORT_SKILLID.ARMOR:
						addAttack = nextEffectsCfg.args.c - effectsCfg.args.c;
						str = `增加${addAttack}点物防和魔防`;
						break;
					case SHORT_SKILLID.SUMMON:
						addAttack = nextEffectsCfg.args.a - effectsCfg.args.a;
						str = `神兽等级增加${addAttack}`;
						break;
				}
				addAttack = nextEffectsCfg.args.d - effectsCfg.args.d
			} else if (skill.tarEff) {
				Assert(false, `SkillPanel.grewupTip() skillold.tarEff is null!!新技能：id(${skill.id}),lv(${skill.lv}) 旧技能：id(${skillold.id}),lv(${skillold.lv})`);
			}
		}

		let skillItem = this['skillItem' + (compIndex + 1)];
		// label.text = str;
		// let x = skillItem.x + skillItem.width / 2 - label.textWidth / 2;
		// let y = skillItem.y + skillItem.height / 4;
		// label.x = x;
		// label.y = y;
		// this.addChild(label);

		let mc = new MovieClip;
		mc.x = skillItem.x + skillItem.width / 2;
		mc.y = skillItem.y + skillItem.height / 4;
		mc.playFile(RES_DIR_EFF + "forgeSuccess", 1);
		this.addChild(mc);

		// let t: egret.Tween = egret.Tween.get(label);
		// t.to({ "y": label.y - 45 }, 600).wait(1000).call(() => {
		// 	this.removeChild(label);
		// }, this);
	}

}