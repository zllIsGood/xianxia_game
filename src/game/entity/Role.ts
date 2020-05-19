/**
 *
 * @author
 *
 */
class Role extends EntityModel {

	/** 编号 */
	public index: number;
	/** 职业 */
	public job: JobConst;
	/** 性别 */
	public sex: number;
	/** 元神等级 */
	public yuanshenLv: number;

	/** 技能数据 */
	public skillsData: SkillData[];
	/** 元神数据 */
	public yuanshengData: boolean[];
	/** 装备数据 */
	public equipsData: EquipsData[];
	/** 特殊戒指数据 */
	public exRingsData: number[];
	/** 翅膀数据 */
	public wingsData: WingsData;
	/** 经脉数据 */
	public jingMaiData: JingMaiData;
	/** 龙印等级 */
	public loongSoulData: LongHunData;
	/** 护盾等级 */
	public shieldData: LongHunData;
	/**血玉等级 */
	public xueyuData: LongHunData;
	/** 显示的称号ID */
	public title: number;
	/** 仙盟id */
	public guildID: number;
	/** 仙盟名 */
	public guildName: string;
	/** 天仙等级*/
	public warLevel: number;
	/*主宰装备*/
	public zhuZaiData: ZhuZaiData[];

	public zhuangbei: number[];

	/*诛仙装备*/
	public heirloom: HeirloomData;

	/**剑灵*/
	public weapons: WeaponsData;
	/**其他人和机器人用的剑灵id 自己的剑灵id在weapons*/
	public weaponsId: number;

	/** 阵营id，用于阵营战，1为冰，2为火*/
	public camp: number;

	/**符文数据 */
	public runeDatas: ItemData[] = [];

	public wingSkillData: number[] = [];
	/** 历练 */
	public lilianLv: number = 0;

	/**晕眩宝灯1是,0否 -_- */
	private _mbRing: number = 0;
	/**护声戒指1是,0否*/
	public hsRing: number = 0;
	/**神兵技能**/
	public godWeaponSkills: SkillData[];
	/** 飞剑ID */
	public flySwordId: number = 0;
	public flySwordData: FlySwordData;
	/**幻兽handle */
	public huanShouHandle: number;

	/**装备觉醒 */
	public awakenData: AwakenData;

	public jadeData: JadeDataNew;


	private static jobNumberToName = {
		0: "通用",
		1: "战士",
		2: "法师",
		3: "术士",
	};

	public static translate: Object = {
		'hp': AttributeType.atMaxHp,
		'atk': AttributeType.atAttack,
		'def': AttributeType.atDef,
		'res': AttributeType.atRes,
		'crit': AttributeType.atCrit,
		'tough': AttributeType.atTough
	};

	/**
	 * 通过属性名获取属性类型
	 * */
	public static getAttrTypeByName(attrName: string): number {
		return this.translate[attrName];
	}

	/**通过职业类型获取职业名 */
	public static getJobNameByJob(type: number): string {
		return this.jobNumberToName[type];
	}

	private static typeNumberToName: string[] = [
		"武器",
		"头盔",
		"衣服",
		"项链",
		"护腕",
		"腰带",
		"戒指",
		"鞋子",
		"玄玉",
		"护肩",
		"令牌",
		"披风",
		"手镯",
	];

	public static hejiPosName: string[] = ["乾", "巽", "坎", "艮", "坤", "震", "离", "兑"];

	public static getHejiEquipNameByType(type: number): string {
		return this.hejiPosName[type];
	}

	public static getEquipNameByType(type: number): string {
		return this.typeNumberToName[type];
	}

	private static typeEquipWingToName: string[] = [
		"翼枢",
		"翼爪",
		"翎羽",
		"彩凤",
	];

	public static getWingEquipNameByType(type: number): string {
		return this.typeEquipWingToName[type];
	}

