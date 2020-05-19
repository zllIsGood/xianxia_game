/**锻造相关 */
class UserForge extends BaseSystem {
	public constructor() {
		super();

		this.sysId = PackageID.strongthen;
		this.regNetMsg(2, this.doForgeUpdata);

		this.regNetMsg(6, this.postAwaken);

		//这些消息监听都要改.
		this.observe(UserBag.ins().postItemAdd, this.seekForgeItem);//道具添加
		this.observe(UserBag.ins().postItemDel, this.seekForgeItem);//道具删除
		this.observe(UserBag.ins().postItemChange, this.seekForgeItem);//道具变更
		this.observe(Actor.ins().postSoulChange, this.seekForgeItem);//魂值变更
	}

	static get CONDITION_ZHUZAO() {
		return GlobalConfig.StoneOpenConfig[0].openLv;
	}

	public static ins(): UserForge {
		return super.ins() as UserForge;
	}

	public doForgeUpdata(bytes: GameByteArray): void {
		let roleId: number = bytes.readShort();
		let index: number = SubRoles.ins().getSubRoleByIndex(roleId).parseForgeChange(bytes, this.sysId);
		this.postForgeUpdate(this.sysId, index);
		// this.seekForgeItem();
	}

	/**派发锻造数据变更 */
	public postForgeUpdate(sysid: number, index: number = 0): number[] {
		return [sysid, index];
	}

	/**派发锻造提示 */
	public postForgeTips(b: boolean): number {
		return b ? 1 : 0;
	}

	/**
	 * 提升请求
	 * @param roleId 角色
	 * @param pos 部位
	 */
	public sendUpGrade(roleId: number, pos: number): void {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeShort(roleId);
		bytes.writeShort(pos);
		this.sendToServer(bytes);
	}


	private seekForgeItem(): void {
		let isReturn: boolean = false;
		let len: number = UserBag.ins().getBagItemNum(0);
		for (let i: number = 0; i < len; i++) {
			let item: ItemData = UserBag.ins().getItemByIndex(0, i);
			switch (item.itemConfig.id) {
				case 200002://强化石
					isReturn = this.forgeHint(0, item.count);
					break;
				case 200003://
					isReturn = this.forgeHint(ForgeWin.Page_Select_ZhuLing, item.count);
					break;
			}
			if (isReturn) break;
		}

		if (!isReturn) {//精炼石
			isReturn = this.forgeHint(ForgeWin.Page_Select_Gem, Actor.soul);
		}

		if (!isReturn) {//剑灵
			for (let roleIndex: number = 0; roleIndex < SubRoles.ins().subRolesLen; roleIndex++) {
				isReturn = Weapons.ins().checkRedPoint(roleIndex)
				if (isReturn)
					break;
			}
		}
		this.postForgeTips(isReturn);
	}

	//----------------------------------------------------
	/**
	 * 通过部位等级 获取锻造相关配置  0 强化配置 1注灵配置  2 宝石配置 3 突破配置
	 * @param pos 部位
	 * @param lv  等级
	 * @param configType 配置类型
	 */
	public getForgeConfigByPos(pos: number, lv: number, configType: number):
		EnhanceAttrConfig
		| StoneLevelConfig
		| ZhulingAttrConfig
		| TupoAttrConfig {
		let config = this.getForgeConfig(configType);
		return config[pos] && config[pos][lv];
	}

	//key1:posId key2:level
	private forgeConfigDic: { [key: number]: any };
	private getForgeConfig(configType) {
		this.forgeConfigDic = this.forgeConfigDic || {};

		if (!this.forgeConfigDic[configType]) {
			let list: EnhanceAttrConfig[] | StoneLevelConfig[] | ZhulingAttrConfig[] | TupoAttrConfig[];
			switch (configType) {
				case ForgeWin.Page_Select_Boost:
					list = GlobalConfig.EnhanceAttrConfig;
					break;
				case ForgeWin.Page_Select_ZhuLing:
					list = GlobalConfig.ZhulingAttrConfig;
					break;
				case ForgeWin.Page_Select_Gem:
					list = GlobalConfig.StoneLevelConfig;
					break;
				case 3:
					// list = GlobalConfig.TupoAttrConfig;
					break;
			}

			let config = this.forgeConfigDic[configType] = {} as any;
			for (let index in list) {
				let conf = list[index];
				if (!config[conf.posId]) {
					config[conf.posId] = {};
				}
				config[conf.posId][conf.level] = list[index];
			}
		}
		return this.forgeConfigDic[configType];
	}

