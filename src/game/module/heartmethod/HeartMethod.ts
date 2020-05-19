/**
 * 心法
 */
class HeartMethod extends BaseSystem {
	private _proShowList = [];//生命 攻击 物防 魔防 按照HeartMethodAttrWin的顺序来
	public HeartMethodInfo: Map<HearMethodData>[];//每个角色的心法数据

	public PageData:HeartMethodConfig[];
	public constructor() {
		super();
		this.sysId = PackageID.HeartMethod;

		this.regNetMsg(1, this.postHeartInfo);
		this.regNetMsg(2, this.postHeartUpLevel);
		this.regNetMsg(5, this.postOneKeyDecompose);

		this.HeartMethodInfo = [];
		this.PageData = GlobalConfig.HeartMethodConfig;
	}

	public get proShowList(): HeartTypeData[] {
		if (!this._proShowList.length) {
			this._proShowList = GlobalConfig.HeartMethodBaseConfig.proShowList;
		}
		return this._proShowList;
	}

	public static ins(): HeartMethod {
		return super.ins() as HeartMethod;
	}

	/**心法是否达到额外开启限制*/
	public heartOpenCondition(hearId: number): boolean {
		if (hearId != undefined){
			let config: HeartMethodConfig = GlobalConfig.HeartMethodConfig[hearId];
			if (!config.openCondition)return true;//没有额外开启限制
			if ((GameServer.serverOpenDay + 1) < config.openCondition.day)
			return false;
			if (UserZs.ins().lv < config.openCondition.zs)
			return false;
			return true;
		}
	}

	/**心法达到额外修炼限制*/
	public heartUpCondition(roleId: number, hearId: number): boolean {
		let config: HeartMethodConfig = GlobalConfig.HeartMethodConfig[hearId];
		if (!config.upGradeCondition)return true;//没有额外修炼限制
		let hmdataMap: Map<HearMethodData> = this.HeartMethodInfo[roleId];
		if (!hmdataMap)return false;
		let hmdata: HearMethodData = hmdataMap[hearId];
		if (!hmdata)return false;
		let count = 0;
		for (let i = 0; i < hmdata.slots.length; i++) {
			if (hmdata.slots[i])//部位都开启
				count++;
		}
		if (count < config.upGradeCondition)
			return false;
		return true;
	}


	/**心法开启限制*/
	public checkOpen(): boolean {
		if (GameServer.serverOpenDay < (GlobalConfig.HeartMethodBaseConfig.serverDay - 1)) {//第N天开
			return false;
		}
		if (UserZs.ins().lv < GlobalConfig.HeartMethodBaseConfig.zsLv) {
			return false;
		}
		
		return true;
	}

	/**
	 * 获取心法部位配置
	 * @param  {number} item
	 * @param  {number} next
	 * @returns HeartMethodStarConfig
	 */
	public getHeartCfg(item: ItemData, next: boolean = false): HeartMethodStarConfig {
		let heartConfigs: HeartMethodStarConfig[] = GlobalConfig.HeartMethodStarConfig;
		if (Assert(heartConfigs, "HeartMethodStarConfig is null")) return null;
		let id: number = next ? item.configID + 1 : item.configID;
		return heartConfigs[id];
	}


	/**
	 * 计算当前某一个角色里边某一个心法的某一个部位属性集
	 * @param 角色id
	 * @param 心法id
	 * @param 部位id
	 * */
	public calcHeartSlotValue(roleId: number, id: number): AttributeData[] {
		let attrs: AttributeData[] = [];


		return attrs;
	}

