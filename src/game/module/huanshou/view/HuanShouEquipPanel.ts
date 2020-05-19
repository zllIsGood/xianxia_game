class HuanShouEquipPanel extends BaseView {
	private power: eui.Group;
	private equipname: eui.Label;
	private desc: eui.Label;
	private skilldesc: eui.Label;
	// private skill: eui.Group;
	private skillIcon0: eui.Image;
	private skillName0: eui.Label;

	private pos0: HuanShouEquipItem;
	private pos2: HuanShouEquipItem;
	private pos4: HuanShouEquipItem;
	private pos3: HuanShouEquipItem;
	private pos5: HuanShouEquipItem;
	private pos1: HuanShouEquipItem;
	private attrLabel0: eui.Label;
	private name2: eui.Label;
	private name1: eui.Label;
	private nextAttrLabel0: eui.Label;
	private blackImg0: eui.Image;

	private getItemTxt0: eui.Label;
	private jihuo0: eui.Button;
	private huanshou: eui.Group;
	private jihuoRedPoint: eui.Group;
	private xiangxishuxing: eui.Button;

	public powerPanel: PowerPanel;
	private hsMC: HuanShouMc;

	private ins: UserHuanShou;
	private equipList: HuanShouEquipItem[];

	private selectPos: number = -1;

	constructor() {
		super();
		this.skinName = "huanShouEquipSkin";
		this.name = "装备";
	}

	public childrenCreated(): void {
		this.init();
	}


	public open(): void {
		if (!UserHuanShou.ins().rank)
			return;
		this.ins = UserHuanShou.ins();

		for (let i = 0; i < this.equipList.length; i++) {
			this.addTouchEvent(this.equipList[i], this.onPos);
		}
		this.addTouchEvent(this.jihuo0, this.onTap);
		this.addTouchEvent(this.skillIcon0, this.onTap);
		this.addTouchEvent(this.getItemTxt0, this.onTap);
		this.addTouchEvent(this.xiangxishuxing, this.onTap);

		this.observe(this.ins.postUpdateEquip, this.onUpdateEquip);
		this.observe(HuanShouRedPoint.ins().postEquipListRed, this.updateRed);

		this.setHsMC();
		this.onUpdateEquip();
		this.updateRed();
	}

	public close(): void {

	}

	private init(): void {
		this.getItemTxt0.textFlow = TextFlowMaker.generateTextFlow1(`|U:&T:${this.getItemTxt0.text}|`);

		this.hsMC = new HuanShouMc();
		this.huanshou.addChild(this.hsMC);
		this.equipList = [this.pos0, this.pos1, this.pos2, this.pos3, this.pos4, this.pos5];
	}

	private setHsMC(): void {
		let conf: HuanShouStageConf = GlobalConfig.HuanShouStageConf[this.ins.rank];
		let avatar: string = conf.avatar ? conf.avatar : GlobalConfig.MonstersConfig[conf.monsterId].avatar;
		this.hsMC.setData(avatar);
		if (conf.xy) {
			this.hsMC.x = conf.xy[0];
			this.hsMC.y = conf.xy[1];
		} else {
			this.hsMC.x = 0;
			this.hsMC.y = 0;
		}
	}

	private onUpdateEquip(): void {
		let len = this.equipList.length;
		let power = 0;
		let suitCount: number = 0;
		let suitCountList = {};
		for (let i = 0; i < len; i++) {
			let eData = this.ins.equipList[i];
			this.equipList[i].data = eData;
			if (eData.equipId) {
				let conf = this.ins.getEquipConfById(eData.equipId);
				power += UserBag.getAttrPower(conf.attrs);
				if (conf.percent_attrs) {
					power += conf.expower;
				}
				if (isNaN(suitCountList[conf.stage])) {
					suitCountList[conf.stage] = 0;
				}
				suitCountList[conf.stage]++;
				if (this.ins.equipSuitLevel == 0 || conf.stage >= this.ins.equipSuitLevel) {
					suitCount++;
				}
			}
		}
		let suitConf: HuanShouSuitConf;
		let skillName: string;
		if (this.ins.equipSuitLevel > 0) {
			suitConf = GlobalConfig.HuanShouSuitConf[this.ins.equipSuitLevel];
			power += suitConf.expower;
			this.blackImg0.visible = false;
		} else {
			suitConf = GlobalConfig.HuanShouSuitConf[1];//默认显示一级数据
			skillName = `(未激活)`;
			this.blackImg0.visible = true;
		}
		let nextConf = GlobalConfig.HuanShouSuitConf[this.ins.equipSuitLevel + 1];
		let conf = GlobalConfig.SkillsConfig[suitConf.skillId];
		let descConf = GlobalConfig.SkillsDescConfig[conf.desc];
		this.skilldesc.text = descConf ? descConf.desc : ``;
		this.skillName0.text = skillName ? skillName : conf.skinName;
		this.skillIcon0.source = new SkillData(conf.id).icon;
		if (nextConf) {
			let str = this.ins.equipSuitLevel ? `升级` : `激活`;
			if (suitCount == len) {
				//当前套装等级条件已达到，显示下级数据
				suitCount = 0;
				for (let key in suitCountList) {
					let stage = parseInt(key);
					if (stage >= this.ins.equipSuitLevel + 1) {
						suitCount += suitCountList[key];
					}
				}
			}
			this.desc.text = `收集全套${nextConf.stage}阶幻兽装备可${str}（${suitCount}/${len}）`;
			this.getItemTxt0.visible = true;
		} else {
			this.desc.text = ``;
			this.getItemTxt0.visible = false;
		}

		this.powerPanel.setPower(power * SubRoles.ins().subRolesLen);
		if (this.selectPos == -1) {
			this.selectPos = 1;
		}
		this.setState();
		this.updateSelectPos();
		this.updateAttrAndPower();
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.jihuo0:
				if (this.jihuoRedPoint.visible) {
					let len = this.equipList.length;
					for (let i = 0; i < len; i++) {
						let id2: number = this.ins.getEquipByPos(i + 1);
						if (!isNaN(id2) && id2 > 0)
							UserHuanShou.ins().sendOperationEquip(i + 1, id2);
					}
				} else {
					UserTips.ins().showTips(`没有可穿戴装备`);
				}

				break;
			case this.getItemTxt0:
				let id = this.ins.getNextEquipIdByPos(this.selectPos);
				if (id > 0)
					UserWarn.ins().setBuyGoodsWarn(id);
				break;
			case this.skillIcon0:
				ViewManager.ins().open(HuanShouEquipSkillTIps);
				break;
			case this.xiangxishuxing:
				ViewManager.ins().open(HuanShouEquipAttrWin);
				break;
		}
	}

	private onPos(e: egret.TouchEvent): void {
		let item = e.currentTarget as HuanShouEquipItem;
		let eData = item.data as HsEquipData;
		if (this.selectPos == eData.pos)
			return;
		this.selectPos = eData.pos;
		this.setState();
		this.updateSelectPos();
		this.updateAttrAndPower();
	}

	private updateSelectPos(): void {
		let len = this.equipList.length;
		for (let i = 0; i < len; i++) {
			this.equipList[i].select(this.selectPos == i + 1);
		}
	}

	private updateRed(): void {
		let redList = HuanShouRedPoint.ins().equipListRed;
		let len = this.equipList.length;
		let red = false;
		for (let i = 0; i < len; i++) {
			if (redList[i])
				red = true;
			this.equipList[i].setredPoint(redList[i]);
		}

		this.jihuoRedPoint.visible = red;
	}

	private setState(): void {
		let eData = this.equipList[this.selectPos - 1].data as HsEquipData;
		if (eData.equipId) {
			let nextConf = this.ins.getNextEquipConfByCurrId(eData.equipId);
			this.currentState = nextConf ? `nomal` : `disboard`;
		} else {
			this.currentState = `disboard`;
		}
		this.validateNow();
	}

	private updateAttrAndPower(): void {
		let eData = this.equipList[this.selectPos - 1].data as HsEquipData;
		let conf: HuanShouEquipConf;
		let nextConf: HuanShouEquipConf;
		if (eData.equipId) {
			conf = this.ins.getEquipConfById(eData.equipId);
			nextConf = this.ins.getNextEquipConfByCurrId(eData.equipId);

		} else {
			let ids = this.ins.getEquipIdByStageByPos(eData.pos, 1);
			conf = this.ins.getEquipConfById(ids[0]);
		}
		let str = AttributeData.getAttStr(conf.attrs, 0.5, 1, ":");
		let power: number = UserBag.getAttrPower(conf.attrs);
		if (conf.percent_attrs) {
			str += "\n";
			for (let key in conf.percent_attrs) {
				let temp = conf.percent_attrs[key];
				str += AttributeData.getCustomAttName(temp.type, `加成`, ":");
				str += (temp.percent / 100) + `%`;
				str += "\n";
			}
			power += conf.expower;
		}
		this.attrLabel0.text = str;
		this.name1.text = `战斗力:${power}`;
		let itemConf = GlobalConfig.ItemConfig[conf.equipId];
		this.equipname.text = itemConf.name;
		if (nextConf) {
			let str = AttributeData.getAttStr(nextConf.attrs, 0.5, 1, ":");
			let power: number = UserBag.getAttrPower(nextConf.attrs);
			if (nextConf.percent_attrs) {
				str += "\n";
				for (let key in nextConf.percent_attrs) {
					let temp = nextConf.percent_attrs[key];
					str += AttributeData.getCustomAttName(temp.type, `加成`, ":");
					str += (temp.percent / 100) + `%`;
					str += "\n";
				}
				power += nextConf.expower;
			}
			this.nextAttrLabel0.text = str;
			this.name2.text = `战斗力:${power}`;
		} else {
			this.nextAttrLabel0.text = ``;
			this.name2.text = ``;
		}
	}

}