	/**
	 * 通过等级获取强化消耗配置
	 * @param lv 等级
	 */
	public getEnhanceCostConfigByLv(lv: number): EnhanceCostConfig {
		let list: EnhanceCostConfig[] = GlobalConfig.EnhanceCostConfig;
		return list[lv];
		// let index: any;
		// for (index in list) {
		// 	let config: EnhanceCostConfig = list[index];
		// 	if (config.level == lv)
		// 		return config;
		// }
		// return null;
	}

	/**
	 * 通过等级获取宝石消耗配置
	 * @param lv 等级
	 */
	public getStoneLevelCostConfigByLv(lv: number): StoneLevelCostConfig {
		let list: StoneLevelCostConfig[] = GlobalConfig.StoneLevelCostConfig;
		let index: any;
		for (index in list) {
			let config: StoneLevelCostConfig = list[index];
			if (config.level == lv)
				return config;
		}
		return null;
	}

	/**
	 * 通过等级获取注灵消耗配置
	 * @param lv 等级
	 */
	public getZhulingCostConfigByLv(lv: number): ZhulingCostConfig {
		let list: ZhulingCostConfig[] = GlobalConfig.ZhulingCostConfig;
		let index: any;
		for (index in list) {
			let config: ZhulingCostConfig = list[index];
			if (config.level == lv)
				return config;
		}
		return null;
	}

	/**
	 * 判断精炼是否可以提升
	 */
	public jingLianCanUp(): boolean {
		let len: number = SubRoles.ins().subRolesLen;
		let b: boolean = false;
		for (let roleIndex: number = 0; roleIndex < len; roleIndex++) {
			let role: Role = SubRoles.ins().getSubRoleByIndex(roleIndex);
			let index: number = role.getMinEquipIndexByType(1);
			let lv: number = role.getEquipByIndex(index).zhuling;
			let costNum: number = UserForge.ins().getZhulingCostConfigByLv(lv + 1).count;
			if (costNum) {
				let goodId: number = UserForge.ins().getZhulingCostConfigByLv(lv + 1).itemId;
				let goodsNum: number = UserBag.ins().getItemCountById(0, goodId);
				if (goodsNum >= costNum) {
					b = true;
					break;
				}
			}
		}
		return b;
	}

	/**
	 * 通过等级获取突破消耗配置
	 * @param lv 等级
	 */
	public getTupoCostConfigByLv(lv: number): TupoCostConfig {
		// let list: TupoCostConfig[] = GlobalConfig.TupoCostConfig;
		// let index: any;
		// for (index in list) {
		// 	let config: TupoCostConfig = list[index];
		// 	if (config.level == lv)
		// 		return config;
		// }
		return null;
	}

	//	public getForgeIsBoost(num:number):boolean{
	//		let config: EnhanceCostConfig = this.getEnhanceCostConfigByLv(LogicManager.ins().rolesModel[]);
	//		return;
	//	}

	//----------------------------------锻造提示

	public forgeHint(type: number, itemNum: number): boolean {
		let len: number = SubRoles.ins().subRolesLen;
		for (let i: number = 0; i < len; i++) {
			let role: Role = SubRoles.ins().getSubRoleByIndex(i);
			let index: number = role.getMinEquipIndexByType(type);
			let lv: number = this.getForgeLv(type, role, index);
			let costNum: number = this.getForgeCount(type, lv);
			if (costNum) {
				if (itemNum >= costNum) {
					if (type != ForgeWin.Page_Select_Gem) {
						UserForge.ins().postForgeTips(true);
						return true;
					} else {
						//锻造额外条件 >=25
						if (Actor.level >= UserForge.CONDITION_ZHUZAO) {
							UserForge.ins().postForgeTips(true);
							return true;
						}
					}
				}
			}
		}
		UserForge.ins().postForgeTips(false);
		return false;
	}