	/**
	 * 锻造总等级数据
	 * @param index 装备索引
	 * @param packageID
	 */
	public static getAllForgeLevelByType(packageID: number): number {
		let sumlevel = 0;
		let len: number = SubRoles.ins().subRolesLen;
		for (let r = 0; r < len; r++) {
			let eqdata: EquipsData[] = SubRoles.ins().getSubRoleByIndex(r).equipsData;
			for (let i = 0; i < UserEquip.FOEGE_MAX; i++) {
				switch (packageID) {
					case PackageID.strongthen:
						sumlevel += eqdata[i].strengthen;
						break;
					case PackageID.Gem:
						sumlevel += eqdata[i].gem;
						break;
					case PackageID.Zhuling:
						sumlevel += eqdata[i].zhuling;
						break;
				}
			}
		}

		return sumlevel;
	}
	/**
	 * 神装总转身数据
	 * @param index 装备索引
	 * @param packageID
	 */
	public static getAllZSLevel(): number {
		let sumlevel = 0;
		let len: number = SubRoles.ins().subRolesLen;
		for (let r = 0; r < len; r++) {
			let eqdata: EquipsData[] = SubRoles.ins().getSubRoleByIndex(r).equipsData;
			for (let i = 0; i < UserEquip.FOEGE_MAX; i++) {
				let configID = eqdata[i].item.configID;
				let curItemData = GlobalConfig.ItemConfig[configID];
				//神装4 传奇5
				if (curItemData && ItemConfig.getQuality(curItemData) == 4 && curItemData.zsLevel) {
					sumlevel += curItemData.zsLevel;
				}
			}
		}

		return sumlevel;
	}

	constructor() {
		super();
		this.type = EntityType.Role;
	}

	public parser(bytes: GameByteArray): void {
		this.title = bytes.readInt();
		/**RoleData 开始*/
		this.index = bytes.readInt();
		this.job = bytes.readInt();
		this.sex = bytes.readInt();
		this.sex = this.job == JobConst.ZhanShi ? 0 : 1;
		this.power = bytes.readDouble();
		this.skillsData = [];
		let i;
		for (i = 0; i < 5; i++) {
			let lv = bytes.readInt();
			this.skillsData.push(SkillData.getSkillByJob(this.job, i + 1, lv));
		}
		//前端自己塞个假的位移技能下去，做快速移动
		this.skillsData.push(SkillData.getSkillByJob(this.job, 8, 1));
		//这里是合并版本的时候为了和后端对上协议增加,其天盟内容为第二套技能.
		for (i = 0; i < 5; i++) {
			bytes.readInt();
		}
		this.yuanshengData = [];
		this.yuanshenLv = bytes.readInt();
		for (i = 0; i < 6; i++) {
			this.yuanshengData.push(bytes.readBoolean());
		}
		this.equipsData = [];
		let equip: EquipsData;
		for (i = 0; i < EquipPos.MAX; i++) {
			equip = new EquipsData();
			equip.parser(bytes);
			this.equipsData.push(equip);
		}
		this.exRingsData = [];
		for (i = 0; i < 4; i++) {
			this.exRingsData.push(bytes.readInt());
		}
		this.wingsData = new WingsData;
		this.wingsData.parser(bytes);
		// this.wingsData.parserWingEqupip(bytes);

		this.jingMaiData = new JingMaiData;
		this.jingMaiData.parser(bytes);

		this.loongSoulData = new LongHunData();
		this.loongSoulData.parser(bytes);

		// this.shieldData = new LongHunData();
		// this.shieldData.parser(bytes);
		//
		// this.xueyuData = new LongHunData();
		// this.xueyuData.parser(bytes);

		//符文系统-解析符文数据
		this.parserRune(bytes);
		// for (i = 0; i < 4; i++) {
		// 	bytes.readInt();
		// }

		this.parserhHeirloom(bytes);//诛仙装备
		this.parserhWeapons(bytes);//剑灵

		this.flySwordData = new FlySwordData();
		this.flySwordData.parser(bytes);
		this.flySwordId = this.flySwordData.id;

		this.awakenData = new AwakenData();
		this.awakenData.parser(bytes);

		/**RoleData 结束*/

		this.parserAtt(bytes);
		this.parserExAtt(bytes);

		//玉佩
		this.parseJadeData(bytes);

		this.parserModel(bytes);

		this.parserZhuangbei(bytes);

		this.setWingSkill();
	}

	public updateFlySword(): void {
		let model = FlySword.ins().getModel(this.index);
		if (!model)
			return;

		model.levelModel.level = this.flySwordData.level;
		model.levelModel.levelData.exp = this.flySwordData.exp;
		model.appearanceModel.appearanceID = this.flySwordData.id;
		model.appearanceModel.isActivation = this.flySwordData.isOpen;
	}