	/**
	 * 在某角色某个心法上的某个部位没穿东西情况下
	 * 背包是否有对应可穿
	 * @param 角色id
	 * @param 心法id
	 * @param 部位索引(12345)
	 * @return 返回可穿部分的itemid 返回0则代表背包没有可穿的
	 * */
	public getHeartSlotItemIdWear(roleId: number, hearId: number, pos: number): number {
		let hmdataMap: Map<HearMethodData> = this.HeartMethodInfo[roleId];
		if (!hmdataMap)return 0;
		let hmdata: HearMethodData = hmdataMap[hearId];
		if (!hmdata)return 0;
		let itemData: ItemData[] = UserBag.ins().getItemByType(ItemType.TYPE_18);
		itemData.sort(this.changeSort);//从好到坏
		for (let data of itemData) {
			let cfg: HeartMethodStarConfig = GlobalConfig.HeartMethodStarConfig[data.configID];
			if (cfg.heartmethodId != hearId)continue;
			let itemConfig: ItemConfig = data.itemConfig;
			let lv = itemConfig.level ? itemConfig.level : 0;
			let zslv = itemConfig.zsLevel ? itemConfig.zsLevel : 0;
			if (Actor.level < lv || UserZs.ins().lv < zslv)continue;//至少要符合穿戴条件
			let pId: number = this.getSuitPosFromItemId(data.configID);
			if (pos == pId)//找到对应可穿部位
				return data.configID;
		}
		return 0;
	}

	/**
	 * 计算某个心法上的某个部位是否穿着东西
	 * @param 角色id
	 * @param 心法id
	 * @param 部位索引(12345)
	 * @return 返回身穿部分的itemid 返回0则代表没穿
	 * */
	public getHeartSlotItemId(roleId: number, hearId: number, pos: number): number {
		let hmdataMap: Map<HearMethodData> = this.HeartMethodInfo[roleId];
		if (!hmdataMap)return 0;
		let hmdata: HearMethodData = hmdataMap[hearId];
		if (!hmdata)return 0;
		if (hmdata.slots[pos - 1])
			return hmdata.slots[pos - 1];
		// for( let i = 0;i < hmdata.slots.length;i++ ){
		// 	let pId:number = this.getSuitPosFromItemId(hmdata.slots[i]);
		// 	if( pId == pos ){
		// 		return hmdata.slots[i];
		// 	}
		// }

		return 0;
	}

	/**
	 * 计算某个心法上的身穿部位是否可被替换
	 * @param 角色id
	 * @param 心法id
	 * @param 部位itemid
	 * @return 被替换的背包道具id
	 * */
	public calcHeartSlotChange(roleId: number, hearId: number, itemid: number): number {
		let hmdataMap: Map<HearMethodData> = this.HeartMethodInfo[roleId];
		if (!hmdataMap)return 0;
		let hmdata: HearMethodData = hmdataMap[hearId];
		if (!hmdata)return 0;
		let starConfig: HeartMethodStarConfig = GlobalConfig.HeartMethodStarConfig[itemid];
		if (!starConfig)return 0;

		//检查该itemid是否是身上 因为能被替换 证明这个itemid是正在穿的
		let index = hmdata.slots.indexOf(itemid);
		if (index == -1)
			return 0;//该部位itemid不是身上穿的
		let pId: number = this.getSuitPosFromItemId(itemid);
		if (!pId)
			return 0;//没有找到这个部位id所属部位索引

		//替换规则:先比品质再比星数 都相同也不替换
		let itemData: ItemData[] = UserBag.ins().getItemByType(ItemType.TYPE_18);
		itemData.sort(this.changeSort);//从好到坏
		for (let data of itemData) {
			if (GlobalConfig.HeartMethodStarConfig[data.configID].posSort != pId)continue;//不是同一个部位的忽略
			if (GlobalConfig.HeartMethodStarConfig[data.configID].heartmethodId != hearId)continue;//不是同一个心法的忽略
			let itemConfig: ItemConfig = GlobalConfig.ItemConfig[data.configID];
			let lv = itemConfig.level ? itemConfig.level : 0;
			let zslv = itemConfig.zsLevel ? itemConfig.zsLevel : 0;
			if (Actor.level < lv || UserZs.ins().lv < zslv)continue;//至少要符合穿戴条件
			//和身上的对比
			let hmsConfig: HeartMethodStarConfig = GlobalConfig.HeartMethodStarConfig[itemConfig.id];
			if (hmsConfig.quality > starConfig.quality) {
				return itemConfig.id;
			} else if (hmsConfig.quality == starConfig.quality) {
				if (hmsConfig.star > starConfig.star)
					return itemConfig.id;
			}
		}

		return 0;
	}

