/**
 * 轮回装备TIPS
 * Created by Peach.T on 2017/11/29.
 */
class SamsaraEquipTips extends BaseEuiView {
	public bgClose: eui.Rect;
	public anigroup: eui.Group;
	public background: eui.Image;
	public quali: eui.Image;
	public nameLabel: eui.Label;
	public score: eui.Label;
	public type: eui.Label;
	public lv: eui.Label;
	public career: eui.Label;
	public itemIcon: ItemIcon;
	public powerPanel: PowerPanel;
	public baseGroup: eui.Group;
	public attr0: eui.Label;
	public attr1: eui.Label;
	public attr2: eui.Label;
	public attr3: eui.Label;
	public attr4: eui.Label;
	public attr5: eui.Label;
	public spiritGroup: eui.Group;
	public spiritLv: eui.Label;
	public spiritCost: eui.Label;
	public attr6: eui.Label;
	public attr7: eui.Label;
	public attr8: eui.Label;
	public attr9: eui.Label;
	public suitGroup: eui.Group;
	public suitName: eui.Label;
	public suitNum: eui.Label;
	public suitState: eui.Label;
	public attr12: eui.Label;
	public attr13: eui.Label;
	public attr14: eui.Label;
	public attr15: eui.Label;
	public attr16: eui.Label;
	public spiritBtn: eui.Button;
	public soulBtn: eui.Button;
	public attrDesc: eui.Label;
	public attrDesc1: eui.Label;
	public redPoint: eui.Image;
	public redPoint1: eui.Image;
	public soulAddAttr0: eui.Label;
	public soulAddAttr1: eui.Label;
	public soulAddAttr2: eui.Label;
	public soulAddAttr3: eui.Label;
	public soulAddAttr4: eui.Label;
	public chainGroup: eui.Group;
	public soulGroup: eui.Group;
	public btnGroup: eui.Group;
	public chainLv: eui.Label;
	public soulLv: eui.Label;
	public chainPos: eui.Label;
	public chainAttr: eui.Label;
	public chainState: eui.Label;
	public chainValue: eui.Label;
	public soulAttr: eui.Label;
	public chainName: eui.Label;

	private roleIndex;
	private index;
	private roleModel: Role;

	constructor() {
		super();
		this.skinName = "ReincarnateEquipTipsSkin";
	}

	public open(...param: any[]): void {
		if (param[1] != undefined) {
			this.roleIndex = -1;
			this.roleModel = param[1];
			this.index = param[2];
			let roleIndex = param[0];
			let isSelfRole:boolean = false;
			if (roleIndex >= 0 && roleIndex <= SubRoles.ins().subRolesLen-1){
				let temp = SubRoles.ins().getSubRoleByIndex(roleIndex);
				if (temp.handle == this.roleModel.handle){
					isSelfRole = true;
					this.roleIndex = this.roleModel.index;
				}
			}
			let data: EquipsData = this.roleModel.getEquipByIndex(this.index);
			this.setData(data);

			if (isSelfRole) {
				this.addTouchEvent(this.spiritBtn, this.addSpirit);
				this.addTouchEvent(this.soulBtn, this.addSoul);

				this.spiritBtn.visible = true;
				this.soulBtn.visible = true;
			} else {
				this.spiritBtn.visible = false;
				this.soulBtn.visible = false;
			}
		} 
		else {
			this.setTips(param[0]);
		}
		this.addTouchEvent(this.bgClose, this.closeWin);
	}