	//剑灵
	public parserhWeapons(bytes: GameByteArray): void {
		if (!this.weapons)
			this.weapons = new WeaponsData();
		this.weapons.weaponsId = bytes.readInt();
	}

	//玉佩
	public parseJadeData(bytes: GameByteArray) {
		if (!this.jadeData)
			this.jadeData = new JadeDataNew();
		this.jadeData.parserOther(bytes);
	}

	//诛仙部位等级 索引=HeirloomSlot顺序
	public parserhHeirloom(bytes: GameByteArray): void {
		if (!this.heirloom)
			this.heirloom = new HeirloomData();
		this.heirloom.parser(bytes);
	}

	public setWingSkill(): void {
		this.wingSkillData = [];
		// this.wingSkillData = [90001,90002,90003,90004,90005];
		for (let j: number = 0; j < this.wingsData.lv + 1; j++) {
			let tData = GlobalConfig.WingLevelConfig[j];
			if (tData && tData.pasSkillId) {
				this.wingSkillData.push(tData.pasSkillId);
			}
		}
	}

	//主宰装备
	public parserModel(bytes: GameByteArray) {
		let len: number = bytes.readShort();
		this.zhuZaiData = [];
		for (let j: number = 0; j < len; j++) {
			let data: ZhuZaiData = new ZhuZaiData;
			data.parser(bytes);
			this.zhuZaiData[data.id - 1] = data;
		}
	}

	//装扮
	public parserZhuangbei(bytes: GameByteArray): void {
		this.zhuangbei = [];
		for (let i: number = 0; i < 4; i++) {
			this.zhuangbei.push(bytes.readInt());
		}
	}

	/**
	 * 解析符文
	 * @param  {GameByteArray} bytes
	 * @returns void
	 */
	parserRune(bytes: GameByteArray): void {
		//服务器规定-固定为8个
		let num: number = 8;
		let rd: ItemData = null;
		this.runeDatas = [];
		for (let i: number = 0; i < num; i++) {
			rd = new ItemData();
			rd.parser(bytes);
			this.runeDatas.push(rd);
		}
	}
	/**
	 * 锻造数据更改
	 * @param bytes
	 * @param panelNum 面板类型 0 强化 1 宝石 2 注灵 3 突破 4 开光
	 */
	public parseForgeChange(bytes: GameByteArray, packageID: number): number {
		let index: number = bytes.readInt();
		switch (packageID) {
			case PackageID.strongthen:
				this.equipsData[index].strengthen = bytes.readInt();
				break;
			case PackageID.Gem:
				this.equipsData[index].gem = bytes.readInt();
				break;
			case PackageID.Zhuling:
				this.equipsData[index].zhuling = bytes.readInt();
				break;
			case PackageID.Tupo:
				this.equipsData[index].tupo = bytes.readInt();
				break;
			case 1100:
				this.equipsData[index].bless = bytes.readInt();
				break;
		}
		return index;
	}

	public parserExAtt(bytes: GameByteArray): void {
		let count: number = bytes.readShort();
		for (let i = 0; i < count; i++) {
			this.attributeExData[i] = bytes.readInt();
		}
	}

	parserOtherRole(bytes: GameByteArray,isHuman: boolean): void {
		this.parserAtt(bytes);
		this.parserExAtt(bytes);

		this._name = bytes.readString();
		//实体人类才解析
		if (isHuman) this._servId = bytes.readInt();
		this.job = bytes.readByte();
		this.sex = bytes.readByte();
		this._lv = bytes.readInt();

		this.equipsData = [];
		//身体
		this.equipsData[2] = new EquipsData;
		this.equipsData[2].item = new ItemData;
		this.equipsData[2].item.configID = bytes.readInt();
		//武器
		this.equipsData[0] = new EquipsData;
		this.equipsData[0].item = new ItemData;
		this.equipsData[0].item.configID = bytes.readInt();

		this.wingsData = new WingsData;
		this.wingsData.lv = bytes.readInt();
		this.wingsData.openStatus = bytes.readInt();

		//称号
		this.title = bytes.readInt();
		//仙盟id
		this.guildID = bytes.readInt();
		//仙盟名
		this.guildName = bytes.readString();
		//天仙等级
		// this.warLevel = bytes.readInt();

		this.parserZhuangbei(bytes);
		//历练等级
		this.lilianLv = bytes.readInt();
		//当前其他人和机器人使用的剑灵id
		this.weaponsId = bytes.readShort();
		//诛仙装备
		this.parserhHeirloom(bytes);
		//short  阵营id，用于阵营战，1为冰，2为火
		this.camp = bytes.readShort();
		// this.mbRing = bytes.readByte();
		//
		// this.hsRing = bytes.readByte();
		this.flySwordId = bytes.readInt();
		this.huanShouHandle = bytes.readDouble();
	}

