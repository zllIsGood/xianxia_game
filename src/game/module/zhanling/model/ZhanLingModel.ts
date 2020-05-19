/**
 * 战灵控制模块
 */
class ZhanLingModel extends BaseClass {
	private _ZhanLingData: Map<ZhanLingData>;
	private _ZhanLingSkinId: number;//当前幻化的皮肤编号
	private _showZLlist: ZhanLingBase[];//战灵皮肤界面所显示的皮肤列表
	public static showTypeList = [AttributeType.atAttack, AttributeType.atMaxHp, AttributeType.atDef, AttributeType.atRes];

	constructor() {
		super();
		this._ZhanLingData = {};
		this._ZhanLingSkinId = 0;
		this._showZLlist = [];
	}

	public static ins(): ZhanLingModel {
		return super.ins() as ZhanLingModel;
	}

	public get ZhanLingData(): Map<ZhanLingData> {
		return this._ZhanLingData;
	}

	public getZhanLingDataById(id: number): ZhanLingData {
		return this._ZhanLingData[id];
	}

	public setZhanLingData(value: ZhanLingData) {
		if (!value) return;
		this._ZhanLingData[value.id] = value;
	}

	public get ZhanLingSkinId(): number {
		return this._ZhanLingSkinId;
	}

	public set ZhanLingSkinId(value: number) {
		this._ZhanLingSkinId = value;
	}

	public get showZLlist(): ZhanLingBase[] {
		return this._showZLlist;
	}

	public set showZLlist(value: ZhanLingBase[]) {
		this._showZLlist = value;
	}

	/**战灵是否开启*/
	public ZhanLingOpen() {
		return UserZs.ins().lv >= GlobalConfig.ZhanLingConfig.openzhuanshenglv && GameServer.serverOpenDay + 1 >= GlobalConfig.ZhanLingConfig.openserverday;
	}

	/**获取战灵等级*/
	public getZhanLingDataByLevel(id: number): number {
		return this._ZhanLingData[id] ? this._ZhanLingData[id].level : 0;
	}

	/**获取战灵阶级*/
	public getZhanLingDataByStage(id: number): number {
		if (!this._ZhanLingData[id]) return -1;//一键升星切换到未激活皮肤
		if (!this._ZhanLingData[id].level) return 1;
		let stage = Math.floor(this._ZhanLingData[id].level / 10);
		let stage2 = Math.floor(this._ZhanLingData[id].level % 10);
		stage += 1;
		if (!stage2) {
			stage -= 1;
		}
		if (!stage)//0~9
			stage = 1;
		return stage;
	}

	/**获取下一个战灵天赋开启阶级*/
	public getZhanLingDataByNextStage(id: number): number[] {
		let talentLv = 0;
		if (this._ZhanLingData[id]) {
			talentLv = this._ZhanLingData[id].talentLv;
		}
		let zlLevel: ZhanLingLevel[] = GlobalConfig.ZhanLingLevel[id];
		let nextConfig: ZhanLingLevel;
		for (let i in zlLevel) {
			let cfg = zlLevel[i];
			if (cfg.talentLevel > talentLv) {
				nextConfig = cfg;
				break;
			}
		}
		if (!nextConfig) return null;
		return this.getStageLv(nextConfig.level);
	}

	/**获取战灵星级*/
	public getZhanLingDataByStar(id: number): number {
		if (!this._ZhanLingData[id] || !this._ZhanLingData[id].level) return 0;
		let star = Math.floor(this._ZhanLingData[id].level % 10);
		if (!star)
			star = 10;

		return star;
	}

	/**获取战灵天赋等级*/
	public getZhanLingDataByTalentLv(id: number): number {
		if (!this._ZhanLingData[id]) {
			return 0;
		}
		//查看天赋是否可以从表中索引出来 不行则用服务器返回的值
		let lv = this.getZhanLingDataByLevel(id);
		let talentLevel = GlobalConfig.ZhanLingLevel[id][lv].talentLevel;
		if (talentLevel)
			this._ZhanLingData[id].talentLv = talentLevel
		return this._ZhanLingData[id].talentLv;
	}

	/**获取战灵经验*/
	public getZhanLingDataByExp(id: number): number {
		return this._ZhanLingData[id] ? this._ZhanLingData[id].exp : 0;
	}

