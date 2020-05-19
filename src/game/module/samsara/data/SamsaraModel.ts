/**
 * Created by Peach.T on 2017/11/27.
 */
class SamsaraModel extends BaseClass {

	public samsaraInfo: SamsaraVO;

	private _samsaraDescAry: string[];

	public get samsaraDescAry(): string[] {
		if (this._samsaraDescAry == undefined || this._samsaraDescAry.length == 0) {
			let data = GlobalConfig.ReincarnationBase;
			if (data) {
				this._samsaraDescAry = [data.hellsName, data.ghostsName, data.animalsName, data.demigodsName, data.humansName, data.godsName];
			} else {
				this._samsaraDescAry = [];
			}
		}
		return this._samsaraDescAry;
	}

	public samsaraEquipMap = {};

	public composeEquipMap = {};

	public composeEquipTypes: number[] = [];

	public equipCompose: { [id: number]: ReincarnateEquipCompose } = {};//

	constructor() {
		super();
		let data = GlobalConfig.ReincarnationBase;
		this.initComposeEquip();
		this.composeEquipTypes = this.getComposeMenu();
	}

	public static ins(): SamsaraModel {
		return super.ins() as SamsaraModel;
	}

	public isLevMax(): boolean {
		if (!this.samsaraInfo) return false;
		let nextLv = this.samsaraInfo.lv + 1;
		return nextLv >= CommonUtils.getObjectLength(GlobalConfig.ReincarnationLevel);
	}

	public isCanUpgrade(): boolean {
		if (!this.samsaraInfo) return false;
		let lv = this.samsaraInfo.lv;
		let nextLv = lv + 1;
		let cfg = GlobalConfig.ReincarnationLevel[nextLv];
		let result = false;
		if (nextLv < CommonUtils.getObjectLength(GlobalConfig.ReincarnationLevel) && this.samsaraInfo.exp >= cfg.consume) {
			result = true;
		}
		return result;
	}

	public getExpExchangeTimes(): number {
		if (!this.samsaraInfo) return 0;
		let times = GlobalConfig.ReincarnationBase.levelExchangeTimes - this.samsaraInfo.expUpgradeNum;
		return times;
	}

	public getNormalExchangeTimes(): number {
		if (!this.samsaraInfo) return 0;
		let times = GlobalConfig.ReincarnationBase.normalItem.time - this.samsaraInfo.normalUpgradeNum;
		return times;
	}

	public getAdvancedExchangeTimes(): number {
		if (!this.samsaraInfo) return 0;
		let times = GlobalConfig.ReincarnationBase.advanceItem.time - this.samsaraInfo.advancedUpgradeNum;
		return times;
	}

	public isCanExpExchange(): boolean {
		let result = false;
		if (Actor.level >= GlobalConfig.ReincarnationBase.levelLimit && this.samsaraInfo.expUpgradeNum < GlobalConfig.ReincarnationBase.levelExchangeTimes) {
			result = true;
		}
		return result;
	}

	/**
	 * 是否能用装备兑换
	 */
	public isCanItemExchange(): boolean {
		let count;
		if (this.getNormalExchangeTimes() > 0) {
			count = UserBag.ins().getItemCountById(0, GlobalConfig.ReincarnationBase.normalItem.id);
			if (count > 0) {
				return true;
			}
		}
		if (this.getAdvancedExchangeTimes() > 0) {
			count = UserBag.ins().getItemCountById(0, GlobalConfig.ReincarnationBase.advanceItem.id);
			if (count > 0) {
				return true;
			}
		}
		return false;
	}

	public isOpen(): boolean {
		let roleLv: number = UserZs.ins().lv * 1000 + Actor.level;
		return roleLv >= GlobalConfig.ReincarnationBase.openLevel;
	}

	public isMaxSamsara(samsaraLv: number): boolean {
		let length = CommonUtils.getObjectLength(GlobalConfig.ReincarnationLevel);
		let cfg = GlobalConfig.ReincarnationLevel[length - 1];
		return (samsaraLv >= cfg.level);
	}