	/**先比品质再比星数 都相同也不替换*/
	public changeSort(a: ItemData, b: ItemData) {
		if (ItemConfig.getQuality(a.itemConfig) > ItemConfig.getQuality(b.itemConfig))
			return -1
		else {
			let aStar = GlobalConfig.HeartMethodStarConfig[a.configID];
			let bStar = GlobalConfig.HeartMethodStarConfig[b.configID];
			return Algorithm.sortDesc(aStar.star,bStar.star);
		}
	}

	/**
	 * 计算某个部位itemid所属的某个套装部位索引
	 * @param 部位itemid
	 * @return pos即:心法列表posList数组索引(12345)
	 * */
	public getSuitPosFromItemId(itemid: number): number {
		let config: HeartMethodStarConfig = GlobalConfig.HeartMethodStarConfig[itemid];
		if (config)
			return config.posSort;
		//考虑到多地方用到 配在表里
		// for( let k in GlobalConfig.HeartMethodConfig ){
		// 	if( config.heartmethodId != GlobalConfig.HeartMethodConfig[k].id )continue;
		// 	let index = GlobalConfig.HeartMethodConfig[k].posList.indexOf(config.posId);
		// 	if( index != -1 )
		// 		return (index+1)
		// }
		return 0;
	}

	/**
	 * 计算某一个部位升星消耗道具是否足够
	 * @param 部位itemid
	 * */
	public calcHeartSlotCost(itemid: number): boolean {
		let b = false;
		let config: HeartMethodStarConfig = GlobalConfig.HeartMethodStarConfig[itemid];
		if (!config || !config.nextItem)return b;

		let item: ItemData = UserBag.ins().getBagItemById(config.costItem);
		if (item && item.count >= config.costNum)
			b = true;

		return b;
	}

	/**计算心法总战斗力 */
	public calHeartValue():number{
		let value:number = 0;
		
		let len = SubRoles.ins().subRolesLen;
		for(let i = 0;i < len; i++){
			for(let j =1; j< 5;j ++){
				value += this.getPower(i,j);
			}
		}
		
		return value;
	}

	public getPower(curRole:number,heartPos:number):number{
		let id = this.getHeartConfig(heartPos);
		let proShowList: HeartTypeData[] = HeartMethod.ins().proShowList;
		let attrvalue: number[] = HeartMethod.ins().calcHeartTotalValue(curRole, id);
		
		if(!attrvalue) return 0;
		let attr: AttributeData[] = [];
		for (let i = 0; i < proShowList.length; i++) {
			let at: AttributeData = new AttributeData();
			at.type = proShowList[i].id;
			at.value = attrvalue[i];
			attr.push(at);
		}
		let power: number = UserBag.getAttrPower(attr);
		//心法等级额外战力
		let hminfo: Map<HearMethodData> = HeartMethod.ins().HeartMethodInfo[curRole];
		if (hminfo) {
			let hmdata: HearMethodData = hminfo[id];
			if (hmdata) {
				let hmLevelConfig: HeartMethodLevelConfig = GlobalConfig.HeartMethodLevelConfig[id][hmdata.lv];
				if (hmLevelConfig) {
					let lpower = hmLevelConfig.power ? hmLevelConfig.power : 0;
					power += lpower;
				}
			}
		}
		//心法技能额外战力
		let suitLv = HeartMethod.ins().calcHeartSkillLevel(curRole, id);
		if (suitLv) {
			let suitConfig: HeartMethodSuitConfig = GlobalConfig.HeartMethodSuitConfig[id][suitLv];
			let expower = suitConfig.power ? suitConfig.power : 0;
			power += expower;
		}
		return  power;
	}

	private getHeartConfig(posId: number) {
		if (this.PageData[posId])
			return this.PageData[posId].id;
		return 0;
	}