	/**获取某个战灵装备某个部位装备id*/
	public getZhanLingDataByItem(id: number, pos: number): number {
		return this._ZhanLingData[id] ? this._ZhanLingData[id].items[pos - 1] : 0;
	}

	/**获取某个战灵是否可以使用某个丹药*/
	public getZhanLingDataByDrugUse(id: number, itemid: number): boolean {
		if (!this._ZhanLingData[id]) return false;
		let myCount = 0;
		let itemData: ItemData = UserBag.ins().getBagItemById(itemid);
		myCount = itemData ? itemData.count : 0;
		if (!myCount) return false;
		let lv = this._ZhanLingData[id].level;
		let config: ZhanLingLevel = GlobalConfig.ZhanLingLevel[id][lv];
		//判定是否是皮肤 若是则不需要判定使用上限 因为皮肤不可使用丹药
		if (id && !config.maxCount) false;
		let isUseMax = false;//是否使用到最大极限
		if (config.maxCount && config.maxCount[itemid]) {//有值代表有使用限制
			//检查丹药使用最大限制状况
			for (let i = 0; i < this._ZhanLingData[id].drugs.length; i++) {
				if (this._ZhanLingData[id].drugs[i].itemId == itemid && this._ZhanLingData[id].drugs[i].count >= config.maxCount[itemid]) {
					isUseMax = true;
					break;
				}
			}
		}
		if (isUseMax) return false;//已经达到使用上限

		return true;
	}

	/**获取某个战灵的天赋编号*/
	public getZhanLingDataByTalentId(id: number): number {
		let config: ZhanLingBase = GlobalConfig.ZhanLingBase[id];
		return config ? config.talent : 0;
	}

	/**
	 * 获取某个战灵的技能列表
	 * */
	public getZhanLingDataBySkill(id: number): { id: number, open: number }[] {
		let skill: { id: number, open: number }[] = [];
		if (!this._ZhanLingData[id]) return skill;
		return GlobalConfig.ZhanLingBase[id].skill;
	}

	/**获取某个战灵某个丹药使用状况*/
	public getZhanLingDataByDrug(id: number, itemid: number): number {
		if (!this._ZhanLingData[id]) return 0;
		for (let i = 0; i < this._ZhanLingData[id].drugs.length; i++) {
			if (this._ZhanLingData[id].drugs[i].itemId == itemid)
				return this._ZhanLingData[id].drugs[i].count;
		}
		return 0;
	}

	/**获取战灵套装等级*/
	public getZhanLingDataBySuit(id: number): number {
		if (!this._ZhanLingData[id]) return 0;
		let lv = 0;
		for (let i = 0; i < this._ZhanLingData[id].items.length; i++) {
			let itemid = this._ZhanLingData[id].items[i];
			let config: ZhanLingEquip = GlobalConfig.ZhanLingEquip[itemid];
			if (!config) return 0;//其中一件装备没穿戴都没有套装等级
			if (!lv)
				lv = config.level;
			if (lv > config.level)
				lv = config.level;
		}
		return lv;
	}

	/**根据战灵套装等级获取目前身上装备满足条件的数量*/
	public getZhanLingDataBySuitCount(id: number, lv: number): number {
		if (!this._ZhanLingData[id]) return 0;
		let count = 0;
		for (let i = 0; i < this._ZhanLingData[id].items.length; i++) {
			let itemid = this._ZhanLingData[id].items[i];
			let config: ZhanLingEquip = GlobalConfig.ZhanLingEquip[itemid];
			if (config.level >= lv) {
				count++;
			}
		}
		return count;
	}

	/**
	 * 获取战灵天赋所需激活/升级材料id数量
	 * @param 战灵id
	 * @param 战灵皮肤激活流程
	 * @return 0:证明不需要激活或不可升级 比如皮肤编号(战灵id)=0的
	 * */
	public getZhanLingDataByMat(id: number, act?: boolean): number {
		if (!act && !this._ZhanLingData[id]) return 0;
		let config: ZhanLingBase = GlobalConfig.ZhanLingBase[id];
		let talent = config.talent;
		let lv = 0;
		if (act) {//激活皮肤流程
			lv = 1;
		} else {
			if (!this._ZhanLingData[id].talentLv) return 0;
			lv = this._ZhanLingData[id].talentLv + 1;//取下一级的所需材料
		}
		let zltconfig: ZhanLingTalent = GlobalConfig.ZhanLingTalent[talent][lv];
		return zltconfig ? zltconfig.costCount : 0;
	}