	private getForgeLv(type: number, role: Role, index: number): number {
		switch (type) {
			case ForgeWin.Page_Select_Boost:
				return role.getEquipByIndex(index).strengthen;
			case ForgeWin.Page_Select_ZhuLing:
				return role.getEquipByIndex(index).zhuling;
			case ForgeWin.Page_Select_Gem:
				return role.getEquipByIndex(index).gem;
			case 3:
				return role.getEquipByIndex(index).tupo;
		}
	}

	private getForgeCount(type: number, lv: number): number {
		switch (type) {
			case ForgeWin.Page_Select_Boost:
				let boostConfig: EnhanceCostConfig = this.getEnhanceCostConfigByLv(lv + 1);
				if (boostConfig)
					return boostConfig.stoneNum;
				break;
			case ForgeWin.Page_Select_ZhuLing:
				let zhulingConfig: ZhulingCostConfig = this.getZhulingCostConfigByLv(lv + 1);
				if (zhulingConfig)
					return zhulingConfig.count;
				break;
			case ForgeWin.Page_Select_Gem:
				let gemConfig: StoneLevelCostConfig = this.getStoneLevelCostConfigByLv(lv + 1);
				if (gemConfig)
					return gemConfig.soulNum;
				break;
			case 3:
				let tupoConfig: TupoCostConfig = this.getTupoCostConfigByLv(lv + 1);
				if (tupoConfig)
					return tupoConfig.count;
				break;
		}
		return 0;
	}

	public countAllBoostAttr(roleId: number, type: number, pos: number = 0, next = false): AttributeData[] {
		let attrList: AttributeData[] = [];
		let roleData: Role = SubRoles.ins().getSubRoleByIndex(roleId);
		for (let i: number = 0; i < UserEquip.FOEGE_MAX; i++) {
			let cfg: EnhanceAttrConfig | StoneLevelConfig | ZhulingAttrConfig | TupoAttrConfig = null;
			let level: number = this.getForgeLv(type, roleData, i);//equipData[i].strengthen;
			if (next && pos == i) {
				level += 1;
			}
			cfg = UserForge.ins().getForgeConfigByPos(i, level, type);
			if (cfg) {
				attrList = UserForge.AttrAddition(cfg.attr, attrList);
			}
		}
		return attrList;
	}
	public isMaxForge(role: Role, index: number) {
		for (let i = 0; i < 8; i++) {
			let level: number = this.getForgeLv(index, role, index);
			let nextConfig = UserForge.ins().getForgeConfigByPos(index, level + 1, index);
			if (!nextConfig)
				return false;
		}
		return true;

	}

	//把第一个数组压到第二个数组
	static AttrAddition(attr1: AttributeData[], attr2: AttributeData[]): AttributeData[] {
		let len1: number = attr1.length;
		let len2: number = attr2.length;
		let attrList: AttributeData[] = [];
		let attr: AttributeData;
		for (let i: number = 0; i < len1; i++) {
			attr = AttributeData.copyAttrbute(attr1[i]);
			attrList.push(attr);
		}
		for (let k: number = 0; k < len2; k++) {
			let flag: boolean = false;
			for (let i: number = 0; i < attrList.length; i++) {
				if (attr2[k].type == attrList[i].type) {
					attrList[i].value = attrList[i].value + attr2[k].value;
					flag = true;
				}
			}
			if (!flag) {
				attr = AttributeData.copyAttrbute(attr2[k]);
				attrList.push(attr);
			}
		}
		return attrList;
	}

	//----------------------------装备觉醒-------------------------------------------
	/**
	 * 7-6
	 * 装备觉醒
	 * @param  {number} roleIndex
	 * @param  {number} pos
	 */
	public sendAwaken(roleIndex: number, pos: number) {
		let bytes: GameByteArray = this.getBytes(6);
		bytes.writeShort(roleIndex);
		bytes.writeShort(pos);
		this.sendToServer(bytes);
	}