	/**
	 * 是否集齐套装
	 */
	public isSuit(index: number, role: Role): boolean {
		let baseLv = this.getEquipSamsaraLvByRole(index, role);
		for (let i = EquipPos.HAT; i < EquipPos.MAX; i++) {
			if (i != index) {
				let lv = this.getEquipSamsaraLvByRole(i, role);
				if (lv < baseLv) {
					return false;
				}
			}
		}
		return true;
	}

	public lowSuitEquips(index: number, role: Role): number[] {
		let items: number[] = [];
		let baseLv = this.getEquipSamsaraLvByRole(index, role);
		for (let i = EquipPos.HAT; i < EquipPos.MAX; i++) {
			let lv = this.getEquipSamsaraLvByRole(i, role);
			if (lv < baseLv) {
				// let data: EquipsData = role.getEquipByIndex(index);
				items.push(0);
			}
			else {
				items.push(1);
			}
		}
		return items;
	}

	public getEquipSamsaraLvByRole(index: number, role: Role): number {
		let data: EquipsData = role.getEquipByIndex(index);
		if (!data.item.itemConfig) return 0;
		return this.getEquipSamsaraLv(data.item.itemConfig.id);
	}

	public getEquipSamsaraLv(equipId: number): number {
		for (let i in GlobalConfig.ReincarnateSuit) {
			let data = GlobalConfig.ReincarnateSuit[i];
			for (let j in data.equips) {
				let id = data.equips[j];
				if (id.toString() == equipId.toString()) {
					return data.level;
				}
			}
		}
		return 0;
	}

	public getReincarnateSuit(equipId: number): ReincarnateSuit {
		for (let i in GlobalConfig.ReincarnateSuit) {
			let data = GlobalConfig.ReincarnateSuit[i];
			for (let j in data.equips) {
				let id = data.equips[j];
				if (id.toString() == equipId.toString()) {
					return data;
				}
			}
		}
		return null;
	}

	/**
	 * 获取装备的六道轮回
	 * @param equipSamsaraLv
	 * @returns {number}
	 */
	public getSamsara(equipSamsaraLv: number): number {
		let lv = 0;
		if (equipSamsaraLv >= 7) {
			lv = Math.ceil((equipSamsaraLv - 6) / 6);
		}
		return lv;
	}

	/**
	 * 获取装备的六道轮回描述
	 * @param samsara
	 * @returns {string}
	 */
	public getSamsaraDesc(samsara: number): string {
		return this.samsaraDescAry[samsara];
	}

	/**
	 * 获取装备的境界
	 * @param equipSamsaraLv
	 * @returns {number}
	 */
	public getSamsaraLv(equipSamsaraLv: number): number {
		let lv = 0;
		if (equipSamsaraLv == 0) {
			lv = -1;
		}
		else {
			lv = Math.ceil((equipSamsaraLv - 1) % 6);
		}
		return lv;
	}

	/**
	 * 获取装备的境界描述
	 * @param samsaraLv
	 * @returns {string}
	 */
	public getSamsaraLvDesc(samsaraLv: number): string {
		let index = samsaraLv + 1;
		return GlobalConfig.ReincarnationBase.state[index];
	}

	/**
	 * 判断装备转生等级是否能附灵
	 * @param id
	 */
	public checkEquipZsLvl(id: number): boolean {
		let data = GlobalConfig.ItemConfig[id];
		return (data.zsLevel == 7 || data.zsLevel == 8);
	}