	/**
	 * 计算某一个心法的总属性(包括心法部位 心法技能) 详情tips用
	 * @param 角色id
	 * @param 心法id
	 * */
	public calcHeartTotalValue(roleId: number, id: number): number[] {
		
		let proShowList: HeartTypeData[] = this.proShowList;//生命 攻击 物防 魔防 按照HeartMethodAttrWin的顺序来
		let attrvalue: number[] = [];
		for (let i = 0; i < proShowList.length; i++) {
			attrvalue.push(0);
		}
		let hmdata: Map<HearMethodData> = this.HeartMethodInfo[roleId];
		if (!hmdata || !hmdata[id]) return attrvalue;

		//计算心法属性
		let attrbute: AttributeData[] = this.calcHeartAttrs(roleId, id);

		//计算每个部位的属性集合
		for (let i = 0; i < proShowList.length; i++) {
			if (!proShowList[i].filter) {//proShowList[i].id != 63
				//心法部位
				for (let j = 0; j < hmdata[id].slots.length; j++) {
					let itemid: number = hmdata[id].slots[j];
					let cfg: HeartMethodStarConfig = GlobalConfig.HeartMethodStarConfig[itemid];
					if (!cfg)continue;
					for (let z = 0; z < cfg.attr.length; z++) {
						if (proShowList[i].id == cfg.attr[z].type) {
							attrvalue[i] += cfg.attr[z].value;
						}
					}
				}
				//心法
				for (let k = 0; k < attrbute.length; k++) {
					if (proShowList[i].id == attrbute[k].type) {
						attrvalue[i] += attrbute[k].value;
						break;
					}
				}
			} else {
				//64是配在心法升级和部位表里边 63是在技能表里边
				//5个部位集齐开启技能属性
				let skillLv: number = this.calcHeartSkillLevel(roleId, id);
				if (skillLv) {
					let hmscfg: HeartMethodSuitConfig = GlobalConfig.HeartMethodSuitConfig[id][skillLv];
					if (hmscfg && proShowList[i].id == hmscfg.attr[0].type) {
						attrvalue[i] += hmscfg.attr[0].value / 100;
					}
				}
			}
		}

		
		return attrvalue;
	}

	/**
	 * 计算某角色某一个心法品质套装收集了几件
	 * @param 角色id
	 * @param 心法id
	 * @param 心法等级
	 * */
	public getHeartSuitCount(roleId: number, id: number, lv: number): number {
		let hmdata: Map<HearMethodData> = this.HeartMethodInfo[roleId];
		if (!hmdata || !hmdata[id])return 0;
		let count = 0;
		for (let i = 0; i < hmdata[id].slots.length; i++) {
			let itemid: number = hmdata[id].slots[i];
			if (!itemid)continue;
			let config: HeartMethodStarConfig = GlobalConfig.HeartMethodStarConfig[itemid];
			if (config.quality >= lv)
				count++;
		}

		return count;
	}

	/**
	 * 计算某一个心法各部位品质 求套装技能等级
	 * @param 角色id
	 * @param 心法id
	 * */
	public calcHeartSkillLevel(roleId: number, id: number): number {
		let level = 0;
		let hmdata: Map<HearMethodData> = this.HeartMethodInfo[roleId];
		// let maxSlots = Object.keys(GlobalConfig.HeartMethodConfig[id]).length;
		//hmdata[id].slots.length < maxSlots
		if (!hmdata || !hmdata[id])return level;

		let minLv;
		for (let i = 0; i < hmdata[id].slots.length; i++) {
			let itemid: number = hmdata[id].slots[i];
			if (!itemid)return 0;//其中一个部位没有穿戴就是0级套装
			// let config:ItemConfig = GlobalConfig.ItemConfig[itemid];
			let config: HeartMethodStarConfig = GlobalConfig.HeartMethodStarConfig[itemid];
			if (config) {
				let quality = config.quality;//ItemConfig.getQuality(config);
				if (!minLv || minLv > quality)
					minLv = quality;
			}
		}

		if (minLv)
			level = minLv;

		return level;
	}