	public set mbRing(value: number) {
		this._mbRing = value;
	}

	public get mbRing(): number {
		return this._mbRing;
	}

	/**
	 * 通过锻造类型获取等级最小的装备索引
	 * @param type 0 强化 1 铸造 2 精炼  突破和剑灵是两个不同功能 突破是原来旧系统的
	 */
	public getMinEquipIndexByType(type: number): number {
		let index: number = 0;
		let min: number = Number.MAX_VALUE;
		let lv: number = 0;
		let num: number = ForgeConst.CAN_FORGE_EQUIP.length;
		for (let n: number = 0; n < num; ++n) {
			let i: number = ForgeConst.CAN_FORGE_EQUIP[n];
			switch (type) {
				case ForgeWin.Page_Select_Boost:
					lv = this.equipsData[i].strengthen;
					break;
				case ForgeWin.Page_Select_Gem://
					//每8级一个循环
					// lv = Math.floor(this.equipsData[i].gem / UserGem.ROLL_NUM);
					lv = this.equipsData[i].gem;//取最小的铸造等级
					let openConfig: StoneOpenConfig = GlobalConfig.StoneOpenConfig[i];
					if (Actor.level < openConfig.openLv)
						continue;
					break;
				case ForgeWin.Page_Select_ZhuLing://精炼
					lv = this.equipsData[i].zhuling;
					break;
				case 3://这里是原有的突破功能 剑灵是单独处理 所以此3非剑灵的3
					lv = this.equipsData[i].tupo;
					break;
			}
			if (min > lv) {
				min = lv;
				index = i;
			}
		}
		return index;
	}

	/**
	 * 通过锻造类型获取装备总等级
	 * @param type 0 强化 1 宝石 2 注灵 3 突破
	 */
	public getEquipForgeTotalLv(type: number): number {
		let totalLv: number = 0;
		let n: number = ForgeConst.CAN_FORGE_EQUIP.length;
		while (n--) {
			let i: number = ForgeConst.CAN_FORGE_EQUIP[n];
			switch (type) {
				case ForgeWin.Page_Select_Boost:
					totalLv += this.getEquipByIndex(i).strengthen;
					break;
				case ForgeWin.Page_Select_Gem:
					totalLv += this.getEquipByIndex(i).gem;
					break;
				case ForgeWin.Page_Select_ZhuLing:
					totalLv += this.getEquipByIndex(i).zhuling;
					break;
				case 3:
					totalLv += this.getEquipByIndex(i).tupo;
					break;
			}
		}
		return totalLv;
	}

	public getEquipForgeLv(solt: number, type: number): number {
		let lv = 0;
		switch (type) {
			case ForgeWin.Page_Select_Boost:
				lv += this.getEquipByIndex(solt).strengthen;
				break;
			case ForgeWin.Page_Select_Gem:
				lv += this.getEquipByIndex(solt).gem;
				break;
			case ForgeWin.Page_Select_ZhuLing:
				lv += this.getEquipByIndex(solt).zhuling;
				break;
			case 3:
				lv += this.getEquipByIndex(solt).tupo;
				break;
		}
		return lv;
	}

	public getAllHeirloomPower(): number {
		let total = 0;
		for (let i = 0; i < 8; i++)
			total += this.getHeirloomSlotPower(i);
		return total;
	}