	public getAddSpiritEquips(role: Role, equipPos: number, maxLength: number = 10): number[] {
		let equips: number[] = [];
		let equipCount = UserBag.ins().itemCount[1];
		let equipData = role.getEquipByIndex(equipPos);
		if (equipCount && !this.checkSpiritLvIsMax(equipData, equipPos)) {
			for (let equip in equipCount) {
				if (GlobalConfig.ReincarnateEquip[equip]) {
					let id = +equip;
					let isCan = this.isEquipCanAddSpirit(role, equipPos, id);
					if (isCan) {
						let count = equipCount[equip];
						while (count > 0) {
							equips.unshift(id);
							if (equips.length >= maxLength) {
								return equips;
							}
							count--;
						}
					}
				}
			}
		}
		return equips;
	}

	public isEquipCanAddSpirit(role: Role, equipPos: number, id: number): boolean {
		let data: EquipsData = role.getEquipByIndex(equipPos);
		let currentZsLv = GlobalConfig.ItemConfig[data.item.itemConfig.id].zsLevel;
		let zslv = GlobalConfig.ItemConfig[id].zsLevel;
		if (currentZsLv < zslv) return false;
		//策划要求 装备普通装备，如果低阶圣的装备战斗力比普通装备低，则低阶装备全部进入附灵材料列表 2018.1.2 Peach.T
		return this.checkEquip(id);
	}

	private checkEquip(equipId: number): boolean {
		let item = GlobalConfig.ItemConfig[equipId];
		let targetJob = ItemConfig.getJob(item);
		let tempRole = SubRoles.ins().getSubRoleByJob(targetJob);
		if (tempRole) {
			let targetData: EquipsData = tempRole.getEquipByIndex(ItemConfig.getSubType(item));
			if (targetData.item.itemConfig) {
				let zslv = GlobalConfig.ItemConfig[targetData.item.itemConfig.id].zsLevel;
				if (zslv >= item.zsLevel) {
					let shengEquipId = this.getTargetShengEquipById(equipId, item.zsLevel);
					return this.checkNormalEquip(targetData, shengEquipId);
				}
			}
		}
		return false;
	}

	/**
	 * 查找当前转生级别对应的圣装备
	 * @param zslv
	 * @returns {number}
	 */
	public getTargetShengEquipById(id: number, zsLv: number): number {
		let cfg = this.equipCompose[id];
		if (cfg) {
			return this.getTargetShengEquipById(cfg.id, zsLv);
		}
		return id;
	}

	/**
	 * 校验当前普通装备是否大于圣装的战斗力
	 * @param data
	 * @param equipId
	 */
	public checkNormalEquip(data: EquipsData, equipId: number): boolean {
		let point = data.item.point;
		let item = new ItemData();
		item.configID = equipId;
		let targetPoint = item.point;
		return point > targetPoint;
	}

	public isCanAddSpirit(): boolean {
		for (let role of SubRoles.ins().roles) {
			for (let j = EquipPos.HAT; j < EquipPos.MAX; j++) {
				let data: EquipsData = role.getEquipByIndex(j);
				if (!data.item.itemConfig) continue;
				let list: number[] = this.getAddSpiritEquips(role, j, 1);
				if (list.length > 0) {
					return true;
				}
			}
		}
		return false;
	}

	public checkRoleCanAddSpirit(index: number): boolean {
		let role: Role = SubRoles.ins().getSubRoleByIndex(index);
		for (let j = EquipPos.HAT; j < EquipPos.MAX; j++) {
			let data: EquipsData = role.getEquipByIndex(j);
			if (!data.item.itemConfig) continue;
			let list: number[] = this.getAddSpiritEquips(role, j, 1);
			if (list.length > 0) {
				return true;
			}
		}
		return false;
	}

	public checkEquipPosCanAddSpirit(role: Role, equipIndex: number): boolean {
		let data: EquipsData = role.getEquipByIndex(equipIndex);
		if (data.item.itemConfig && !this.checkSpiritLvIsMax(data, equipIndex)) {

			// let samsaraLv: number = this.getEquipSamsaraLv(data.item.itemConfig.id);
			let list: number[] = this.getAddSpiritEquips(role, equipIndex, 1);
			if (list.length > 0) {
				return true;
			}
		}
		return false;
	}