	/**
	 * 计算当前心法属性(不含部位)
	 * @param 角色id
	 * @param 心法id
	 * @return AttributeData[]
	 * */
	public calcHeartAttrs(roleId: number, heartId: number): AttributeData[] {
		let hminfo: Map<HearMethodData> = this.HeartMethodInfo[roleId];
		let attrs: AttributeData[] = [];
		if (!hminfo || !hminfo[heartId] || !hminfo[heartId].id) return attrs;
		let hmdata: HearMethodData = hminfo[heartId];
		let stagecfg: HeartMethodStageConfig[] = GlobalConfig.HeartMethodStageConfig[hmdata.id];
		//等阶属性
		if (stagecfg && stagecfg[hmdata.stage]) {
			let list = stagecfg[hmdata.stage].attr;
			for (let data of list) {
				let att: AttributeData = new AttributeData();
				att.type = data.type;
				att.value = data.value;
				attrs.push(att);
			}
		}
		//等级属性
		let hmlconfig: HeartMethodLevelConfig[] = GlobalConfig.HeartMethodLevelConfig[hmdata.id];
		if (hmlconfig && hmlconfig[hmdata.lv]) {
			let list = hmlconfig[hmdata.lv].attr;
			for (let data of list) {
				let isHave = false;
				for (let i = 0; i < attrs.length; i++) {
					if (attrs[i].type == data.type) {
						attrs[i].value += data.value;
						isHave = true;
						break;
					}
				}
				if (!isHave) {
					let att: AttributeData = new AttributeData();
					att.type = data.type;
					att.value = data.value;
					attrs.push(att);
				}
			}
		}
		return attrs;
	}

	/**
	 * 计算下一个心法属性(不含部位)
	 * @param 角色id
	 * @param 心法id
	 * @return AttributeData[]
	 * */
	public calcHeartAttrsNext(roleId: number, heartId: number): AttributeData[] {
		let hminfo: Map<HearMethodData> = this.HeartMethodInfo[roleId];
		let attrs: AttributeData[] = [];
		//能看下一阶段 证明至少已经激活了
		if (!hminfo || !hminfo[heartId] || !hminfo[heartId].id) return attrs;
		let hmdata: HearMethodData = hminfo[heartId];
		let stagecfg: HeartMethodStageConfig[] = GlobalConfig.HeartMethodStageConfig[hmdata.id];
		let levelcfg: HeartMethodLevelConfig[] = GlobalConfig.HeartMethodLevelConfig[hmdata.id];
		let stageAttrs = [];
		let levelAttrs = [];
		if (hmdata.isUp) {
			//下一次是升阶
			if (!stagecfg[hmdata.stage + 1])//已满阶
				stageAttrs = stagecfg[hmdata.stage].attr;
			else
				stageAttrs = stagecfg[hmdata.stage + 1].attr;
			levelAttrs = levelcfg[hmdata.lv].attr;
		} else {
			//下一次是升级
			stageAttrs = stagecfg[hmdata.stage].attr;
			if (!levelcfg[hmdata.lv + 1])//已满级
				levelAttrs = levelcfg[hmdata.lv].attr;
			else
				levelAttrs = levelcfg[hmdata.lv + 1].attr;
		}
		//等阶属性
		if (stageAttrs && stageAttrs.length) {
			let list = stageAttrs;
			for (let data of list) {
				let att: AttributeData = new AttributeData();
				att.type = data.type;
				att.value = data.value;
				attrs.push(att);
			}
		}

		//等级属性
		if (levelAttrs.length) {
			let list = levelAttrs;
			for (let data of list) {
				let isHave = false;
				for (let i = 0; i < attrs.length; i++) {
					if (attrs[i].type == data.type) {
						attrs[i].value += data.value;
						isHave = true;
						break;
					}
				}
				if (!isHave) {
					let att: AttributeData = new AttributeData();
					att.type = data.type;
					att.value = data.value;
					attrs.push(att);
				}
			}
		}
		return attrs;
	}