	private setTips(itemId: number): void {
		this.spiritBtn.visible = false;
		this.soulBtn.visible = false;
		this.redPoint.visible = false;
		this.redPoint1.visible = false;
		let itemConfig: ItemConfig = GlobalConfig.ItemConfig[itemId];
		let q = ItemConfig.getQuality(itemConfig);
		let subType = ItemConfig.getSubType(itemConfig);
		let job = ItemConfig.getJob(itemConfig);
		this.nameLabel.text = itemConfig.name;
		this.nameLabel.textColor = ItemConfig.getQualityColor(itemConfig);
		this.quali.source = q > 0 ? `common1_tips_${q}` : "";
		this.itemIcon.setData(itemConfig);
		this.type.text = Role.getEquipNameByType(subType);//部位
		this.lv.text = `${itemConfig.zsLevel}转`;//穿戴要求转生数
		this.lv.textColor = UserZs.ins().lv < itemConfig.zsLevel ? 0xf3311e : 0x35e62d;
		this.career.text = Role.getJobNameByJob(job)//职业

		let itemData: ItemData = new ItemData();
		itemData.itemConfig = itemConfig;
		let power = ItemConfig.calculateBagItemScore(itemData); //设置战斗力
		this.powerPanel.setPower(power);
		this.score.text = `评分：${power}`;
		let equipCfg = GlobalConfig.EquipConfig[itemConfig.id];
		let isHat;
		if (subType == EquipPos.HAT) {
			this.currentState = "noSpirit0";
			isHat = true;
		} else {
			isHat = false;
			this.currentState = "noSpirit1";
		}
		this.attr0.text = equipCfg.atk.toString(); //填充基础属性
		this.attr1.text = equipCfg.hp.toString();
		this.attr2.text = equipCfg.def.toString();
		this.attr3.text = equipCfg.res.toString();
		this.attr4.text = equipCfg.exAttr1.value.toString();
		if (isHat) this.attr5.text = equipCfg.exAttr2.value / 100 + "%";

		let equipSamsaraLv = SamsaraModel.ins().getEquipSamsaraLv(itemConfig.id);//填充套装属性
		let desc = SamsaraModel.ins().getSamsaraDesc(equipSamsaraLv - 1);
		let suitCfg = SamsaraModel.ins().getReincarnateSuit(itemConfig.id);
		this.suitName.text = `${desc}套装`;
		this.attr12.text = this.getValue(suitCfg.attrs, AttributeType.atAttack);
		this.attr13.text = this.getValue(suitCfg.attrs, AttributeType.atMaxHp);
		this.attr14.text = this.getValue(suitCfg.attrs, AttributeType.atDef);
		this.attr15.text = this.getValue(suitCfg.attrs, AttributeType.atRes);
		this.attr16.text = suitCfg.exAttrs[0].value / 100 + "%";//套装的必杀伤害

		let itemType: number[] = [0, 0, 0, 0];//设置套装文本颜色
		switch (subType) {
			case EquipPos.HAT:
				itemType[0] = 1;
				break;
			case EquipPos.VIZARD:
				itemType[1] = 1;
				break;
			case EquipPos.CLOAK:
				itemType[2] = 1;
				break;
			case EquipPos.SHIELD:
				itemType[3] = 1;
				break;

		}
		let cor1 = itemType[0] ? ColorUtil.GREEN_COLOR : "0xff0000";
		let cor2 = itemType[1] ? ColorUtil.GREEN_COLOR : "0xff0000";
		let cor3 = itemType[2] ? ColorUtil.GREEN_COLOR : "0xff0000";
		let cor4 = itemType[3] ? ColorUtil.GREEN_COLOR : "0xff0000";
		this.suitState.textFlow = TextFlowMaker.generateTextFlow(`<font color=${cor1}>${Role.getEquipNameByType(EquipPos.HAT)}、</font><font color=${cor2}>${Role.getEquipNameByType(EquipPos.VIZARD)}、</font><font color=${cor3}>${Role.getEquipNameByType(EquipPos.CLOAK)}、</font><font color=${cor4}>${Role.getEquipNameByType(EquipPos.SHIELD)}</font>`);
		this.suitNum.textColor = 0xff0000;
		this.suitNum.text = "(1/4)";
		this.setSuitAttrTextColor(false);
	}
	
