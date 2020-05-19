class UserSkill extends BaseSystem {

	public static MAX_LEVEL: number = 200; //技能最高等级，临时设为200
	public static ACTIVE_LEVEL: number = 0; //激活关卡数
	public static HEJI_SKILL: number = 70000;  //必杀技能ID
	public static HEJI_SHOW_LEVEL: number = 60; //必杀进入装备等级
	public static descArr: string[] = [
		"必杀技能对角色伤害+%s",
		"必杀技能对怪物伤害+%s",
		"怒气恢复速度+%s"
	];
	private punchEquipForge: PunchEquipForgeData;//注灵数据

	public constructor() {
		super();
		this.sysId = PackageID.Skill;
		this.regNetMsg(1, this.doSkillResult);
		this.regNetMsg(2, this.doBuff);
		this.regNetMsg(3, this.doRemoveBuff);
		this.regNetMsg(6, this.doAddEffect);
		this.regNetMsg(7, this.doRemoveEffect);
		this.regNetMsg(4, this.postSkillUpgrade);
		this.regNetMsg(5, this.postSkillUpgradeAll);

		this.regNetMsg(9, this.postHejiInfo);
		this.regNetMsg(10, this.doHejiEquipInfo);
		this.regNetMsg(11, this.doHejiEquipUpdate);

		this.regNetMsg(12, this.doHejiUpdateInfo);
		this.regNetMsg(13, this.postUpgradeForge);
	}

	public static ins(): UserSkill {
		return super.ins() as UserSkill;
	}
	public getPunchForge() {
		if (!this.punchEquipForge)
			this.punchEquipForge = new PunchEquipForgeData();
		return this.punchEquipForge;
	}

	/**
	 * 请求使用技能
	 * 2-1
	 * @param handle 目标唯一标识
	 * @param skillID 使用的技能id
	 */
	public sendUseSkill(suorceHandle: number, handle: number, skillID: number): void {
		let bytes: GameByteArray = this.getBytes(1);
		bytes.writeDouble(suorceHandle);
		bytes.writeDouble(handle);
		bytes.writeInt(skillID);
		this.sendToServer(bytes);
		// egret.log("请求使用时间:" + GameServer.serverTime + "  技能ID:" + skillID);
	}

	/**
	 * 技能使用结果
	 * 2-1
	 * @param bytse
	 */
	public doSkillResult(bytes: GameByteArray): void {
		//施法者
		let sourceHandle: number = bytes.readDouble();
		let skillID: number = bytes.readInt();
		// debug.log("服务器使用技能:" + skillID);
		//目标者
		let targetHandle: number = bytes.readDouble();

		let charSource: CharMonster = EntityManager.ins().getEntityByHandle(sourceHandle) as CharMonster;
		if (!charSource) {
			//debug.error(`找不到handle:${sourceHandle}的施法者`);
			return;
		}

		let charTarget: CharMonster = EntityManager.ins().getEntityByHandle(targetHandle) as CharMonster;
		if (!charTarget) {
			//debug.error(`找不到handle:${targetHandle}的目标者`);
			return;
		}

		//当我攻击对方时候，如果对方隐藏的，将对方显示处理，对应的隐藏其他对象
		if ((!charTarget.parent && charSource.isMy)) {
			EntityManager.ins().showHideSomeOne(targetHandle);
		}
		if ((!charSource.parent && charTarget.isMy)) {
			EntityManager.ins().showHideSomeOne(sourceHandle);
		}

		//攻击者不在场景上不显示
		if (!charSource.parent) {
			return;
		}

		let skillCfg = new SkillData(skillID);

		let damageType: number = 0;
		if (Math.floor(skillID / 10000) == 7) {
			damageType = DamageTypes.Heji;
		}
		let count: number = bytes.readShort();
		let handle: number;
		let type: number;//0不显示，1命中，2暴击
		let value: number;


		if (charSource.isMy) {
			charTarget.showBlood(true);
			charTarget.showName(true);
		}
		if (charTarget.isMy) {
			charSource.showBlood(true);
			charSource.showName(true);
		}

		let infoList: number[][] = [];
		let info: number[] = [];
		for (let i = 0; i < count; i++) {
			handle = bytes.readDouble();
			info = [handle];
			infoList[i] = info;
		}

		AIUtil.ins().userSkill(charSource, charTarget, skillCfg);

		//自己找被攻击的对象 ===  天盟争霸
		if ((charSource instanceof CharRole) && GuildWar.ins().getModel().checkinAppoint(2, true) && SubRoles.ins().getIsMyPlayer(targetHandle) && charSource.infoModel.name) {
			//子角色主人的handel
			GuildWar.ins().getModel().changeWeiXieList(charSource.infoModel.masterHandle, true, charSource.infoModel.name);
		}
	}

	/**
	 * 处理技能buff
	 * @2-2
	 * @param bytes
	 */
	public doBuff(bytes: GameByteArray): void {
		let handle: number = bytes.readDouble();
		let char: CharMonster = EntityManager.ins().getEntityByHandle(handle) as CharMonster;
		if (char) {
			let buff: EntityBuff = ObjectPool.pop('EntityBuff');
			buff.effConfig = GlobalConfig.EffectsConfig[bytes.readInt()];
			buff.value = 0;
			buff.addTime = egret.getTimer();
			char.addBuff(buff);
		}
	}

	/**
	 * 处理删除技能buff
	 * @2-3
	 * @param bytes
	 */
	public doRemoveBuff(bytes: GameByteArray): void {
		let handle: number = bytes.readDouble();
		let char: CharMonster = EntityManager.ins().getEntityByHandle(handle) as CharMonster;
		if (char) {
			let id: number = GlobalConfig.EffectsConfig[bytes.readInt()].group;
			if (char.hasBuff(id))
				char.removeBuff(char.buffList[id])
		}
	}

	/**
	 * 添加特效
	 * 2-6
	 * @param bytse
	 */
	private doAddEffect(bytes: GameByteArray): void {
		let handle: number = bytes.readDouble();
		let char: CharMonster = EntityManager.ins().getEntityByHandle(handle) as CharMonster;
		if (char) {
			let id: number = bytes.readInt();
			// egret.log("2-6+++:"+id)
			char.addEffect(id)
		}
		// char.addEffect(bytes.readInt());
	}

	/**
	 * 删除特效
	 * 2-7
	 * @param bytse
	 */
	private doRemoveEffect(bytes: GameByteArray): void {
		let handle: number = bytes.readDouble();
		let char: CharMonster = EntityManager.ins().getEntityByHandle(handle) as CharMonster;
		if (char)
			char.removeEffect(bytes.readInt());
	}

	/**
	 * 请求升级技能
	 * 2-4
	 * @param roleId 角色目标唯一标识
	 * @param skillID 要升级的技能id
	 */
	public sendGrewUpSkill(roleId: number, skillID: number): void {

		let bytes: GameByteArray = this.getBytes(4);
		bytes.writeShort(roleId);
		bytes.writeShort(skillID);
		this.sendToServer(bytes);
	}

	/**
	 * 技能升级结果
	 * 2-4
	 * @param bytse
	 */
	public postSkillUpgrade(bytes: GameByteArray): number[] {

		let roleId = bytes.readShort();
		let skillID = bytes.readShort();
		let level = bytes.readShort();

		let role = SubRoles.ins().getSubRoleByIndex(roleId);

		let lastLevel = role.skillsData[skillID].lv;
		role.skillsData[skillID] = SkillData.getSkillByJob(role.job, skillID + 1, level);

		if (lastLevel == 0 && level != 0) {
			UserTips.ins().showSkillTips(role.skillsData[skillID].configID);
		}

		return [roleId, skillID, level];
	}

	public getSkillIdIcon(id: number): string {
		let curSkill: SkillsConfig = GlobalConfig.SkillsConfig[id];
		let icon: string = Math.floor(curSkill.id / 1000) * 1000 + "_png";
		return icon;
	}

	/**
	 * 请求一键升级
	 * 2-5
	 * @param  {number} roleId            角色ID
	 * @param  {boolean=true} isAll        是否全部技能升级
	 * @param  {number=0} skillID        技能ID，当然isAll为false时，这个参数起效，指定单一技能
	 * @returns void
	 */
	public sendGrewUpAllSkill(roleId: number, isAll: boolean = true, skillID: number = 0): void {

		let bytes: GameByteArray = this.getBytes(5);
		bytes.writeShort(isAll ? 1 : 0);
		bytes.writeShort(roleId);
		bytes.writeShort(skillID);
		this.sendToServer(bytes);
	}

	/**
	 * 全部技能升级结果
	 * 2-5
	 * @param bytse
	 */
	public postSkillUpgradeAll(bytes: GameByteArray): [SkillData[], number] {
		let roleId = bytes.readShort();
		let role: Role = SubRoles.ins().getSubRoleByIndex(roleId);
		let old: SkillData[] = role.skillsData;
		role.skillsData = [];
		for (let i = 0; i < 5; i++) {
			role.skillsData.push(SkillData.getSkillByJob(role.job, i + 1, bytes.readShort()));
		}
		//前端自己塞个假的位移技能下去，做快速移动
		role.skillsData.push(SkillData.getSkillByJob(role.job, 8, 1));
		return [old, roleId];
	}


	public hejiLevel: number = -1;
	public hejiCD: number = 0;
	public hejiEnable: boolean = false;
	private isFirst: boolean = true;
	public fieldUse: boolean = false;

	/**
	 * 全部技能升级结果
	 * 2-9
	 * @param bytse
	 */
	public postHejiInfo(bytes: GameByteArray): any {
		let hejiLevel: number = bytes.readUnsignedInt();
		let cd: number = bytes.readUnsignedInt();
		let isAct: boolean = false;
		//激活的时候
		if (this.hejiLevel == -1 && hejiLevel == 1) {
			isAct = true;
		}
		//登陆或者升级的时候
		if (this.hejiLevel != hejiLevel) {
			this.hejiLevel = hejiLevel;
			this.postHejiUpdate();
		}
		this.setHejiCD(cd);

		return { isAct: isAct };
	}

	public equipListData: ItemData[] = [];

	/**
	 * 必杀装备数据同步
	 * 2-10
	 * @param bytse
	 */
	public doHejiEquipInfo(bytes: GameByteArray): void {
		this.equipListData = [];
		let equip: ItemData;
		for (let i: number = 0; i < 8; i++) {
			equip = new ItemData();
			equip.parser(bytes);
			this.equipListData.push(equip);
		}
		this.setQimingInfo();
		this.postHejiEquipChange();
	}

	public qimingEquipDic: { [tLv: number]: { num: number } };
	private qmArr: number[];

	public setQimingInfo(): void {
		this.qimingEquipDic = {};

		if (!this.qmArr) {
			this.qmArr = [];
			let td: TogetherHitEquipQmConfig[][][] = GlobalConfig.TogetherHitEquipQmConfig;
			for (let tZs in td) {
				for (let tLv in td[tZs]) {
					if (!isNaN(Number(tZs)) && !isNaN(Number(tLv))) {
						let tNum: number = Number(tZs) * 10000 + Number(tLv);
						this.qmArr.push(tNum);
					}
				}
			}
		}

		for (let k in this.equipListData) {
			if (this.equipListData[k].configID != 0) {
				let item: ItemConfig = this.equipListData[k].itemConfig;
				let lv: number = (item.zsLevel || 0) * 10000 + item.level;
				for (let j: number = 0; j < this.qmArr.length; j++) {
					if (lv < this.qmArr[j]) continue;
					let tLv = this.qmArr[j];
					if (!this.qimingEquipDic[tLv]) {
						this.qimingEquipDic[tLv] = { num: 0 };
						this.qimingEquipDic[tLv].num = 1;
					} else {
						this.qimingEquipDic[tLv].num++;
					}
				}

			}
		}
		this.setQmAttr();
	}

	public qimingAttrDic: any;
	public qimingValueDic: any;

	private setQmAttr(): void {
		let config = GlobalConfig.TogetherHitEquipQmConfig;
		this.qimingAttrDic = {};
		for (let k in this.qimingEquipDic) {
			let zsLv: number = Math.floor(Number(k) / 10000);
			let lv: number = Math.floor(Number(k) % 10000);
			let num: number = this.qimingEquipDic[k].num;
			let tempConfig = config[zsLv][lv];
			if (tempConfig) {
				for (let i in tempConfig) {
					if (num >= Number(i)) {
						if (!this.qimingAttrDic[k]) this.qimingAttrDic[k] = {};
						this.qimingAttrDic[k][i] = tempConfig[i];
					}
				}
			}
		}

		this.qimingValueDic = {};
		for (let k in this.qimingAttrDic) {
			for (let l in this.qimingAttrDic[k]) {
				let obj = this.qimingAttrDic[k][l];
				let totalAtt = obj.exAttr["0"];
				if (!this.qimingValueDic[l]) this.qimingValueDic[l] = new Object;
				if (!this.qimingValueDic[l].value) this.qimingValueDic[l].value = 0;
				this.qimingValueDic[l].type = totalAtt.type;
				this.qimingValueDic[l].value += totalAtt.value;
			}
		}
	}

	/**
	 * 必杀装备数据同步
	 * 2-11
	 * @param bytse
	 */
	public doHejiEquipUpdate(bytes: GameByteArray): void {
		let pos: number = bytes.readShort();
		let equip: ItemData = new ItemData();
		equip.parser(bytes);
		this.equipListData[pos] = equip;
		this.setQimingInfo();
		this.postHejiEquipChange();
	}

	public checkHejiOpen(): boolean {
		let id = GlobalConfig.TogerherHitBaseConfig.actImbaId;
		if (Artifact.ins().getNewArtifactBy(Artifact.ins().getArtifactIndexById(id))) {
			return Artifact.ins().getNewArtifactBy(Artifact.ins().getArtifactIndexById(id)).open;
		}
		return false;
	}

	public canHejiEquip(): boolean {
		if (UserSkill.ins().hejiLevel <= 0) return false;
		if (Actor.level < UserSkill.HEJI_SHOW_LEVEL) return false;
		if (!this.equipListData) return false;
		for (let i: number = 0; i < this.equipListData.length; i++) {
			if (this.checkIsHaveBestEquip(i)) {
				return true;
			}
		}
		return false;
	}

	public canExchange(): boolean {
		if (UserSkill.ins().hejiLevel <= 0) return false;
		if (Actor.level < UserSkill.HEJI_SHOW_LEVEL) return false;
		let cost: number;
		let maxZlv = this.getMaxzLv();
		for (let k in this.equipListData) {
			let item = this.equipListData[k];
			if (item && item.configID) {
				for (let index = +k + 1; ; index += 8) {
					let config = GlobalConfig.TogetherHitEquipExchangeConfig[index];
					if (!config) {
						break;
					}
					let lv = item.itemConfig.level ? item.itemConfig.level : 0;
					let zsLv = item.itemConfig.zsLevel ? item.itemConfig.zsLevel : 0;
					let tempLv = config.level;
					let tempZslv = config.zsLevel;
					let getItemId = config.getItem.id;
					if (tempLv <= lv && tempZslv <= zsLv) {
						continue;
					}
					if ((getItemId % 10000) <= (item.configID % 10000)) {//已拥有的不作兑换判断
						continue;
					}
					if (tempLv > Actor.level || tempZslv > UserZs.ins().lv) {//角色未到指定转数等级不作判断
						continue;
					}
					if (tempZslv > maxZlv[0] || tempLv > maxZlv[1]) {
						break;
					}
					if (tempZslv >= zsLv) {
						if (tempLv >= lv) {
							cost = config.exchangeMaterial[0][`count`];
							if (config.exchangeMaterial[0].id == MoneyConst.punch1 && Actor.togeatter1 >= cost) {
								return true;
							} else if (config.exchangeMaterial[0].id == MoneyConst.punch2 && Actor.togeatter2 >= cost) {
								return true;
							}
						}
					}
				}
			} else {
				let tempData = GlobalConfig.TogetherHitEquipExchangeConfig[Number(k) + 1];
				if (tempData) {
					cost = tempData.exchangeMaterial[0][`count`];
					if (tempData.exchangeMaterial[0].id == MoneyConst.punch1 && Actor.togeatter1 >= cost) {
						return true;
					} else if (tempData.exchangeMaterial[0].id == MoneyConst.punch2 && Actor.togeatter2 >= cost) {
						return true;
					}
				}
			}
		}
		return false;
	}

	//获取最大开启转数和等级
	public getMaxzLv(): [number, number] {
		let maxLv = 0;
		let zs: number = 0;
		let lv: number = 0;
		let dic = UserSkill.ins().qimingEquipDic;
		for (let lv in dic) {
			if (+lv > maxLv) {
				maxLv = +lv;
			}
		}

		zs = Math.floor(maxLv / 10000);
		lv = maxLv % 10000;

		if (maxLv == 0 || dic[maxLv].num == 8) {
			let config = GlobalConfig.TogetherHitEquipQmConfig;
			let zsArr = [];
			for (let z in config) {
				zsArr.push(+z);
			}
			zsArr.sort((a, b) => { return a < b ? -1 : 1; });
			if (maxLv == 0) {
				zs = zsArr[0];
			} else {
				zs = zsArr[zsArr.indexOf(zs) + 1];
				if (zs == undefined) {
					zs = zsArr[zsArr.length - 1];
				}
			}
			for (let v in config[zs]) {
				lv = +v;
			}
		}
		return [zs, lv];
	}

	//获取必杀碎片兑换页红点
	public getPunchExchangePageRedPoint(page: number) {
		let cost: number;
		let maxZlv = this.getMaxzLv();
		for (let k in this.equipListData) {
			let item = this.equipListData[k];
			if (item && item.configID) {
				if (page == 1) continue;
				let oldIndex = (+k + 1) + (page - 2) * 8;
				let config = GlobalConfig.TogetherHitEquipExchangeConfig[oldIndex];
				let getItemId = config.getItem.id;
				if (getItemId != item.configID) {
					continue;
				}

				let index = (+k + 1) + (page - 1) * 8;
				config = GlobalConfig.TogetherHitEquipExchangeConfig[index];
				if (config) {
					let lv = item.itemConfig.level ? item.itemConfig.level : 0;
					let zsLv = item.itemConfig.zsLevel ? item.itemConfig.zsLevel : 0;
					let tempLv = config.level;
					let tempZslv = config.zsLevel;
					let getItemId = config.getItem.id;
					if (tempLv <= lv && tempZslv <= zsLv) {
						continue;
					}
					if ((getItemId % 10000) <= (item.configID % 10000)) {//已拥有的不作兑换判断
						continue;
					}
					if (tempLv > Actor.level || tempZslv > UserZs.ins().lv) {//角色未到指定转数等级不作判断
						continue;
					}
					if (tempZslv > maxZlv[0] || tempLv > maxZlv[1]) {
						continue;
					}
					if (tempZslv >= zsLv) {
						if (tempLv >= lv) {
							cost = config.exchangeMaterial[0][`count`];
							if (config.exchangeMaterial[0].id == MoneyConst.punch1 && Actor.togeatter1 >= cost) {
								return true;
							} else if (config.exchangeMaterial[0].id == MoneyConst.punch2 && Actor.togeatter2 >= cost) {
								return true;
							}
						}
					}
				}
			} else if (page == 1) {
				let tempData = GlobalConfig.TogetherHitEquipExchangeConfig[Number(k) + 1];
				if (tempData) {
					cost = tempData.exchangeMaterial[0][`count`];
					if (tempData.exchangeMaterial[0].id == MoneyConst.punch1 && Actor.togeatter1 >= cost) {
						return true;
					} else if (tempData.exchangeMaterial[0].id == MoneyConst.punch2 && Actor.togeatter2 >= cost) {
						return true;
					}
				}
			}
		}
		return false;
	}

	//获取单个兑换红点
	public getPunchExchangeItemRedPoint(id) {
		let index = (id - 1) % 8;
		let page = Math.ceil(id / 8);
		let item = this.equipListData[index];
		let cost: number;
		if (page == 1) {
			if (item && item.configID) {
				return false;
			}
		} else {
			if (!item || !item.configID) {
				return false;
			}
			let config = GlobalConfig.TogetherHitEquipExchangeConfig[id - 8];
			if (config.getItem.id != item.configID) {
				return false;
			}
		}
		let tempData = GlobalConfig.TogetherHitEquipExchangeConfig[id];
		if (tempData) {
			if (tempData.zsLevel > UserZs.ins().lv || tempData.level > Actor.level) {
				return false;
			}
			cost = tempData.exchangeMaterial[0][`count`];
			if (tempData.exchangeMaterial[0].id == MoneyConst.punch1 && Actor.togeatter1 >= cost) {
				return true;
			} else if (tempData.exchangeMaterial[0].id == MoneyConst.punch2 && Actor.togeatter2 >= cost) {
				return true;
			}
		}
		return false;
	}

	public canAcitve(): boolean {
		// if (UserSkill.ins().hejiLevel <= 0) {
		// 	return UserFb.ins().guanqiaID >= UserSkill.ACTIVE_LEVEL;
		// }
		return false;
	}

	//是否可以分解

	public canSolve(): boolean {
		if (UserSkill.ins().hejiLevel <= 0) return false;
		if (Actor.level < UserSkill.HEJI_SHOW_LEVEL) return false;
		let itemArr = [];
		UserBag.ins().checkEquipsTodestroy(itemArr);
		if (itemArr.length) return true;
		return false;
	}


	public hejiProgressList: any = [];

	/**
	 * 必杀技能等级升级条件进度通知
	 * 2-12
	 * @param bytse
	 */
	public doHejiUpdateInfo(bytes: GameByteArray): void {
		let len: number = bytes.readByte();
		this.hejiProgressList = [];
		for (let i: number = 0; i < len; i++) {
			let item: HejiProgressData = new HejiProgressData();
			item.parser(bytes);
			this.hejiProgressList[item.id - 1] = item;
		}
	}

	public reduceCD: number = 0;

	public setHejiCD(cd: number = 0) {
		if (this.hejiLevel > 0) {
			let skill = UserSkill.ins().getHejiSkillId();
			this.reduceCD = 0;
			let role: CharRole = EntityManager.ins().getMainRole(0);
			if (role && role.infoModel && role.infoModel.getExAtt(ExAttributeType.eatTogetherHitCdSub) > 0) {
				this.reduceCD = role.infoModel.getExAtt(ExAttributeType.eatTogetherHitCdSub) / 10000 * skill.cd;
			}

			if (cd == -1) {
				this.hejiCD = GameServer.serverTime + skill.cd - this.reduceCD;
			} else {
				this.hejiCD = GameServer.serverTime + cd;
			}
			
			this.postHejiStartCD();
		}
	}

	public getHejiSkillId(): SkillData {
		let config: TogetherHitConfig = GlobalConfig.TogetherHitConfig[UserSkill.ins().hejiLevel];
		let model: Role = SubRoles.ins().getSubRoleByIndex(0);
		if (!model) { //不知为何model会出现为空的情况 很小几率
			return new SkillData(GlobalConfig.SkillsConfig[config.skill_id[0]].id);
		}
		let curSkill: SkillsConfig = GlobalConfig.SkillsConfig[config.skill_id[model.job - 1]];
		return new SkillData(curSkill.id);
	}
	public getHejiSkillIdIcon(): string {
		let config: TogetherHitConfig = GlobalConfig.TogetherHitConfig[UserSkill.ins().hejiLevel];
		let model: Role = SubRoles.ins().getSubRoleByIndex(0);

		if (!model) model = { job: 1 } as any;//不知为何model会出现为空的情况 很小几率

		let curSkill: SkillsConfig = GlobalConfig.SkillsConfig[config.skill_id[model.job - 1]];
		let icon: string = Math.floor(curSkill.id / 1000) * 1000 + "_png";
		return icon;
	}

	/**
	 * 激活或升级必杀技能
	 * 2-9
	 */
	public sendGrewUpHejiSkill(): void {
		this.sendBaseProto(9);
	}

	/**
	 * 使用必杀技能
	 * 2-10
	 */
	public sendUseHejiSkill(): void {
		this.sendBaseProto(10);
	}

	/**
	 * 请求穿上必杀装备
	 * 2-11
	 */
	public sendDressHejiEquip(equipId: number, pos: number): void {
		let bytes: GameByteArray = this.getBytes(11);
		bytes.writeDouble(equipId);
		bytes.writeShort(pos);
		this.sendToServer(bytes);
	}

	/**
	 * 请求兑换必杀技能装备
	 * 2-12
	 */
	public sendExchangeHejiEquip(id: number): void {
		let bytes: GameByteArray = this.getBytes(12);
		bytes.writeShort(id);
		this.sendToServer(bytes);
	}

	//获取对应部位装备的数据
	public getWearEquipsData(pos: number): ItemData {
		if (this.equipListData[pos])
			return this.equipListData[pos];
		return null;
	}

	/** TODO hepeiye
	 * 获取当前技能最高等级限制
	 */
	public getSkillLimitLevel(): number {
		return UserZs.ins().lv > 0 ? 80 + UserZs.ins().lv * 10 : (Actor.level > 80 ? 80 : Actor.level);
	}

	/**
	 * 获取单个技能一键升级的消耗
	 * @param  {number} roleID
	 * @param  {number} skillIndex
	 */
	public getSingleSkillGrewUpCost(roleID: number, skillIndex: number) {
		let limitLevel = this.getSkillLimitLevel();
		let singleSkillLevel = SubRoles.ins().getSubRoleByIndex(roleID).skillsData[skillIndex];
		let coin = Actor.gold;
		let cost = 0;
		if (singleSkillLevel.lv > 0) {
			for (let i: number = singleSkillLevel.lv; i < limitLevel; i++) {
				let upgradeCost: number = GlobalConfig.SkillsUpgradeConfig[i].cost;
				if (cost + upgradeCost > coin) {
					return cost;
				}
				else {
					cost += upgradeCost;
				}
			}
			return cost;
		}
		return 0;
	}

	/**
	 * 是否可以升级技能
	 */
	public canGrewupSkill(): boolean[] {
		let isOpens = [];
		let limitLevel = this.getSkillLimitLevel();
		let len: number = SubRoles.ins().subRolesLen;
		for (let i: number = 0; i < len; i++) {
			let role: Role = SubRoles.ins().getSubRoleByIndex(i);
			for (let j: number = 0; j < role.skillsData.length; j++) {
				let skillData = role.skillsData[j];
				if (skillData.index == 8) continue;
				if (skillData.lv > 0 && limitLevel > skillData.lv) {
					let cost = GlobalConfig.SkillsUpgradeConfig[skillData.lv].cost;
					if (Actor.gold >= cost) {
						isOpens[i] = true;
						break;
					}
				}
			}
		}
		return isOpens;
	}

	/** TODO
	 * 是否可以全部升级技能
	 * @param roleId 角色id
	 */
	public canGrewupAllSkills(roleId: number) {
		let skillMaxLevel: number = this.getSkillLimitLevel();
		let skillsLevel = SubRoles.ins().getSubRoleByIndex(roleId).skillsData;

		//自己的金钱
		let isCan = false;
		let coin = Actor.gold;
		for (let i: number = 0; i < skillsLevel.length; i++) {
			let level = skillsLevel[i];
			if (level.configID == 0) continue;
			let upgradeCof: SkillsUpgradeConfig = GlobalConfig.SkillsUpgradeConfig[level.lv];
			if (upgradeCof) {
				if (coin >= upgradeCof.cost && level.configID != skillMaxLevel)
					isCan = true;
			}
		}
		//金钱足够 判定等级是否满级
		if (isCan) {
			for (let i: number = 0; i < 5; i++) {
				let level = skillsLevel[i];
				if (level.lv > 0) {
					if (level.lv < UserSkill.ins().getSkillLimitLevel()) {
						let costAllNum = UserSkill.ins().getSingleSkillGrewUpCost(roleId, i);
						if (costAllNum > 0) {
							return true;
						}
					}
				}
			}
			return false;//满级了
		}


		return isCan;
	}

	public postShowSkillWord(skillWord: string): string {
		return skillWord;
	}

	public postHejiUpdate() {

	}

	public postHejiStartCD() {
	}

	public postHejiRemove() {
	}

	public postHejiEquipChange() {

	}

	/*
	 * 检测这个职业 部位是否有可替换的装备
	 * */
	public checkIsHaveBestEquip(pos: number, roleIndex: number = -1): boolean {
		let wear: ItemData = this.equipListData[pos];
		let itemList: ItemData[] = UserBag.ins().getHejiEquipsByType(pos);
		if (itemList.length > 0) {
			let best: ItemData;
			let level: number = 200;
			for (let i: number = 0; i < itemList.length; i++) {
				best = itemList[i];
				let itemLv: number = best.itemConfig.level ? best.itemConfig.level : 0;
				let itemzsLv: number = best.itemConfig.zsLevel ? best.itemConfig.zsLevel : 0;
				if (best.itemConfig.level <= level && (itemLv <= Actor.level || itemzsLv <= UserZs.ins().lv) &&
					best.itemConfig.level <= Actor.level && itemzsLv <= UserZs.ins().lv
				) {
					let wearPoint: number = 0;
					if (wear && wear.configID != 0) {
						wearPoint = wear.point;
					} else {
						if (!best.itemConfig.useCond) {
							return true;
						} else {
							continue;
						}
					}
					let beatPoint: number = best.point;
					if (beatPoint > wearPoint && best.itemConfig.useCond == wear.itemConfig.id) {
						return true;
					}
				}
			}
		}
		return false;
	}

	/**
	 * 请求注灵
	 * 2-13
	 */
	public sendUpgradeForge(pos: number): void {
		let bytes: GameByteArray = this.getBytes(13);
		bytes.writeShort(pos);
		this.sendToServer(bytes);
	}

	/**
	 * 注灵返回
	 * 2-13
	 * */
	public postUpgradeForge(bytes: GameByteArray) {
		this.getPunchForge().parser(bytes);
	}

	/**
	 * 高级必杀碎片兑换 TogeatterHigh
	 * 2-14
	*/
	public sendChangeTogeatterHigh(num: number): void {
		let bytes: GameByteArray = this.getBytes(14);
		bytes.writeInt(num);
		this.sendToServer(bytes);
	}

	public exBuffList: any = {};
	public getAISkillEff(buffId: number): EffectsConfig {
		if (GlobalConfig.EffectsConfig[buffId])
			return GlobalConfig.EffectsConfig[buffId];
		else
			return this.exBuffList[buffId];
	}

}
namespace GameSystem {
	export let  userskill = UserSkill.ins.bind(UserSkill);
}

enum SHORT_SKILLID {
	MAGIC = 24,			//魔法盾
	CURE = 33, 			//治疗术
	POISONING = 32,		//施毒术
	ARMOR = 34,			//战神铠甲
	SUMMON = 35,		//召唤术
}

class SkillConst {
	public static EFF_SKY_BALL: number = 53001;//玄玉技能
}