	/**
	 * 计算心法修炼消耗
	 * @param 角色id
	 * @param 心法id
	 * */
	public calcHeartCost(roleId: number, heartId: number): { itemid: number, count: number } {
		let obj: { itemid: number, count: number } = null;
		//激活不需要消耗任何东西 如果需要显示消耗 必定是激活后的事
		let hminfo: Map<HearMethodData> = this.HeartMethodInfo[roleId];
		//注意:满级 or 升阶阶段不显示获取道具以及消耗的相关控件
		if (!hminfo || !hminfo[heartId] || !hminfo[heartId].id || this.isHeartMax(roleId, heartId) || hminfo[heartId].isUp) return obj;

		let lvConfig: HeartMethodLevelConfig = GlobalConfig.HeartMethodLevelConfig[hminfo[heartId].id][hminfo[heartId].lv + 1];
		if (lvConfig) {
			obj = {itemid: lvConfig.costItem, count: lvConfig.costNum};
		}

		return obj;
	}

	/**
	 * 心法是否满阶满级
	 * @param 角色id
	 * @param 心法id
	 * */
	public isHeartMax(roleId: number, heartId: number) {
		let hminfo: Map<HearMethodData> = this.HeartMethodInfo[roleId];
		if (!hminfo || !hminfo[heartId] || !hminfo[heartId].id) return false;
		let cfg: HeartMethodLevelConfig = GlobalConfig.HeartMethodLevelConfig[hminfo[heartId].id][hminfo[heartId].lv + 1];
		return !cfg ? true : false;
	}

	/**
	 * 获取心法所属属性名
	 * @param 属性类型
	 * */
	public getAttrStrByType(type: number): string {
		let str: string = "";
		// str = AttributeData.getAttrStrByType(type);
		for (let data of this.proShowList) {
			if (data.id == type) {
				str = data.name;
				break;
			}
		}
		// switch (type) {
		// 	case AttributeType.atMaxHp:
		// 		str = `生       命`;
		// 		break;
		// 	case AttributeType.atAttack:
		// 		str = `攻       击`;
		// 		break;
		// 	case AttributeType.atDef:
		// 		str = `物       防`;
		// 		break;
		// 	case AttributeType.atRes:
		// 		str = `魔       防`;
		// 		break;
		// 	case AttributeType.atZhuiMingPro:
		// 		str = `无影几率`;
		// 		break;
		// 	case AttributeType.atZhuiMingVal:
		// 		str = `无影伤害`;
		// 		break;
		// 	case AttributeType.maxNeiGong:
		// 		str = `内  功  值`;
		// 		break;
		// 	case AttributeType.atNeiGongRestore:
		// 		str = `内功恢复`;
		// 		break;
		// 	case AttributeType.atHearthDamege:
		// 		str = `夺命追伤`;
		// 		break;
		// }
		return str;
	}


	//客户端请求服务器处理
	//============================================================================================

	/**
	 * 请求升星
	 * 角色id
	 * 心法id
	 * 部位索引 0:代表修炼心法or激活心法   12345:部位升星
	 * 75-3
	 * */
	public sendHeartUpLevel(roleId: number, id: number, pos: number): void {
		let bytes: GameByteArray = this.getBytes(3);
		bytes.writeByte(roleId);
		bytes.writeShort(id);
		bytes.writeShort(pos);
		this.sendToServer(bytes);
	}

	/**
	 * 请求装备/替换部位
	 * 角色id
	 * 心法id
	 * 部位索引
	 * 物品id
	 * 75-4
	 * */
	public sendHeartChange(roleId: number, id: number, pos: number, itemid: number): void {
		let bytes: GameByteArray = this.getBytes(4);
		bytes.writeByte(roleId);
		bytes.writeShort(id);
		bytes.writeShort(pos);
		bytes.writeInt(itemid);
		this.sendToServer(bytes);
	}

	/**
	 * 请求一键分解
	 * 75-5
	 * @param  {number[]} uidList
	 * @returns void
	 */
	public sendOneKeyDecompose(heartId: number, uidList: ItemData[]): void {
		let len: number = uidList.length;

		let bytes: GameByteArray = this.getBytes(5);
		bytes.writeShort(heartId);
		bytes.writeInt(len);
		for (let i: number = 0; i < len; i++) {
			bytes.writeInt(uidList[i].configID);
		}
		this.sendToServer(bytes);
	}