	/**
	 * 获取身上战灵总战力
	 * @param 战灵id
	 * @param 获取展示属性万分比计算的属性集
	 * @return [] 0:总战力 1:当前属性 2:下一属性
	 * */
	public getZhanLingPower(id: number): any {
		let power: number = 0;
		let lv = ZhanLingModel.ins().getZhanLingDataByLevel(id);
		let zllconfig: ZhanLingLevel = GlobalConfig.ZhanLingLevel[id][lv];
		if (!zllconfig) return [power, [], []];
		let zlData: ZhanLingData = ZhanLingModel.ins().getZhanLingDataById(id);
		if (!zlData) return [power, [], []];
		let nextzllconfig: ZhanLingLevel = GlobalConfig.ZhanLingLevel[id][lv + 1];
		let zlValue: number = 0;//战灵等级表基础属性战力
		let zlAttr: AttributeData[] = [];//基础属性数据记录
		let nzlAttr: AttributeData[] = [];//下一基础属性数据记录
		let itValue: number = 0;//战灵各个部位加总的战力
		let tzValue: number = 0;//战灵套装战力
		let tzAttr: AttributeData[] = [];//套装属性数据记录
		let ntzAttr: AttributeData[] = [];//下一套装属性数据记录
		let dyValue: number = 0;//战灵丹药加成战力
		let dyAttr: AttributeData[] = [];//丹药属性数据记录
		let ndyAttr: AttributeData[] = [];//下一丹药属性数据记录
		let tfValue: number = 0;//战灵天赋战力
		let jnValue: number = 0;//战灵技能战力
		//战灵等级基础属性
		zlValue += UserBag.getAttrPower(zllconfig.attrs) * SubRoles.ins().subRolesLen;
		for (let r = 0; r < SubRoles.ins().subRolesLen; r++) {
			let role = SubRoles.ins().getSubRoleByIndex(r);
			//基础属性的关联战力
			for (let i in zllconfig.attrs) {
				zlValue += ItemConfig.relatePower(zllconfig.attrs[i], role);
			}
		}
		zlValue += (zllconfig.expower ? zllconfig.expower : 0) * SubRoles.ins().subRolesLen;
		zlAttr = this.addAttrs(zlAttr, zllconfig.attrs);//统计基础属性
		if (nextzllconfig) {
			nzlAttr = this.addAttrs(nzlAttr, nextzllconfig.attrs);//下一统计基础属性
		}
		//套装属性
		let suitLv = ZhanLingModel.ins().getZhanLingDataBySuit(id);
		if (suitLv) {
			let cfg: ZhanLingSuit = GlobalConfig.ZhanLingSuit[suitLv];
			if (cfg && cfg.attrs) {
				tzValue += UserBag.getAttrPower(cfg.attrs) * SubRoles.ins().subRolesLen;
				for (let i = 0; i < cfg.attrs.length; i++) {
					for (let r = 0; r < SubRoles.ins().subRolesLen; r++) {
						let role = SubRoles.ins().getSubRoleByIndex(r);
						tzValue += ItemConfig.relatePower(cfg.attrs[i], role);
					}
				}
				//统计套装属性(基于基础属性的加成)
				tzAttr = AttributeData.getPercentAttr(zlAttr, (cfg.precent / 10000));//算出万分比
				if (nextzllconfig) {//下一套装属性
					ntzAttr = AttributeData.getPercentAttr(nzlAttr, (cfg.precent / 10000));//算出万分比
				}
			}
		}

		//丹药加成战力
		for (let i = 0; i < zlData.drugs.length; i++) {//每一个丹药的加成效果
			let tempdyAttr = [];
			let ntempdyAttr = [];
			let uginfo = GlobalConfig.ZhanLingConfig.upgradeInfo[zlData.drugs[i].itemId];//母本
			//加总同一个类型的丹药吃了几颗 对丹药属性进行对应加成 生成一份副本
			let uginfoAttr = [];
			for (let d = 0; d < uginfo.attr.length; d++) {
				let atb: AttributeData = new AttributeData();
				atb.type = uginfo.attr[d].type;
				atb.value = (uginfo.attr[d].value * zlData.drugs[i].count) >> 0;
				uginfoAttr.push(atb);
			}
			let uginfoFB = {
				attr: uginfoAttr,
				precent: uginfo.precent ? uginfo.precent * zlData.drugs[i].count : 0,
				sort: uginfo.sort
			};
			dyValue += UserBag.getAttrPower(uginfoFB.attr) * SubRoles.ins().subRolesLen;//计算N角色丹药基础属性战力
			dyAttr = this.addAttrs(dyAttr, uginfoFB.attr);//把每一份丹药基础属性效果统计起来
			ndyAttr = this.addAttrs(ndyAttr, uginfoFB.attr);//下一级预览
			//有一些道具没有丹药万分比加成
			if (uginfoFB.precent) {
				dyValue += Math.floor(zlValue * uginfoFB.precent / 10000);
				//根据是否有套装判定丹药加成
				if (suitLv)//有套装再算一份
					dyValue += Math.floor(zlValue * uginfoFB.precent / 10000);
				//统计丹药加成属性(基于基础属性的加成)
				tempdyAttr = AttributeData.getPercentAttr(zlAttr, (uginfoFB.precent / 10000));//算出万分比
				dyAttr = this.addAttrs(dyAttr, tempdyAttr);//把每一份丹药加成效果统计起来
				if (nextzllconfig) {
					ntempdyAttr = AttributeData.getPercentAttr(nzlAttr, (uginfoFB.precent / 10000));//算出万分比
					ndyAttr = this.addAttrs(ndyAttr, ntempdyAttr);//把每一份丹药加成效果统计起来
				}
			}
			for (let r = 0; r < SubRoles.ins().subRolesLen; r++) {
				let role = SubRoles.ins().getSubRoleByIndex(r);
				dyValue += ItemConfig.relatePower(uginfoFB.attr[i], role);//计算不同玩家同一个丹药的关联战力
			}
		}

		//装备总战力
		for (let i = 1; i <= GlobalConfig.ZhanLingConfig.equipPosCount; i++) {
			let itemid = ZhanLingModel.ins().getZhanLingDataByItem(id, i);
			itValue += this.getZhanLingItemPower(itemid, 1);
		}
		//天赋战力
		let talentId = this.getZhanLingDataByTalentId(id);
		let talentLv = this.getZhanLingDataByTalentLv(id);
		let zlTalent: ZhanLingTalent = GlobalConfig.ZhanLingTalent[talentId][talentLv];
		if (zlTalent) {
			let tfexpower = zlTalent.expower;
			tfValue += (tfexpower ? tfexpower : 0) * SubRoles.ins().subRolesLen;//计算N角色天赋战力
			if (zlTalent.attrs)
				tfValue += UserBag.getAttrPower(zlTalent.attrs) * SubRoles.ins().subRolesLen;
		}

		//技能战力
		let zlbase: ZhanLingBase = GlobalConfig.ZhanLingBase[id];
		for (let i = 0; i < zlbase.skill.length; i++) {
			let zlsConfig: ZhanLingSkill = GlobalConfig.ZhanLingSkill[zlbase.skill[i].id];
			//有等级限制
			if (lv < zlbase.skill[i].open) continue;
			if (!zlsConfig.attrs) continue;
			jnValue += UserBag.getAttrPower(zlsConfig.attrs) * SubRoles.ins().subRolesLen;//计算N角色技能战力
			for (let r = 0; r < SubRoles.ins().subRolesLen; r++) {
				let role = SubRoles.ins().getSubRoleByIndex(r);
				for (let j = 0; j < zlsConfig.attrs.length; j++) {
					jnValue += ItemConfig.relatePower(zlsConfig.attrs[j], role);//计算不同玩家同一个技能的关联战力
				}
			}
			if (zlsConfig.expower)
				jnValue += zlsConfig.expower;
		}

		power = zlValue + itValue + tzValue + dyValue + tfValue + jnValue;
		zlAttr = this.addAttrs(zlAttr, tzAttr);
		zlAttr = this.addAttrs(zlAttr, dyAttr);
		if (nextzllconfig) {
			nzlAttr = this.addAttrs(nzlAttr, ntzAttr);
			nzlAttr = this.addAttrs(nzlAttr, ndyAttr);
		}
		return [power, zlAttr, nzlAttr];

	}