	public checkSpiritLvIsMax(data: EquipsData, index: number) {
		let lv = data.spiritLv;
		return !GlobalConfig.ReincarnateSpirit[index][lv + 1];
	}

	public getReincarnationLinkLevel(pos: number, linkLv: number): ReincarnationLinkLevel {
		for (let i in GlobalConfig.ReincarnationLinkLevel) {
			if (i != pos.toString()) continue;
			for (let j in GlobalConfig.ReincarnationLinkLevel[i]) {
				for (let k in GlobalConfig.ReincarnationLinkLevel[i][j]) {
					if (k == linkLv.toString()) {
						return GlobalConfig.ReincarnationLinkLevel[i][j][k];
					}
				}
			}
		}
		return null;
	}

	public getSoulLinkDesc(type: number): string {
		let desc;
		switch (type) {
			case 11:
				desc = "生命";
				break;
			case 55:
				desc = "伤害加成";
				break;
			case 19:
				desc = "暴击伤害";
				break;
			case 56:
				desc = "暴击伤害减免率";
				break;
		}
		return desc;
	}

	public getSoulMaxLevel(): number {
		return CommonUtils.getObjectLength(GlobalConfig.ReincarnationDemonLevel[EquipPos.HAT]);
	}

	/**
	 * 获取灵魂锁链等级
	 * @param roleIndex
	 * @param mainPos
	 * @param soullv
	 */
	public getSoulLinkLv(role: Role, mainPos: number, soullv: number): number {
		let secPos = this.getLinkEquipPos(mainPos);
		let mainEquip: EquipsData = role.getEquipByIndex(mainPos);
		let secEquip: EquipsData = role.getEquipByIndex(secPos);
		if (mainEquip && secEquip) {
			return Math.min(mainEquip.soulLv, secEquip.soulLv);
		}
		return 0;
	}

	public getLinkEquipPos(mainPos: number): number {
		for (let i in GlobalConfig.ReincarnationLinkLevel) {
			if (i == mainPos.toString()) {
				for (let j in GlobalConfig.ReincarnationLinkLevel[i]) {
					return +(j);
				}
			}
		}
		return null;
	}

	public isCanUpgradeSoul(): boolean {
		let len = SubRoles.ins().subRolesLen;
		for (let i: number = 0; i < len; i++) {
			for (let j = EquipPos.HAT; j <= EquipPos.SHIELD; j++) {
				let isCan = this.checkUpgradeSoul(SubRoles.ins().getSubRoleByIndex(i), j);
				if (isCan) return true;
			}
		}
		return false;
	}

	public checkUpgradeSoul(role: Role, pos: number): boolean {
		let mainEquip: EquipsData = role.getEquipByIndex(pos);
		let soulLv = mainEquip.soulLv;
		if (soulLv == this.getSoulMaxLevel() || !mainEquip.item.itemConfig) {
			return false;
		}
		else {
			let soulCfg = GlobalConfig.ReincarnationSoulLevel[role.job][pos][soulLv + 1];
			let count = UserBag.ins().getBagGoodsCountById(0, soulCfg.materialInfo.id);
			return count >= soulCfg.materialInfo.count;
		}
	}

	public initComposeEquip(): void {
		let ary = GlobalConfig.ReincarnationBase.headName;
		let count = ary.length;
		for (let i = 1; i <= count; i++) { //神 或者圣 TYPE;
			if (!this.composeEquipMap[i]) this.composeEquipMap[i] = {};
		}

		for (let j in GlobalConfig.ReincarnateEquipCompose) {
			let cfg = GlobalConfig.ReincarnateEquipCompose[j];

			this.equipCompose[cfg.material.id] = cfg;

			let type = cfg.distinguishi;
			let obj = this.composeEquipMap[type];
			let itemCfg = GlobalConfig.ItemConfig[cfg.id];
			let zsLv = itemCfg.zsLevel;
			let items: { type: number, id: number }[] = obj[zsLv];
			if (!items) items = [];
			items.push({ type: MergeType.SamsareEquip, id: cfg.id });
			obj[zsLv] = items;
			this.composeEquipMap[type] = obj;
		}
	}