	private Data:ItemConfig;
	private setData(data: EquipsData): void {
		this.spiritBtn.visible = true;
		this.soulBtn.visible = true;

		this.redPoint.visible = this.roleIndex >= 0 && SamsaraModel.ins().checkEquipPosCanAddSpirit(this.roleModel, this.index);
		this.redPoint1.visible = this.roleIndex >= 0 && SamsaraModel.ins().checkUpgradeSoul(this.roleModel, this.index);

		let itemConfig: ItemConfig = data.item.itemConfig;
		let q = ItemConfig.getQuality(itemConfig);
		let subType = ItemConfig.getSubType(itemConfig);
		let job = ItemConfig.getJob(itemConfig);
		this.nameLabel.text = itemConfig.name;
		this.nameLabel.textColor = ItemConfig.getQualityColor(itemConfig);
		this.quali.source = q > 0 ? `common1_tips_${q}` : "";
		this.Data = itemConfig;
		this.itemIcon.setData(itemConfig);
		this.type.text = Role.getEquipNameByType(subType);//部位
		this.lv.text = `${itemConfig.zsLevel}转`;//穿戴要求转生数
		this.lv.textColor = UserZs.ins().lv < itemConfig.zsLevel ? 0xf3311e : 0x35e62d;
		this.career.text = Role.getJobNameByJob(job)//职业
		this.score.text = `评分：${data.item.point}`;

		let equipCfg = GlobalConfig.EquipConfig[itemConfig.id];
		let spiritLv = data.spiritLv;
		let isHat;
		if (spiritLv == 0 && data.spiritExp == 0) {
			if (this.index == EquipPos.HAT) {
				this.currentState = "noSpirit0";
				isHat = true;
			} else {
				this.currentState = "noSpirit1";
				isHat = false;
			}
		}
		else {
			let isMax = (spiritLv == CommonUtils.getObjectLength(GlobalConfig.ReincarnateSpirit[this.index]));
			if (this.index == EquipPos.HAT) {
				this.currentState = "doSpirit0";
				isHat = true;
			}
			else {
				this.currentState = "doSpirit1";
				isHat = false;
			}
			this.setSpirit(data.spiritExp, data.spiritLv, isMax, isHat);
		}

		this.attr0.text = equipCfg.atk.toString(); //填充基础属性
		this.attr1.text = equipCfg.hp.toString();
		this.attr2.text = equipCfg.def.toString();
		this.attr3.text = equipCfg.res.toString();
		this.attr4.text = equipCfg.exAttr1.value.toString();
		if (isHat) this.attr5.text = equipCfg.exAttr2.value / 100 + "%";

		let equipSamsaraLv = SamsaraModel.ins().getEquipSamsaraLv(itemConfig.id);//填充套装属性
		let desc = SamsaraModel.ins().getSamsaraDesc(equipSamsaraLv - 1);
		let suitCfg = SamsaraModel.ins().getReincarnateSuit(itemConfig.id);
		this.suitName.text = `${desc}套装`;
		this.attr12.text = this.getValue(suitCfg.attrs, AttributeType.atAttack);
		this.attr13.text = this.getValue(suitCfg.attrs, AttributeType.atMaxHp);
		this.attr14.text = this.getValue(suitCfg.attrs, AttributeType.atDef);
		this.attr15.text = this.getValue(suitCfg.attrs, AttributeType.atRes);
		this.attr16.text = suitCfg.exAttrs[0].value / 100 + "%";//套装的必杀伤害

		let itemType: number[] = SamsaraModel.ins().lowSuitEquips(this.index, this.roleModel);//设置套装文本颜色
		let cor1 = itemType[0] ? ColorUtil.GREEN_COLOR : "0xff0000";
		let cor2 = itemType[1] ? ColorUtil.GREEN_COLOR : "0xff0000";
		let cor3 = itemType[2] ? ColorUtil.GREEN_COLOR : "0xff0000";
		let cor4 = itemType[3] ? ColorUtil.GREEN_COLOR : "0xff0000";
		let count = 0;
		for (let i = 0; i < itemType.length; i++) {
			if (itemType[i]) count++;
		}
		this.suitState.textFlow = TextFlowMaker.generateTextFlow(`<font color=${cor1}>${Role.getEquipNameByType(EquipPos.HAT)}、</font><font color=${cor2}>${Role.getEquipNameByType(EquipPos.VIZARD)}、</font><font color=${cor3}>${Role.getEquipNameByType(EquipPos.CLOAK)}、</font><font color=${cor4}>${Role.getEquipNameByType(EquipPos.SHIELD)}</font>`);
		let isSuit = count == 4;
		let cor5 = isSuit ? ColorUtil.GREEN_COLOR_N : 0xff0000;
		this.suitNum.textColor = cor5;
		this.suitNum.text = `(${count}/4)`;
		this.setSuitAttrTextColor(isSuit);

		let power = data.item.point; //设置战斗力
		if (isSuit) {
			power += UserBag.getAttrPower(suitCfg.attrs);
		}
		if (spiritLv > 0) {
			let cfg = CommonUtils.getObjectByUnionAttr(GlobalConfig.ReincarnateSpirit, this.index, spiritLv);
			power += UserBag.getAttrPower(cfg.attrs);
		}
		this.powerPanel.setPower(power);

		//this.redPoint.visible = SamsaraModel.ins().checkEquipPosCanAddSpirit(this.roleIndex, this.index);
	}