	/**
	 * 累计属性(统计showTypeList里边才有的属性)
	 * @param 当前属性(母本 需要自行clone一份)
	 * @param 需要累计的属性值
	 * @param 累计后的当前属性值
	 * */
	public addAttrs(srcAttrs: AttributeData[], descAttrs: AttributeData[], clone = true) {
		let arr = clone ? [] : srcAttrs;
		if (clone) {//复制当前属性
			//统计当前属性值
			for (let a = 0; a < srcAttrs.length; a++) {
				if (ZhanLingModel.showTypeList.indexOf(srcAttrs[a].type) != -1)
					arr.push(new AttributeData(srcAttrs[a].type, srcAttrs[a].value));
			}
		}
		for (let i = 0; i < descAttrs.length; i++) {
			let isHave = false;
			if (ZhanLingModel.showTypeList.indexOf(descAttrs[i].type) == -1) continue;
			for (let j = 0; j < srcAttrs.length; j++) {
				if (srcAttrs[j].type == descAttrs[i].type) {
					arr[j].value += descAttrs[i].value;
					isHave = true;
					break;
				}
			}
			if (!isHave) {
				arr.push(new AttributeData(descAttrs[i].type, descAttrs[i].value));
			}
		}
		return arr;
	}

	/**
	 * 获取战灵道具战力
	 * @param itemid
	 * @param have 是否拥有 1:拥有 *实际角色数 0:没有 *3角色(一般用于商城等展示)
	 * */
	public getZhanLingItemPower(itemid: number, have: number = 0): number {
		let power = 0;
		let config: ZhanLingEquip = GlobalConfig.ZhanLingEquip[itemid];
		if (!config) return power;
		let len = have ? SubRoles.ins().subRolesLen : 3;
		power += UserBag.getAttrPower(config.attrs) * len;
		if (have) {
			//没有拥有的话忽略计算关联战斗力的情况
			for (let i = 0; i < len; i++) {
				let role: Role = SubRoles.ins().getSubRoleByIndex(i);
				for (let j = 0; j < config.attrs.length; j++) {
					power += ItemConfig.relatePower(config.attrs[j], role);
				}
			}
		}
		return power;
	}