	public getComposeMenu(): number[] {
		let ary = GlobalConfig.ReincarnationBase.headName;
		let count = ary.length;
		let data = [];
		for (let i = 1; i <= count; i++) {
			data.push(i);
		}
		return data;
	}

	public getComposeZsList(type: number): number[][] {
		let lv = UserZs.ins().lv;
		let list = GlobalConfig.ReincarnationBase.equipsList[type - 1];
		let ary: any[] = [];
		for (let i in list) {
			if (list[i] <= lv) {
				ary.push({ "type": type, "zsLv": list[i] });
			}
		}
		return ary;
	}

	public getComposeDesc(type: number): string {
		return GlobalConfig.ReincarnationBase.headName[type - 1];
	}

	public isCanCompose(): boolean {
		return this.getComposeEquipList().length > 0;
	}

	public getComposeEquipId(type: number, zsLv: number): number {
		let id = 0;
		let list = this.getComposeEquipList();
		for (let i in list) {
			let itemId = list[i];
			let targetId = this.getComposeTarget(itemId);
			if (GlobalConfig.ItemConfig[targetId].zsLevel == zsLv && GlobalConfig.ReincarnateEquipCompose[targetId].distinguishi == type) {
				return itemId;
			}
		}
		return id;
	}

	public getComposeEquipList(): number[] {
		let result: number[] = [];

		let equipCount = UserBag.ins().itemCount[1];
		for (let equip in equipCount) {
			if (this.equipCompose[equip]) {
				let itemId = +equip;
				let targetId = this.composeMaxEquip(itemId);
				if (targetId && this.isCanWear(targetId)) {
					result.push(itemId);
				}
			}
		}

		// for (let i in GlobalConfig.ReincarnateEquipCompose) {
		// 	let data = GlobalConfig.ReincarnateEquipCompose[i];
		// 	let itemId = data.material.id;
		//
		// 	let targetId = this.composeMaxEquip(itemId);
		// 	if (targetId && this.isCanWear(targetId)) {
		// 		result.push(itemId);
		// 	}
		// }
		return result;
	}

	public getComposeTarget(materialId: number): number {
		let obj = this.equipCompose[materialId];
		if (obj) return obj.id;
		return 0;
	}

	/**
	 * 获取当前材料最大能合成的装备
	 * @param itemId
	 */
	public composeMaxEquip(itemId: number): number {
		let num = UserBag.ins().getItemCountById(UserBag.BAG_TYPE_EQUIP, itemId);
		if (num) {
			let material: RewardData = new RewardData();
			material.id = itemId;
			material.count = 0;
			let data = this.composeEquip(material);
			if (data && data.id != itemId) {
				return data.id;
			}
		}
		return 0;
	}

	/**
	 * 合成
	 * @param material
	 * @returns {any}
	 */
	public composeEquip(material: RewardData): RewardData {
		let itemId: number = material.id;
		let num: number = material.count + UserBag.ins().getItemCountById(UserBag.BAG_TYPE_EQUIP, itemId) + this.wearCount(itemId);
		let data;
		let cfg = this.equipCompose[itemId];
		if (cfg) {
			if (num >= cfg.material.count) {
				data = new RewardData();
				data.id = cfg.id;
				data.count = Math.floor(num / cfg.material.count);
				return this.composeEquip(data);
			} else {
				return material;
			}
		}

		return material;
	}