	//服务器数据下发处理
	//============================================================================================
	/**
	 * 下发心法升级/升阶返回
	 *
	 * 75-1
	 * */
	public postHeartInfo(bytes: GameByteArray): void {
		let len: number = bytes.readByte();
		for (let i = 0; i < len; i++) {
			let roleId: number = bytes.readByte();
			if (!this.HeartMethodInfo[roleId])
				this.HeartMethodInfo[roleId] = {};
			let sum: number = bytes.readShort();
			for (let j = 0; j < sum; j++) {
				let id: number = bytes.readShort();//心法id
				let lv: number = bytes.readShort();//心法等级
				let isUp: number = bytes.readByte();//是否升阶
				let slots: number = bytes.readShort();//部位数量
				let hminfo: HearMethodData = new HearMethodData();
				hminfo.id = id;
				hminfo.lv = lv;
				hminfo.stage = isUp;
				for (let z = 0; z < slots; z++) {
					let itemid = bytes.readInt();//部位道具id
					hminfo.slots.push(itemid);
				}
				this.HeartMethodInfo[roleId][id] = hminfo;
			}
		}
	}

	/**
	 * 下发心法升级/升阶返回
	 *
	 * 75-2
	 * */
	public postHeartUpLevel(bytes: GameByteArray): void {
		let roleId: number = bytes.readUnsignedByte();
		if (!this.HeartMethodInfo[roleId])
			this.HeartMethodInfo[roleId] = {};
		let id: number = bytes.readShort();//心法id
		let hminfo: HearMethodData;
		if (!this.HeartMethodInfo[roleId][id]) {
			hminfo = new HearMethodData();
			hminfo.id = id;
		} else {
			hminfo = this.HeartMethodInfo[roleId][id]
		}
		let lv: number = bytes.readShort();//心法等级
		hminfo.lv = lv;
		let isUp: number = bytes.readByte();//是否升阶
		hminfo.stage = isUp;
		let slots: number = bytes.readShort();//部位数量
		hminfo.slots = [];//每次穿戴或者替换操作都将返回这个心法最新的身穿部位情况
		for (let z = 0; z < slots; z++) {
			let itemid = bytes.readInt();//部位道具id
			hminfo.slots.push(itemid);
		}
		this.HeartMethodInfo[roleId][id] = hminfo;
	}

	/**
	 * 处理一键分解
	 * 75-5
	 * @param  {GameByteArray} bytes
	 * @returns void
	 */
	public postOneKeyDecompose(bytes: GameByteArray): number[] {
		let isSuccess: number = bytes.readByte();
		let heardId: number = 0;
		let len: number = 0;
		if (isSuccess) {
			heardId = bytes.readShort();
			len = bytes.readShort();
		}
		return [isSuccess, heardId, len];
	}


	// /**name 69-x*/
	// public send(): void {
	// 	this.sendBaseProto(x);
	// }

}


/**心法数据*/
class HearMethodData {
	id: number;//心法id
	lv: number;//心法等级
	/**
	 * 是否升阶
	 * 如果 1 等阶为  等级/10
	 * 如果 0 等阶为  等级/10 + 1
	 * 就是如果是 1 就是满10星还未点升阶那个时候
	 */
	isUp: number;
	slots: number[];//部位数据(itemid)
	public constructor() {
		this.id = 0;
		this.lv = 0;
		this.stage = 0;
		this.slots = [];
	}

	public set stage(isUp: number) {
		this.isUp = isUp;
	}

	//等阶
	public get stage() {
		if (this.isUp) {
			return Math.floor(this.lv / 10);
		} else {
			return Math.floor(this.lv / 10) + 1;
		}
	}
}
class HeartTypeData {
	id: number;
	name: string;
	filter?: number;
}

namespace GameSystem {
	export let heartmethod = HeartMethod.ins.bind(HeartMethod);
}