	/**
	 * 是否满足升一星
	 * @param 战灵id(皮肤编号)
	 * */
	public isUpGradeByStar(id: number): boolean {
		if (!this.getZhanLingDataById(id)) {//没激活战灵 走激活战灵流程(其实就是升级天赋流程)
			return this.isUpGradeByTalent(id, true);
		}
		let curLv = ZhanLingModel.ins().getZhanLingDataByLevel(id);
		let config: ZhanLingLevel = GlobalConfig.ZhanLingLevel[id][curLv];
		if (!config || !config.exp) return false;//满阶满级
		let curExp = ZhanLingModel.ins().getZhanLingDataByExp(id);
		let reExp = config.exp - curExp;
		reExp = reExp > 0 ? reExp : 0;
		let needCount = Math.ceil(reExp / GlobalConfig.ZhanLingConfig.stageitemexp);
		let itemData: ItemData = UserBag.ins().getBagItemById(GlobalConfig.ZhanLingConfig.stageitemid);
		let curCount = itemData ? itemData.count : 0;
		return curCount >= needCount && curCount >= config.count;
	}

	/**
	 * 额外红点提示
	 * @param 战灵id(皮肤编号)
	 * */
	public isHintNum(id: number): boolean {
		let zlData: ZhanLingData = ZhanLingModel.ins().getZhanLingDataById(id);
		if (!zlData) return false;
		let config: ZhanLingLevel = GlobalConfig.ZhanLingLevel[id][zlData.level];
		if (!config || !config.exp) return false;//满阶满级
		let itemData: ItemData = UserBag.ins().getBagItemById(GlobalConfig.ZhanLingConfig.stageitemid);
		let curCount = itemData ? itemData.count : 0;
		return curCount >= GlobalConfig.ZhanLingConfig.hintNum;
	}

	/**
	 * 是否可以升级天赋
	 * @param 战灵id(皮肤编号)
	 * @param 是否需要激活(没激活战灵 走需要激活流程)
	 * */
	public isUpGradeByTalent(id: number, isAct: boolean = false): boolean {
		let zlData: ZhanLingData = ZhanLingModel.ins().getZhanLingDataById(id);
		if (!isAct && !zlData) return false;//非激活流程 未激活战灵不允许升级天赋
		let baseconfig: ZhanLingBase = GlobalConfig.ZhanLingBase[id];
		if (!baseconfig.mat) return false;//该战灵不允许升级天赋 比如战灵Id=0
		let itemData: ItemData = UserBag.ins().getBagItemById(baseconfig.mat);
		let curCount = itemData ? itemData.count : 0;
		let needCount = this.getZhanLingDataByMat(id, isAct);
		return needCount ? (curCount >= needCount) : false;//区别于没激活皮肤时候不允许升级天赋
	}