	/**
 	* 判断某个装备是否穿戴
 	* @param itemId
 	* @returns {boolean}
 	*/
	public isCanWear(itemId): boolean {
		if (!itemId) return false;
		let itemData = GlobalConfig.ItemConfig[itemId];
		let roleLv: number = UserZs.ins().lv * 1000 + Actor.level;
		let equipLv: number = itemData.zsLevel * 1000 + itemData.level;
		if (roleLv < equipLv) return false;//大于穿戴等级
		let job = ItemConfig.getJob(itemData);
		let subType = ItemConfig.getSubType(itemData);

		let role = SubRoles.ins().getSubRoleByJob(job);
		if (!role) return false;

		let data: EquipsData = role.getEquipByIndex(subType);
		let itemCfg = data.item.itemConfig;
		if (itemCfg) {//玩家身上的装备必须要有
			let point = data.item.point;
			let tempItem: ItemData = new ItemData();
			tempItem.configID = itemId;
			let targetPoint = tempItem.point;
			if (targetPoint > point) {
				return true;
			}
		}
		else {
			return true;//身上没有装备 能合成直接能穿戴
		}

		return false;
	}

	public isCanTypeCompose(type: number): boolean {
		let list: number[] = this.getComposeEquipList();
		for (let i in list) {
			let equipId = list[i];
			let cfg = GlobalConfig.ReincarnateEquipCompose[this.getComposeTarget(equipId)];
			if (cfg.distinguishi == type) {
				return true;
			}
		}
		return false;
	}

	/**
	 * 判断装备能否合成
	 * @param type 合成目标类型是神还是圣
	 * @param zsLv 转生级别
	 * @returns {boolean}
	 */
	public isCanZsLvCompose(type: number, zsLv: number): boolean {
		// let itemList = this.composeEquipMap[type][zsLv];
		// for (let id of itemList) {
		// 	let cfg = GlobalConfig.ReincarnateEquipCompose[id];
		// 	if (cfg) {
		// 		let num = UserBag.ins().getBagEquipById(cfg.material.id) + this.wearCount(cfg.material.id);
		// 		if (num >= cfg.material.count) {
		// 			return true;
		// 		}
		// 	}
		// }
		// return false;

		let list: number[] = this.getComposeEquipList();
		for (let i in list) {
			let equipId = list[i];//材料ID
			let targetId = this.getComposeTarget(equipId);
			let cfg = GlobalConfig.ReincarnateEquipCompose[targetId];
			let zsLevel = GlobalConfig.ItemConfig[targetId].zsLevel;
			if (zsLv == zsLevel && cfg.distinguishi == type) {
				return true;
			}
		}
		return false;
	}

	/**
	 * 是否可以合成
	 * @param equipId 材料的ID
	 * @returns {boolean}
	 */
	public isCanEquipCompose(equipId: number): boolean {
		let list: number[] = this.getComposeEquipList();
		return list.indexOf(equipId) >= 0;
	}

	public wearCount(itemId: number): number {
		let itemData = GlobalConfig.ItemConfig[itemId];
		let job = ItemConfig.getJob(itemData);
		let role = SubRoles.ins().getSubRoleByJob(job);
		if (!role) return 0;

		let subType = ItemConfig.getSubType(itemData);
		let data: EquipsData = role.getEquipByIndex(subType);
		let itemCfg = data.item.itemConfig;
		if (itemCfg && itemCfg.id == itemId) {
			return 1;
		}
		return 0;
	}

	public getRoleIndexByEquip(itemId: number): number {
		let itemData = GlobalConfig.ItemConfig[itemId];
		let job = ItemConfig.getJob(itemData);
		let subType = ItemConfig.getSubType(itemData);
		let len = SubRoles.ins().subRolesLen;
		for (let i: number = 0; i < len; i++) {
			let role: Role = SubRoles.ins().getSubRoleByIndex(i);
			if (role.job == job) {
				let data: EquipsData = role.getEquipByIndex(subType);
				let itemCfg = data.item.itemConfig;
				if (itemCfg && itemCfg.id == itemId) {
					return i;
				}
			}
		}
		return -1;
	}
}