	/**
	 * 装备觉醒返回
	 * 7-6
	 * @param  {GameByteArray} bytes
	 */
	public postAwaken(bytes: GameByteArray) {
		let roleIndex = bytes.readShort();
		let pos = bytes.readShort();
		let level = bytes.readInt();
		let roleData: Role = SubRoles.ins().getSubRoleByIndex(roleIndex);
		roleData.awakenData.setLevel(level, pos);
	}

	/**
	 * 获取当前可以升阶的装备索引
	 * @param  {number} roleIndex
	 * @returns number
	 */
	public getCanUpIndex(roleIndex: number): number {
		let roleData: Role = SubRoles.ins().getSubRoleByIndex(roleIndex);
		for (let i = 1; i < 9; i++) {
			if (roleData.awakenData.getRedPoint(i)) return i;
		}
		return 1;
	}

	/**
	 * 装备觉醒是否显示红点
	 * @param  {number} roleIndex
	 * @returns boolean
	 */
	public isHaveAwakenRps(roleIndex: number): boolean {
		//检测当前是否开启
		let awakenConf = GlobalConfig.AwakenBaseConfig;
		if ((GameServer.serverOpenDay + 1) < awakenConf.openday) {
			return false;
		}
		let level = String(awakenConf.level / 1000).split('.');
		let z = +level[0];
		let l = +level[1] * 10;
		if (z != 0 && UserZs.ins().lv < z) {
			return false;
		}
		if (Actor.level < l) {
			return false;
		}

		

		let roleData: Role = SubRoles.ins().getSubRoleByIndex(roleIndex);
		for (let i = 1; i < 9; i++) {
			if (roleData.awakenData.getRedPoint(i)) return true;
		}
		return false;
	}
}

class AwakenData {
	public posLevel: number[] = [];
	public parser(bytes: GameByteArray) {
		for (let i = 0; i < 8; i++) {
			this.posLevel[i] = bytes.readInt();
		}
	}

	public setLevel(level: number, pos: number) {
		this.posLevel[pos] = level;
	}

	/**
	 * 装备觉醒总战斗力（需要加上套装战斗力）
	 * @returns number
	 */
	public getTotalPower(): number {
		let rePower = 0;
		for (let i = 1; i < 9; i++) {
			let attrs = this.getAttrs(i, this.posLevel[i - 1]);
			rePower += UserBag.getAttrPower(attrs);
		}
		//觉醒共鸣属性
		let suit = this.getSuitData();
		let confs = GlobalConfig.SuitAttrConfig;
		let state = suit.getState();
		let conf;
		if (state == 1) {
			conf = confs[suit.getPreStage()];
		} else if (state == 2) {
			conf = confs[suit.needAwakenStage];
		}
		if (conf) {
			rePower += UserBag.getAttrPower(conf.attr);
		}
		return rePower;
	}

	private suitAttrs: AwakenSuitData;
	/**
	 * 获取套装属性
	 * @param  {number} roleIndex
	 */
	public getSuitData(): AwakenSuitData {
		if (!this.suitAttrs) this.suitAttrs = new AwakenSuitData();
		let curSuitStage = this.getNeedSuitStage();
		let cnt = 0;
		for (let lv of this.posLevel) {
			if (lv >= curSuitStage) {
				cnt++;
			}
		}
		this.suitAttrs.cnt = cnt;
		this.suitAttrs.needAwakenStage = curSuitStage;
		this.suitAttrs.maxLevel = 8;
		return this.suitAttrs;
	}

	private getNeedSuitStage(): number {
		let min = Math.min.apply(null, this.posLevel);
		let suitConfs = GlobalConfig.SuitAttrConfig;
		let stage = 0;
		let isActivation = false;
		for (let k in suitConfs) {
			stage = +k;
			if (min >= +k) {
				isActivation = true;
				continue;
			}
			//如果没有找到，则显示第一套属性
			if (!isActivation) {
				stage = +k;
			}
			break;
		}
		return stage;
	}

	/**
	 * 红点是否显示（等级足够、材料足够）
	 * @param  {number} pos
	 * @returns boolean
	 */
	public getRedPoint(pos: number): boolean {
		let awakenCondition = this.getCondition(pos);
		//满级了
		if (!awakenCondition) return false;
		if (UserZs.ins().lv < awakenCondition.needZs) return false;
		if (Actor.level < awakenCondition.needLv) return false;
		//道具
		let curNum = UserBag.ins().getItemCountById(0, awakenCondition.itemId);
		if (curNum < awakenCondition.needItemNum) return false;
		return true;
	}