	public getHeirloomSlotPower(solt: number) {
		let info: HeirloomInfo = this.heirloom.getInfoBySolt(solt);
		let power = UserBag.getAttrPower(info.attr) || 0;
		let add_attr = info.attr_add;
		let forgePower: number = 0;
		let equipData = this.getEquipByIndex(solt);

		if (equipData.item.itemConfig) {
			forgePower += equipData.item.point;

			for (let i = 0; i < 3; i++) {
				let lv = this.getEquipForgeLv(solt, i);
				let config: EnhanceAttrConfig
					| StoneLevelConfig
					| ZhulingAttrConfig
					| TupoAttrConfig = UserForge.ins().getForgeConfigByPos(solt, lv, i);
				forgePower += UserBag.getAttrPower(config.attr) || 0;
			}
		}

		let totalPower = power + Math.floor(forgePower * (add_attr / 100));
		return totalPower;
	}

	public getCurSkillIDs(): number[] {
		let data: number[] = [];
		for (let i = 0; i < this.skillsData.length; i++) {
			data.push(this.skillsData[i].lv1ConfigID);
		}
		return data;
	}

	public mergeData(data: any): Role {
		this.masterHandle = data.masterHandle;
		this.huanShouHandle = data.huanShouHandle;
		this.handle = data.handle;
		// this.configID = data.configID;
		this.type = data.type;
		this.x = data.x;
		this.y = data.y;
		// this.power = data.power;
		this.attributeData = data.attributeData;
		this.attributeExData = data.attributeExData;
		this.team = data.team;
		this.lilianLv = data.lilianLv;
		this.name = data.name;
		this.guildID = data.guildID;
		this.guildName = data.guildName;
		this.isMy = data.isMy;
		this.title = data.title;
		if (data instanceof Role) {
			// this.warLevel = data.warLevel;
			this.mbRing = data.mbRing;
			this.hsRing = data.hsRing;
		}
		return this;
	}

	/**
	 * 根据装备位置获取该装备数据
	 * @param subType 装备子类型
	 */
	public getEquipDataByPos(pos: number): EquipsData {
		if (this.equipsData && this.equipsData[pos]) {
			return this.equipsData[pos];
		}
		return null;
	}

	/**
	 * 锻造总战斗力
	 */
	public getForgeTotalPower(type: number): number {
		let totalPower: number = 0;
		let n: number = ForgeConst.CAN_FORGE_EQUIP.length;
		while (n--) {
			let i: number = ForgeConst.CAN_FORGE_EQUIP[n];
			let lv: number;
			switch (type) {
				case ForgeWin.Page_Select_Boost:
					lv = this.equipsData[i].strengthen;
					break;
				case ForgeWin.Page_Select_ZhuLing:
					lv = this.equipsData[i].zhuling;
					break;
				case ForgeWin.Page_Select_Gem:
					lv = this.equipsData[i].gem;
					break;
				case 3:
					lv = this.equipsData[i].tupo;
					break;
			}
			if (lv > 0) {
				let forgeConfig: EnhanceAttrConfig
					| StoneLevelConfig
					| ZhulingAttrConfig
					| TupoAttrConfig = UserForge.ins().getForgeConfigByPos(i, lv, type);
				totalPower += Math.floor(UserBag.getAttrPower(forgeConfig.attr));
			}
		}
		return totalPower;
	}
	/**
	 * 剑灵战斗力
	 * @param 剑灵id(有值则返回指定剑灵战斗力)
	 * **/
	public getWeaponTotalPower(id?: number) {
		let totalPower: number = 0;
		let attr: AttributeData[] = [];
		if (id > 0) {
			let wsconfig: WeaponSoulConfig = GlobalConfig.WeaponSoulConfig[id];
			for (let i = 0; i < wsconfig.actcond.length; i++) {
				let slot: number = wsconfig.actcond[i];
				let winfo: WeaponsInfo = this.weapons.getSlotByInfo(slot);
				if (winfo) {
					for (let j = 0; j < winfo.attr.length; j++) {
						let at: AttributeData = new AttributeData;
						at.type = winfo.attr[j].type;
						at.value = winfo.attr[j].value;
						attr.push(at);
					}
				}
			}
		}
		else {
			let infodata: Map<Map<WeaponsInfo>> = this.weapons.getInfoData();
			for (let k in infodata) {
				let wsinfo: Map<WeaponsInfo> = infodata[k];
				for (let w in wsinfo) {
					let info: WeaponsInfo = wsinfo[w];
					if (info) {
						for (let j = 0; j < info.attr.length; j++) {//每个部位的属性
							let at: AttributeData = new AttributeData;
							let tmp: { type: number, value: number } = info.attr[j];
							at.type = tmp.type;
							at.value = tmp.value;
							attr.push(at);
						}
					}
				}
			}
		}


		// let wsSoulInfo:Map<WeaponsSoulInfo> = this.weapons.getSoulInfoData();
		// for( let k in wsSoulInfo ){//所有剑灵
		// 	let info:WeaponsSoulInfo = wsSoulInfo[k];
		// 	if( info.id ){
		// 		let wsconfig:WeaponSoulConfig = GlobalConfig.WeaponSoulConfig[info.id];
		// 		for( let i = 0;i < wsconfig.actcond.length;i++ ){//此剑灵的所有部位
		// 			let slot:number = wsconfig.actcond[i];
		// 			let wsinfo:WeaponsInfo = this.weapons.getSlotByInfo(slot);
		// 			if( wsinfo ){
		// 				for( let j = 0;j < wsinfo.attr.length;j++ ){//每个部位的属性
		// 					let at:AttributeData = new AttributeData;
		// 					let tmp:{type:number,value:number} = wsinfo.attr[j];
		// 					at.type = tmp.type;
		// 					at.value = tmp.value;
		// 					attr.push(at);
		// 				}
		// 			}
		// 		}
		// 	}
		// }
		totalPower += Math.floor(UserBag.getAttrPower(attr));
		return totalPower;
	}