	private setSuitAttrTextColor(isSuit: boolean): void {
		let color = isSuit ? 0xFF00FF : 0x666666;
		this.attr12.textColor = color;
		this.attr13.textColor = color;
		this.attr14.textColor = color;
		this.attr15.textColor = color;
		this.attr16.textColor = color;
		this.attrDesc.textColor = color;
		this.attrDesc1.textColor = color;
	}

	private setSpirit(exp: number, lv: number, isMax: boolean, isHat: boolean): void {
		let lvDesc;
		let cfg = CommonUtils.getObjectByUnionAttr(GlobalConfig.ReincarnateSpirit, this.index, lv);
		if (isMax) {
			lvDesc = "";
		}
		else {
			lvDesc = `(${exp}/${cfg.consume})`;
		}
		this.spiritLv.text = `Lv${lv}`;
		this.spiritCost.text = lvDesc;
		if (lv == 0) {
			this.attr6.text = "0";
			this.attr7.text = "0";
			this.attr8.text = "0";
			this.attr9.text = "0";
		} else {
			this.attr6.text = this.getValue(cfg.attrs, AttributeType.atAttack);//填充基础属性
			this.attr7.text = this.getValue(cfg.attrs, AttributeType.atMaxHp);
			this.attr8.text = this.getValue(cfg.attrs, AttributeType.atDef);
			this.attr9.text = this.getValue(cfg.attrs, AttributeType.atRes);
		}
		// this.attr10.visible = false;
		// this.attr11.visible = false;
	}

	private getValue(attrs: AttributeData[], typeValue: number): string {
		let obj = CommonUtils.getObjectByAttr(attrs, "type", typeValue);
		return obj.value.toString();
	}

	private addSpirit(): void {
		this.closeWin();
		ViewManager.ins().open(AddSpiritView, this.roleIndex, this.index);
	}

	private addSoul(): void {
		this.closeWin();
		ViewManager.ins().open(SamsaraSoulWin, this.roleIndex, this.index,this.Data);
	}