	private getConf(pos: number, level: number): AwakenAttrConfig {
		let conf = GlobalConfig.AwakenAttrConfig[pos - 1];
		if (!conf) return null;
		return conf[level];
	}

	/**
	 * 觉醒属性（需要加上基础属性）
	 * @param  {number} pos
	 * @param  {number} level
	 * @returns AttributeData
	 */
	public getAttrs(pos: number, level: number): AttributeData[] {
		let conf = this.getConf(pos, level);
		if (!conf) return null;
		let baseAttr = [{ type: -1, value: conf.attr_add }];
		return conf.attr.concat(baseAttr);
	}

	/**
	 * 获取基础属性加成百分比
	 * @param  {number} pos
	 * @returns number
	 */
	public getBaseAttrAdd(pos: number): number {
		let conf = this.getConf(pos, this.posLevel[pos - 1]);
		if (!conf) return 0;
		return conf.attr_add;
	}

	private conditions: AwakenCondition[] = [];
	public getCondition(pos: number): AwakenCondition {
		let conf = this.getConf(pos, this.posLevel[pos - 1] + 1);
		if (!conf) return null;
		//等级
		let level = String(conf.rolelevel / 1000).split('.');
		let z = +level[0];
		let l = +level[1] * 10;
		let condition = this.conditions[pos - 1];
		if (!condition) {
			condition = new AwakenCondition();
			this.conditions[pos - 1] = condition;
		}
		condition.needLv = l;
		condition.needZs = z;
		//道具
		condition.itemId = conf.itemid;
		condition.needItemNum = conf.count;
		return condition;
	}

	public isMaxLevel(pos: number): boolean {
		return this.posLevel[pos - 1] == this.maxLevel(pos);
	}

	public maxLevel(pos: number): number {
		return Object.keys(GlobalConfig.AwakenAttrConfig[pos - 1]).length;
	}
}

class AwakenCondition {
	public itemId: number = 0;
	public needItemNum: number = 0;
	public needLv: number = 0;
	public needZs: number = 0;
}

class AwakenSuitData {
	public cnt: number = 0;
	/**需要觉醒的阶数 */
	public needAwakenStage: number = 0;
	public maxLevel: number = 0;

	/**
	 * 获取套装状态
	 * 0未激活 1有下级预览 2已满级
	 * @returns number
	 */
	public getState(): number {
		//当前阶段是否大于第一个阶段
		let conf = CommonUtils.object2Array(GlobalConfig.SuitAttrConfig);
		let first = conf[0];
		if (this.needAwakenStage == first.level) {
			return this.cnt == this.maxLevel ? 1 : 0;
		} else {
			let end = conf[conf.length - 1];
			if (this.needAwakenStage == end.level) {
				return this.cnt == this.maxLevel ? 2 : 1;
			} else {
				return 1;
			}
		}
	}

	public getSuitPower(type: number): number {
		let conf = this.getSuitConf(type);
		return UserBag.getAttrPower(conf.attr);
	}

	/**
	 * 获取前一阶套装数（已经达标了）
	 * @returns number
	 */
	public getPreStage(): number {
		let confs = CommonUtils.object2Array(GlobalConfig.SuitAttrConfig);
		let cnt = -1;
		for (let conf of confs) {
			if (this.needAwakenStage <= conf.level) continue;
			cnt++;
		}
		if (cnt == -1) return -1;
		return confs[cnt].level;
	}

	/**
	 * 获取套装配置
	 * 0表示前一阶
	 * 1表示当前阶
	 * @param  {number} type
	 * @returns AttributeData
	 */
	public getSuitConf(type: number): SuitAttrConfig {
		let confs = GlobalConfig.SuitAttrConfig;
		return type == 0 ? confs[this.getPreStage()] : confs[this.needAwakenStage];
	}
}

namespace GameSystem {
	export let  userforge = UserForge.ins.bind(UserForge);
}