	public get name(): string {
		return this._name;
	}

	public set name(str: string) {
		this._name = str;
	}

	/**获取带服务器ID的名字（注意，这里服务器ID会换行！） */
	public getNameWithServer2(): string {
		return this._servId && KFServerSys.ins().isKF ? this.name + `\nS${this._servId}` : this.name;
	}

	public get guildAndName(): string {
		let specailColor: string = this.camp > 0 && BattleCC.ins().isBattle() ? (this.camp != BattleCC.ins().camp ? "#FF0000" : "#00FF00") : null;
		let str: string = this.guildID == 0 || this.guildID == undefined ? this._name : `<font color='${specailColor ? specailColor : this.guildID == GuildWar.ins().getModel().winGuildInfo.guildId ? "#ffb243" : this.guildID == Guild.ins().guildID ? "#5add70" : "#2CC2F8"}}'>` + this.guildName + "</font>" + "\n" + this._name;
		if (this.lilianLv > 0) {
			let config: TrainLevelConfig = GlobalConfig.TrainLevelConfig[this.lilianLv];
			if (config.type > 1) {
				let color: string = ColorUtil.JUEWEI_COLOR[config.type - 1];
				str += ` <font color=${specailColor ? specailColor : color}>[${config.trainName}]</font>`;
			}
		}

		return str;
	}

	public get lilianUrl() {
		// if (this.lilianLv >= 0) {
		// 	let config: TrainLevelConfig = GlobalConfig.TrainLevelConfig[this.lilianLv];
		// 	if (config.type > 1) {
		// 		return `juewei_0_${config.type > 7 ? 7 : config.type}_png`;
		// 	}
		// }
		return '';
	}

	public get lv(): number {
		return this._lv;
	}

	public get servId(): number {
		return this._servId;
	}

	//------------------------------------------------------获取数据方法---------------------------------------------
	/**根据索引获取主宰装备 */
	public getZhuZaiDataByIndex(index: number): ZhuZaiData {
		return this.zhuZaiData[index];
	}

	/**根据索引获取装备 */
	public getEquipByIndex(index: number): EquipsData {
		return this.equipsData[index];
	}

	/** 是否隐藏剑灵特效 */
	public hideWeapons(): boolean {
		let id: number = this.getEquipByIndex(0).item.configID;
		return GlobalConfig.EquipConfig[id] && GlobalConfig.EquipConfig[id].noWSoulEff >= 1;  //是否隐藏剑灵特效
	}

	/**获取装备数量 */
	public getEquipLen(): number {
		return this.equipsData.length;
	}

	/** 根据索引获取特殊戒指数据 */
	public getExRingsData(index: number): number {
		return this.exRingsData[index];
	}

	/** 根据所以设置特殊戒指数据 */
	public setExRingsData(index: number, value: number): void {
		this.exRingsData[index] = value;
	}

	/** 根据所以设置主宰装备 */
	public setZhuZaiData(index: number, value: ZhuZaiData): void {
		this.zhuZaiData[index] = value;
	}

}