	/**
	 * 设置注魂属性
	 * @param soulLv
	 */
	private setSoulAttr(soulLv: number, id: number = 0, power: number = 0): number {
		if (soulLv == 0) {
			this["soulDescLable"].visible = false;
			this.soulAddAttr0.text = "";
			this.soulAddAttr1.text = "";
			this.soulAddAttr2.text = "";
			this.soulAddAttr3.text = "";
			this.soulAddAttr4.text = "";
		}
		else {
			this["soulDescLable"].visible = true;

			let equipCfg = GlobalConfig.EquipConfig[id];
			let atk = equipCfg.atk; //填充基础属性
			let hp = equipCfg.hp;
			let def = equipCfg.def;
			let res = equipCfg.res;
			let exAttr = equipCfg.baseAttr.value;
			let subType = ItemConfig.getSubType(GlobalConfig.ItemConfig[id]);
			let cfg = GlobalConfig.ReincarnationDemonLevel[subType][soulLv];
			let percent = cfg.precent / 10000;
			this.soulAddAttr0.text = Math.floor(atk * percent).toString();
			this.soulAddAttr1.text = Math.floor(hp * percent).toString();
			this.soulAddAttr2.text = Math.floor(def * percent).toString();
			this.soulAddAttr3.text = Math.floor(res * percent).toString();
			this.soulAddAttr4.text = Math.floor(exAttr * percent).toString();

			let holyAttr = 0;
			if (equipCfg.baseAttr1) {
				holyAttr = UserBag.getAttrPower([equipCfg.baseAttr1]);
			}
			power = (power - holyAttr) * (1 + percent) + holyAttr;
			if (soulLv > 0) {
				let data = GlobalConfig.ReincarnationSoulLevel[ItemConfig.getJob(GlobalConfig.ItemConfig[id])][subType][soulLv];
				power += UserBag.getAttrPower(data.attrs);
			}
			power = power >> 0;
		}
		return power;
	}

	/**
	 * 设置魔化属性 和 灵魂锁链属性
	 * @param soulLv
	 * @param soulLinlLv
	 */
	private setSoulLink(soulLv: number, soulLinlLv: number, itemId: number = 0, power: number = 0): number {
		if (soulLv == 0) {//注魂为0 必定没有灵魂锁链
			if (this.chainGroup.parent) {
				this.chainGroup.parent.removeChild(this.chainGroup);
			}
			if (this.soulGroup.parent) {
				this.soulGroup.parent.removeChild(this.soulGroup);
			}

		} else {//有注魂和灵魂锁链
			if (!this.chainGroup.parent) {
				this.suitGroup.parent.addChild(this.soulGroup);
			}
			if (!this.soulGroup.parent) {
				this.suitGroup.parent.addChild(this.soulGroup);
			}
		}

		this.soulLv.text = `Lv${soulLv}`;
		let showSoulLinlLv = soulLinlLv;
		if (soulLinlLv == 0) showSoulLinlLv = 1;
		this.chainLv.text = `Lv${showSoulLinlLv}`;

		if (itemId) {
			let subType = ItemConfig.getSubType(GlobalConfig.ItemConfig[itemId]);
			if (showSoulLinlLv > 0) {
				let cfg = SamsaraModel.ins().getReincarnationLinkLevel(subType, showSoulLinlLv);
				this.chainPos.text = `[魔魂${Role.getEquipNameByType(cfg.secondSlot)}]`;
				this.chainAttr.text = SamsaraModel.ins().getSoulLinkDesc(cfg.attrs[0].type);
				this.chainValue.text = (cfg.attrs[0].value / 100) + "%";

				let colour;
				if (soulLinlLv == 0) {
					colour = 0x666666;
				}
				else {
					colour = 0xFFFF00;
				}
				this.chainPos.textColor = colour;
				this.chainAttr.textColor = colour;
				this.chainState.textColor = colour;
				this.chainValue.textColor = colour;

				if (soulLinlLv > 0) {
					let role = SubRoles.ins().getSubRoleByIndex(this.roleIndex);
					let temp = UserBag.getAttrPower([cfg.attrs[0]]) + ItemConfig.relatePower(cfg.attrs[0], role);
					power += temp;
				}
			}
			if (soulLv > 0) {
				let demon = GlobalConfig.ReincarnationDemonLevel[subType][soulLv];
				let soulAttrDesc;
				let per = demon.precent / 100;
				per += 100;
				soulAttrDesc = per + "%";
				this.soulAttr.text = soulAttrDesc;
			}
		}
		return power;
	}


	public closeWin(): void {
		ViewManager.ins().close(this);
	}
}
ViewManager.ins().reg(SamsaraEquipTips, LayerManager.UI_Popup);