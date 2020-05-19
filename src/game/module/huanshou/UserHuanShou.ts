class UserHuanShou extends BaseSystem {
	//阶
	public rank: number = 0;
	//经验
	public exp: number = 0;
	//已点次数
	public level: number = 0;

	public changeIndex: number = -1;

	public maxSkillNum: number = 10;

	public posCount: number = 0;//已开孔位数量

	private _skills: HsSkillData[];
	/**主动技能列表 */
	private _activeSkillList: number[];

	private _isfirst: boolean = false;

	public huanShouHandle: number;

	public equipList: HsEquipData[];

	public equipSuitLevel: number;

	public qianNengCount: number = 0;
	public feiShengCount: number = 0;

	public equipLen: number = 6;

	public skinList: { [key: number]: HSSkinData };
	public skinChangeId: number = -1;

	private hsAttrs: AttributeData[] = [];//幻兽总属性
	private skinAttrs: AttributeData[] = [];//幻兽皮肤总属性
	public equipAttrs: AttributeData[] = [];//幻兽装备属性
	public equipPercent: any = {};//幻兽装备百分比属性加成
	public danAttrs: AttributeData[] = [];//丹属性
	public danPercent: any = {};//丹百分比属性加成

	public constructor() {
		super();

		this.sysId = PackageID.HuanShou;
		this.regNetMsg(1, this.postUpgrade);
		this.regNetMsg(2, this.postHuanShouChange);
		this.regNetMsg(5, this.postUpdateSkill);
		this.regNetMsg(6, this.postComposeSkill);
		this.regNetMsg(7, this.postHuanShouInfo);
		this.regNetMsg(8, this.postUpdateEquip);
		this.regNetMsg(9, this.postComposeEquip);
		this.regNetMsg(10, this.postUpdateDanInfo);
		this.regNetMsg(11, this.postSkinTrainInfo);
		this.regNetMsg(12, this.postTalentSkill);

		this.observe(GameLogic.ins().postEnterMap, this.onEnterMap);

		this.equipList = [];
		this.skinList = {};
	}

	public static ins(): UserHuanShou {
		return super.ins() as UserHuanShou;
	}

	public getTotalPower(): number{
		let rank = UserHuanShou.ins().rank;
		let exp = UserHuanShou.ins().exp;
		let level = UserHuanShou.ins().level;
		let conf: HuanShouStageConf = GlobalConfig.HuanShouStageConf[rank];
		let levelConf: HuanShouTrainConf = GlobalConfig.HuanShouTrainConf[level];
		let starAttrs: AttributeData[] = levelConf.attr || [];
		let levelAttrs: AttributeData[] = conf.attr || [];
		let attrs: AttributeData[] = AttributeData.AttrChangeAddition(starAttrs, levelAttrs);
		let nextAttrs: AttributeData[];
		let maxLevel: boolean = false;
		if (exp >= conf.exp) {
			let nConf: HuanShouStageConf = GlobalConfig.HuanShouStageConf[rank + 1];
			if (nConf) {
				nextAttrs = AttributeData.AttrChangeAddition(nConf.attr, starAttrs);
			} else {
				maxLevel = true;
			}
		} else {
			if (GlobalConfig.HuanShouTrainConf[level + 1]) {
				nextAttrs = AttributeData.AttrChangeAddition(levelAttrs, GlobalConfig.HuanShouTrainConf[level + 1].attr);
			}
		}

		let equipPercent = UserHuanShou.ins().equipPercent;
		let danPercent = UserHuanShou.ins().danPercent;
		//统计万份比加成
		for (let key in attrs) {
			let attr = attrs[key];
			let percent = 0;
			if (!isNaN(equipPercent[attr.type])) {
				percent += equipPercent[attr.type];
			}
			if (!isNaN(danPercent[attr.type])) {
				percent += danPercent[attr.type];
			}
			if (percent > 0) {
				attr.value = (attr.value * (1 + percent / 10000)) >> 0;
			}
		}
		let equipAttrs = UserHuanShou.ins().equipAttrs;
		let confEquipAttrs = GlobalConfig.HuanShouConf.equipAttrs;
		let len = confEquipAttrs.length;
		let newEquipAttrs = [];
		///过虑装备不加人物身上的属性
		for (let i = 0; i < len; i++) {
			let attr = confEquipAttrs[i];
			for (let key in equipAttrs) {
				if (equipAttrs.hasOwnProperty(key)) {
					let element = equipAttrs[key];
					if (element.type == attr.type) {
						newEquipAttrs.push(element);
						break;
					}
				}
			}
		}
		attrs = AttributeData.AttrChangeAddition(attrs, newEquipAttrs);//加入装备属性
		attrs = AttributeData.AttrChangeAddition(attrs, UserHuanShou.ins().danAttrs);//加入丹药属性
		attrs = AttributeData.AttrChangeAddition(attrs, UserHuanShou.ins().filterPassiveAttr);
		if (nextAttrs) {
			//统计万份比加成
			for (let key in nextAttrs) {
				let attr = nextAttrs[key];
				let percent = 0;
				if (!isNaN(equipPercent[attr.type])) {
					percent += equipPercent[attr.type];
				}
				if (!isNaN(danPercent[attr.type])) {
					percent += danPercent[attr.type];
				}
				if (percent > 0) {
					attr.value = (attr.value * (1 + percent / 10000)) >> 0;
				}
			}
			nextAttrs = AttributeData.AttrChangeAddition(nextAttrs, newEquipAttrs);//加入装备属性
			nextAttrs = AttributeData.AttrChangeAddition(nextAttrs, UserHuanShou.ins().danAttrs);//加入丹药属性
			nextAttrs = AttributeData.AttrChangeAddition(nextAttrs, UserHuanShou.ins().filterPassiveAttr);
		} 

		let skinPower = UserBag.getAttrPower(this.skinAttrs);
		let power = UserBag.getAttrPower(attrs);
		power = power + skinPower;
		let count = SubRoles.ins().subRolesLen;
		return power * count;
	}

	/**主动技能 */
	public get activeSkillList(): number[] {
		if (!this._activeSkillList)
			this._activeSkillList = [];
		return this._activeSkillList;
	}

	public get skills(): HsSkillData[] {
		if (!this._skills)
			this.createSkill();
		return this._skills;
	}

	private onEnterMap(): void {
		if (GameMap.fubenID == 0) {
			if (this.rank > 0 && !this._isfirst) {
				// let conf: HuanShouStageConf = GlobalConfig.HuanShouStageConf[this.changeIndex || 1];//获显示外形
				// let m: EntityModel = MonstersConfig.createModel(GlobalConfig.MonstersConfig[conf.monsterId]);
				// let role = SubRoles.ins().getSubRoleByIndex(0);
				// m.x = role.x;
				// m.y = role.y;
				// m.masterHandle = role.handle;
				// m.type = EntityType.HuanShouMonster;
				// // m.handle = m.hashCode;
				// // m.handle = m.hs
				// GameLogic.ins().createEntityByModel(m, true);
				// this._isfirst = true;
				this.updateHuanShou();
			}
		} else {
			this._isfirst = false;
			this.huanShouHandle = 0;
		}
	}

	private updatePosCount(): void {
		let conf = GlobalConfig.HuanShouStageConf[this.rank];
		this.posCount = conf.posList[conf.posList.length - 1];//获得最大孔数
	}

	public postUpgrade(bytes: GameByteArray): void {
		let oldStage = this.rank;
		this.rank = bytes.readInt();
		this.exp = bytes.readInt();
		this.level = bytes.readInt();
		if (oldStage != 0 && oldStage != this.rank) {
			//弹出升阶窗口
			ViewManager.ins().open(HuanShouUpgradeWin, this.rank);
			// this.changeIndex = this.rank;
			this.updatePosCount();
			// this.updateHuanShou();
		} else if (oldStage == 0 && this.rank == 1) {
			this.changeIndex = 1;
			this.onEnterMap();
			this.updatePosCount();
			// 激活宠物后需要请求下一个唤醒任务
			UserTask.ins().requestNextAwakeTask(UserTask.AWAKE_TASK_TYPE.HUANSHOU);
		}
		this.updateAttr();
	}

	public updateHuanShou(): void {
		if (this.rank > 0) {
			if (this.huanShouHandle)
				EntityManager.ins().removeByHandle(this.huanShouHandle);//清除上个幻兽
			let monsterId;
			if (this.changeIndex) {
				let conf = GlobalConfig.HuanShouStageConf[this.changeIndex];//获显示外形
				monsterId = conf.monsterId;
			} else if (this.skinChangeId) {
				let conf = GlobalConfig.HuanShouSkinConf[this.skinChangeId];//获显示外形
				monsterId = conf.monsterId;
			} else {
				let conf = GlobalConfig.HuanShouStageConf[1];//获显示外形
				monsterId = conf.monsterId;
			}
			let m: EntityModel = UserFb.createModel(GlobalConfig.MonstersConfig[monsterId]);
			// let role: CharRole = EntityManager.ins().getNoDieRole();
			let model: CharRole = EntityManager.ins().getNoDieRole();
			if (!model)
				return;
			m.x = model.x;
			m.y = model.y;
			m.masterHandle = model.infoModel.handle;
			m.type = EntityType.HuanShouMonster;

			GameLogic.ins().createEntityByModel(m, true);
			this._isfirst = true;
		}
	}

	public postHuanShouChange(bytes: GameByteArray): void {
		let old = this.changeIndex;
		let skinOld = this.skinChangeId;
		this.changeIndex = bytes.readInt();
		this.skinChangeId = bytes.readInt();

		if (old != this.changeIndex || skinOld != this.skinChangeId)
			this.updateHuanShou();
	}

	public postUpdateSkill(bytes: GameByteArray): void {
		let pos = bytes.readInt();
		this.skills[pos - 1].updateSkill(bytes);
		this.updateAISkillIDs();
	}

	public composeSkill: number[][];

	public postComposeSkill(bytes: GameByteArray): void {
		let len = bytes.readInt();
		if (!this.composeSkill)
			this.composeSkill = [];
		for (let i = 0; i < len; i++) {
			if (!this.composeSkill[i]) {
				this.composeSkill[i] = [];
			}
			this.composeSkill[i][0] = bytes.readInt();//id
			this.composeSkill[i][1] = bytes.readInt();//数量
		}
	}

	private createSkill(): void {
		if (!this._skills) {
			this._skills = [];
			let confs: HuanShouStageConf[] = GlobalConfig.HuanShouStageConf;
			let conf: HuanShouStageConf;
			for (let key in confs) {
				conf = confs[key];
				if (!conf.posList || conf.posList.length == 0)
					continue;
				let len = conf.posList.length;
				for (let i = 0; i < len; i++) {
					let pos = conf.posList[i];
					let hsData = new HsSkillData();
					hsData.pos = pos;
					hsData.openRank = conf.stage;
					this._skills[pos - 1] = hsData;
				}
			}
		}
	}


	public postHuanShouInfo(bytes: GameByteArray): void {
		if (!this._activeSkillList)
			this._activeSkillList = [];
		this.rank = bytes.readInt();
		this.exp = bytes.readInt();
		this.level = bytes.readInt();
		this.changeIndex = bytes.readInt();
		let len = bytes.readInt();
		if (!this._skills)
			this.createSkill();
		let pos: number;
		for (let i = 0; i < len; i++) {
			pos = bytes.readInt();
			this._skills[pos - 1].updateSkill(bytes);

		}
		len = bytes.readInt();

		for (let i = 0; i < len; i++) {
			if (!this.equipList[i]) {
				this.equipList[i] = new HsEquipData();
			}
			this.equipList[i].pos = i + 1;
			this.equipList[i].equipId = bytes.readInt();
		}
		this.updateEquipSuitLevel();
		this.qianNengCount = bytes.readInt();
		this.feiShengCount = bytes.readInt();
		this.skinChangeId = bytes.readInt();
		len = bytes.readInt();
		for (let i = 0; i < len; i++) {
			let id = bytes.readInt();
			if (!this.skinList[id]) {
				this.skinList[id] = new HSSkinData();
			}
			bytes.position -= 4;//回退已读取的id
			this.skinList[id].update(bytes);
		}
		if (this.rank > 0) {
			this.onEnterMap();
		}
		this.updatePosCount();

		this.updateSkinAttrs();
		this.updateAISkillIDs();
		// this.updateAttr();
	}

	private updateEquipSuitLevel(): void {
		this.equipSuitLevel = -1;
		for (let i = 0; i < this.equipLen; i++) {
			let edata = this.equipList[i];
			if (edata.equipId) {
				let conf = this.getEquipConfById(edata.equipId);
				if (this.equipSuitLevel == -1 || this.equipSuitLevel > conf.stage) {
					this.equipSuitLevel = conf.stage;
				}
			} else {
				this.equipSuitLevel = 0;//默认最小级
				break;
			}
		}

	}

	/**更新主动技能列表 */
	private updateAISkillIDs(): void {
		this._activeSkillList = [];
		let conf: HuanShouSkillConf;
		let attrs: AttributeData[] = [];
		for (let key in this.skills) {
			let element = this.skills[key];
			if (element.isOpen && element.skillId > 0) {
				conf = GlobalConfig.HuanShouSkillConf[element.skillId][element.skillLv];
				if (conf.skillId) {
					this._activeSkillList.push(conf.skillId);
				}
				if (conf.attr && conf.attr.length > 0)
					attrs = AttributeData.AttrChangeAddition(attrs, conf.attr);//把被动技能属性加入
			}
		}
		this._passiveAttr = attrs;//保存被动技能
		this.updateAttr();
	}

	/** 更新装备数据 70- 8*/
	public postUpdateEquip(bytes: GameByteArray): void {
		let pos = bytes.readInt();
		let id = bytes.readInt();
		this.equipList[pos - 1].equipId = id;
		if (id) {
			let conf = GlobalConfig.ItemConfig[id];

			UserTips.ins().showTips(`成功穿戴|C:${ItemBase.QUALITY_COLOR[conf.quality]}&T:${conf.name}`);
		}
		let oldSuitLv = this.equipSuitLevel;
		this.updateEquipSuitLevel();
		if (oldSuitLv < this.equipSuitLevel) {
			let suitConf = GlobalConfig.HuanShouSuitConf[this.equipSuitLevel];
			let conf = GlobalConfig.SkillsConfig[suitConf.skillId];
			let str = `成功升级`;
			if (oldSuitLv == 0) {
				str = `成功激活`;
			}
			str += conf.skinName;
			UserTips.ins().showTips(str);
		}
		this.updateAttr();

	}

	public postComposeEquip(): void {
		// if (bytes.readByte() == 1) {
		// 	UserTips.ins().showTips(``);
		// }
	}

	public postUpdateDanInfo(bytes: GameByteArray): void {
		let type = bytes.readByte();
		if (type == 0) {
			this.qianNengCount = bytes.readInt();
		} else {
			this.feiShengCount = bytes.readInt();
		}
		this.updateAttr();
	}

	private updateSkinAttrs(): void {
		this.skinAttrs.length = 0;
		let stageConfList = GlobalConfig.HuanShouSkinStageConf;
		let trainConfList = GlobalConfig.HuanShouSkinTrainConf;
		for (let key in this.skinList) {
			if (this.skinList.hasOwnProperty(key)) {
				let skinData = this.skinList[key];
				let stageConf = stageConfList[skinData.id][skinData.rank];
				this.skinAttrs = AttributeData.AttrChangeAddition(this.skinAttrs, stageConf.attr);
				if (stageConf.skillAttr) {
					this.skinAttrs = AttributeData.AttrChangeAddition(this.skinAttrs, stageConf.skillAttr);
				}

				let trainConf = trainConfList[skinData.id][skinData.trainCount];
				this.skinAttrs = AttributeData.AttrChangeAddition(this.skinAttrs, trainConf.attr);

				let skinConf = GlobalConfig.HuanShouSkinConf[skinData.id];
				let talentConf = GlobalConfig.HuanShouTalentConf[skinConf.talentId][skinData.talentLv];
				this.skinAttrs = AttributeData.AttrChangeAddition(this.skinAttrs, talentConf.attr);
			}
		}
	}

	public postSkinTrainInfo(bytes: GameByteArray): any {
		let id = bytes.readInt();
		if (!this.skinList[id]) {
			this.skinList[id] = new HSSkinData();
		}
		let oldRank = this.skinList[id].rank;
		bytes.position -= 4;//回退已读取的id
		this.skinList[id].update(bytes);
		this.updateSkinAttrs();
		return [oldRank, this.skinList[id].rank];
	}

	public postTalentSkill(bytes: GameByteArray): void {
		let id = bytes.readInt();
		this.skinList[id].talentLv = bytes.readInt();
		this.updateSkinAttrs();
	}


	/**升级和升阶请求 70-1*/
	public sendUpgrade(): void {
		let bytes: GameByteArray = this.getBytes(1);
		this.sendToServer(bytes);
	}

	/**要幻化哪个阶级的形象 70-2 rank:阶数（普通幻兽要） index:id*/
	public sendHuanShouChange(rank: number, index: number): void {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeInt(rank);
		bytes.writeInt(index);
		this.sendToServer(bytes);
	}

	/**幻兽技能镶嵌请求 70-3 */
	public sendInlaySkill(pos: number, itemId: number): void {
		let bytes: GameByteArray = this.getBytes(3);
		bytes.writeInt(pos);
		bytes.writeInt(itemId);
		this.sendToServer(bytes);
	}

	/**幻兽技能升级请求 70- 4 */
	public sendUpgradeSkill(pos: number): void {
		let bytes: GameByteArray = this.getBytes(4);
		bytes.writeInt(pos);
		this.sendToServer(bytes);
	}

	/**幻兽技能拆卸请求 70- 5 */
	public sendRemoveSkill(pos: number): void {
		let bytes: GameByteArray = this.getBytes(5);
		bytes.writeInt(pos);
		this.sendToServer(bytes);
	}


	/**幻兽技能置换请求 70-6 */
	public sendComposeSkill(itemId1: number, itemId2: number, itemId3: number): void {
		let bytes: GameByteArray = this.getBytes(6);
		bytes.writeInt(3);
		bytes.writeInt(itemId1);
		bytes.writeInt(1);
		bytes.writeInt(itemId2);
		bytes.writeInt(1);
		bytes.writeInt(itemId3);
		bytes.writeInt(1);
		this.sendToServer(bytes);
	}

	/**幻兽装备穿脱操作请求 70-8 */
	public sendOperationEquip(pos: number, itemId: number): void {
		let bytes: GameByteArray = this.getBytes(8);
		bytes.writeInt(pos);
		bytes.writeInt(itemId);
		this.sendToServer(bytes);
	}

	/**幻兽装备合成请求 70-9*/
	public sendComposeEquip(itemid: number): void {
		let bytes: GameByteArray = this.getBytes(9);
		bytes.writeInt(itemid);
		this.sendToServer(bytes);
	}

	/**使用资质丹请求 70- 10*/
	public sendUseDan(type: number): void {
		let bytes: GameByteArray = this.getBytes(10);
		bytes.writeByte(type);
		this.sendToServer(bytes);
	}

	/**培养皮肤请求（激活升级升阶都发这个） 70-11 */
	public sendTrainSkin(id: number): void {
		let bytes: GameByteArray = this.getBytes(11);
		bytes.writeInt(id);
		this.sendToServer(bytes);
	}

	/***皮肤天赋技能升级请求 70-12 */
	public sendUpgradeSkinTalent(id: number): void {
		let bytes: GameByteArray = this.getBytes(12);
		bytes.writeInt(id);
		this.sendToServer(bytes);
	}

	////////////////////////////////////////////////////////
	public sortA(a: ItemData, b: ItemData): number {
		if (a.itemConfig.quality < b.itemConfig.quality) {
			return 1;
		} else if (a.itemConfig.quality > b.itemConfig.quality) {
			return -1;
		}

		return 0;
	}

	//获得背包技能书（已技能过虑已有的技能）
	public getFilterSkillItems(): ItemData[] {
		let items: ItemData[] = UserBag.ins().getItemByType(ItemType.TYPE_27);//通过技能类型获得技能书
		//this.itemList.dataProvider = new eui.ArrayCollection(items);
		let newitems: ItemData[] = [];
		let skills = this.skills;
		for (let key in items) {
			let element = items[key];
			let isBreak: boolean = false;
			for (let key1 in skills) {
				if (skills[key1].isOpen && skills[key1].skillId == element.configID) {
					isBreak = true;
					break;
				}
			}
			if (!isBreak) {
				newitems.push(element);
			}
		}
		return newitems
	}

	/**通过技能孔位，查找是否有技能 */
	public isSkillRedByPos(pos: number): boolean {
		let skillData = this.skills[pos - 1];
		if (!skillData.isOpen)
			return false;
		let items = this.getFilterSkillItems();
		if (skillData.skillId <= 0) {
			//未有技能
			return items.length > 0;
		}
		//计算升级数量
		let confs = GlobalConfig.HuanShouSkillConf[skillData.skillId];
		let bagCount = UserBag.ins().getItemCountById(0, skillData.skillId);
		if (skillData.skillLv >= Object.keys(confs).length) {
			return false;
		}
		let conf = confs[skillData.skillLv];

		return conf.costCount <= bagCount;
	}

	private _passiveAttr: AttributeData[] = [];
	/**被动技能加成属性 */
	public get passiveAttr(): AttributeData[] {

		return this._passiveAttr;
	}

	/**过虑后的被动技能属性 */
	public get filterPassiveAttr(): AttributeData[] {
		let attrTypes = GlobalConfig.HuanShouConf.attrTypes;
		// if (!attrTypes) attrTypes = [];
		let attrs: AttributeData[] = [];
		let len = this._passiveAttr.length;
		for (let i = 0; i < len; i++) {
			if (!attrTypes || attrTypes.indexOf(this._passiveAttr[i].type) >= 0) {
				attrs.push(this._passiveAttr[i]);
			}
		}
		return attrs;
	}


	private updateAttr(): void {
		let rankconf: HuanShouStageConf = GlobalConfig.HuanShouStageConf[this.rank];
		let levelConf: HuanShouTrainConf = GlobalConfig.HuanShouTrainConf[this.level];
		this.hsAttrs = AttributeData.AttrChangeAddition(rankconf.attr, levelConf.attr);

		//装备属性
		this.equipPercent = {};
		this.equipAttrs.length = 0;
		for (let key in this.equipList) {
			if (this.equipList[key].equipId) {
				let conf = this.getEquipConfById(this.equipList[key].equipId);
				this.equipAttrs = AttributeData.AttrChangeAddition(this.equipAttrs, conf.attrs);
				if (conf.percent_attrs) {
					//加入百份比加成
					let percent_attrs = conf.percent_attrs;
					for (let key2 in percent_attrs) {
						let attr = percent_attrs[key2];
						if (isNaN(this.equipPercent[attr.type])) {
							this.equipPercent[attr.type] = 0;
						}
						this.equipPercent[attr.type] += attr.percent;
					}
				}
			}
		}
		//丹药属性
		this.danAttrs.length = 0;
		this.danPercent = {};
		if (this.feiShengCount) {
			this.danAttrs = AttributeData.getAttrStarAdd(GlobalConfig.HuanShouConf.feiShengAttrs, this.feiShengCount);
			let percent = GlobalConfig.HuanShouConf.precent;
			for (let key in levelConf.attr) {
				if (levelConf.attr.hasOwnProperty(key)) {
					let attr = levelConf.attr[key];
					if (isNaN(this.danPercent[attr.type])) {
						this.danPercent[attr.type] = 0;
					}
					this.danPercent[attr.type] += percent * this.feiShengCount;
				}
			}
		}
		if (this.qianNengCount) {
			let attrs = AttributeData.getAttrStarAdd(GlobalConfig.HuanShouConf.qianNengAttrs, this.qianNengCount);
			this.danAttrs = AttributeData.AttrChangeAddition(this.danAttrs, attrs);
		}

		//统计万份比加成
		for (let key in this.hsAttrs) {
			let attr = this.hsAttrs[key];
			let percent = 0;
			if (!isNaN(this.equipPercent[attr.type])) {
				percent += this.equipPercent[attr.type];
			}
			if (!isNaN(this.danPercent[attr.type])) {
				percent += this.danPercent[attr.type];
			}
			if (percent > 0) {
				attr.value = (attr.value * (1 + percent / 10000)) >> 0;
			}
		}
		this.hsAttrs = AttributeData.AttrChangeAddition(this.hsAttrs, this.equipAttrs);//加入装备属性
		this.hsAttrs = AttributeData.AttrChangeAddition(this.hsAttrs, this.danAttrs);//加入丹药属性
		this.hsAttrs = AttributeData.AttrChangeAddition(this.hsAttrs, this._passiveAttr);//把被动技能属性加入
	}

	public getHuanShouAttrs(): AttributeData[] {
		// let mafaAttrs = UserMafaEquip.ins().getHuanShouAttrs();
		// let len = mafaAttrs.length;
		let attrs;
		// for (let i = 0; i < len; i++) {
		// 	let att = mafaAttrs[i];
		// 	if (att.type == AttributeType.atMafaHuanshouAttr) {
		// 		//玛法技能幻兽属性加成
		// 		attrs = AttributeData.getAttrStarAdd(this.hsAttrs, att.value / 10000 + 1);
		// 		break;
		// 	}
		// }
		if (!attrs) {
			attrs = this.hsAttrs;
		}
		// attrs = AttributeData.AttrChangeAddition(mafaAttrs, attrs);
		attrs = AttributeData.AttrChangeAddition(attrs, this.skinAttrs);
		return attrs;
	}

	/** 按装备id保存配置*/
	private resetEquipConfList: any;
	/**按pos与stage保存 装备id*/
	private posEquipList: any;

	private initEquipConfList(): void {
		this.resetEquipConfList = {};
		this.posEquipList = {};
		let confs = GlobalConfig.HuanShouEquipConf;
		for (let key in confs) {
			let list = confs[key];
			for (let temp in list) {
				let conf = list[temp];
				this.resetEquipConfList[conf.equipId] = conf;//按id保存
				if (!this.posEquipList[conf.pos])
					this.posEquipList[conf.pos] = {};
				if (!this.posEquipList[conf.pos][conf.stage])
					this.posEquipList[conf.pos][conf.stage] = [];
				this.posEquipList[conf.pos][conf.stage].push(conf.equipId);
			}
		}
	}

	/**获得装备配置 */
	public getEquipConfById(equipId: number): HuanShouEquipConf {
		if (!this.resetEquipConfList) {
			this.initEquipConfList();
		}
		return this.resetEquipConfList[equipId];
	}

	/**获得下阶装备通过装备id*/
	public getNextEquipConfByCurrId(equipId: number): HuanShouEquipConf {
		let currConf = this.getEquipConfById(equipId);
		if (!currConf) return null;
		let ids = this.getEquipIdByStageByPos(currConf.pos, currConf.stage + 1);
		return ids ? this.getEquipConfById(ids[0]) : null

	}

	/**通过部位与阶数获到装备id组*/
	public getEquipIdByStageByPos(pos: number, stage: number): number[] {
		if (!this.resetEquipConfList) {
			this.initEquipConfList();
		}
		return this.posEquipList[pos][stage];
	}

	/** 通过部位获得装备id组*/
	public getEquipIdsByPos(pos: number): number[] {
		if (!this.resetEquipConfList) {
			this.initEquipConfList();
		}
		let ids = [];
		let tempEquipList = this.posEquipList[pos];
		for (let key in tempEquipList) {
			if (tempEquipList.hasOwnProperty(key))
				ids = ids.concat(tempEquipList[key]);
		}
		return ids;
	}

	/**是否*/
	public isWearEquipIdById(id: number): boolean {
		for (let key in this.equipList) {
			if (this.equipList[key].equipId == id) {
				return true;
			}
		}

		return false;
	}

	/**是否有合成 要合成的id */
	public isComposeEquip(id: number): boolean {
		let conf = this.getEquipConfById(id);
		if (!conf.mat) return false;
		let cou: number = UserBag.ins().getItemCountById(0, conf.mat.id);
		if (this.isWearEquipIdById(conf.mat.id)) {
			cou++;
		}
		return cou >= conf.mat.count;
	}

	/**通过部位获取最高级装备id */
	public getEquipByPos(pos: number): number {
		let confIds = this.getEquipIdsByPos(pos);
		let itemId: number = -1;
		let wearEquip = this.equipList[pos - 1];
		for (let key in confIds) {
			let id = confIds[key];
			let item = UserBag.ins().getBagItemById(id);
			if (!item) continue;
			let conf = this.getEquipConfById(id);
			if (!wearEquip.equipId) {
				itemId = id;
				continue;
			}
			let conf2 = this.getEquipConfById(wearEquip.equipId);
			if (conf.stage > conf2.stage) {
				itemId = id;
			}
		}
		return itemId;
	}

	/**获得下阶装备id */
	public getNextEquipIdByPos(pos: number): number {
		let confIds = this.getEquipIdsByPos(pos);
		let wearEquip = this.equipList[pos - 1];
		if (!wearEquip.equipId) {
			return confIds[0];
		}
		for (let key in confIds) {
			let id = confIds[key];
			let conf = this.getEquipConfById(id);
			let conf2 = this.getEquipConfById(wearEquip.equipId);
			if (conf.stage > conf2.stage) {
				return id
			}
		}
		return -1;
	}


}

namespace GameSystem {
	export let  userHuanShou = UserHuanShou.ins.bind(UserHuanShou);
}