	/**
	 * 刷新可显示皮肤列表
	 * */
	public updateShowZLlist() {
		let arr = [];
		for (let k in GlobalConfig.ZhanLingBase) {
			if (!GlobalConfig.ZhanLingBase[k].sort) continue;
			arr.push(GlobalConfig.ZhanLingBase[k]);
		}
		arr.sort((a: ZhanLingBase, b: ZhanLingBase) => {
			if (a.sort < b.sort)
				return -1;
			else
				return 1;
		});
		this.showZLlist = [];//皮肤控件显示列表
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].show) {
				//动态显示的需要判定是否拥有了或者拥有激活道具
				let zlData: ZhanLingData = ZhanLingModel.ins().getZhanLingDataById(arr[i].id);
				if (zlData)
					this.showZLlist.push(arr[i]);
				else {
					let itemData: ItemData = UserBag.ins().getBagItemById(arr[i].mat);
					if (itemData && itemData.count)
						this.showZLlist.push(arr[i]);
				}
			} else {
				//静态直接显示
				this.showZLlist.push(arr[i]);
			}
		}
	}

	/**战灵装备红点*/
	public getZhanLingItemRedPoint(zlId: number, ) {
		let zlData: ZhanLingData = this.getZhanLingDataById(zlId);
		if (!zlData) return false;

		let itemData: ItemData[] = UserBag.ins().getItemByType(ItemType.TYPE_21);
		if (itemData)
			itemData.sort((a: ItemData, b: ItemData) => {
				let aconfig: ZhanLingEquip = GlobalConfig.ZhanLingEquip[a.configID];
				let bconfig: ZhanLingEquip = GlobalConfig.ZhanLingEquip[b.configID];
				if (aconfig.level > bconfig.level)
					return -1;
				else
					return 1;
			});

		for (let k = 0; k < zlData.items.length; k++) {
			let slot = k + 1;
			let itemid = zlData.items[k];
			let curequip: ZhanLingEquip;
			if (itemid) {//有数据代表部位有装备
				curequip = GlobalConfig.ZhanLingEquip[itemid];
			}
			for (let i = 0; i < itemData.length; i++) {
				let id = itemData[i].configID;
				let config: ItemConfig = GlobalConfig.ItemConfig[id];
				if (!config) continue;
				let zlequip: ZhanLingEquip = GlobalConfig.ZhanLingEquip[id];
				if (!zlequip) continue;
				if (slot != zlequip.pos) continue;
				let lv = config.level ? config.level : 0;
				let zslv = config.zsLevel ? config.zsLevel : 0;
				if (UserZs.ins().lv >= zslv && Actor.level >= lv) {//装备限制条件
					if (curequip) {//和身上的对比
						if (zlequip.level > curequip.level) {
							// this.bestId = zlequip.id;
							return true;
						} else {
							//由于背包战灵装备经过从好到坏的排序 这里一旦不比身上的好就可以断定后面的不会有更好
							break;
						}
					} else {
						// this.bestId = zlequip.id;
						return true;//身上没装备 直接可穿戴
					}
				}
			}
		}
		return false;
	}

	/**
	 * 计算任意战灵等级的等阶 无关于自身数据
	 * @param 战灵等级
	 * @return [等阶,星级]
	 * */
	public getStageLv(level: number): number[] {
		let stage = Math.floor(level / 10);
		let stage2 = Math.floor(level % 10);
		if (!stage2) {
			if (level && level % 10 == 0)
				stage2 = 10;
			else
				stage += 1;
		} else {
			stage += 1;
		}
		return [stage, stage2];
	}


	// public getMaxID():number
	// {
	// 	for(let dt of this._ZhanLingData)
	// 	{

	// 	}
	// }


	/**
	*计算基础战灵，战灵皮肤的战力
	*/
	public getTotalZhanLingPower() {
		let totalPower = 0;
		for ( let i in GlobalConfig.ZhanLingBase) {
			let zlBase: ZhanLingBase = GlobalConfig.ZhanLingBase[i];
			let power = this.getZhanLingPower(zlBase.id)[0]
			totalPower += power;
		}
		return totalPower;
	}

}
