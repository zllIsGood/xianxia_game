class UserEquip extends BaseSystem {
	public static FOEGE_MAX: number = 8;
	public constructor() {

		super();

		this.sysId = PackageID.Equip;
		this.regNetMsg(1, this.doUpDataEquip);
		this.regNetMsg(2, this.postSmeltEquipComplete);
		this.regNetMsg(3, this.doGrewupEquipResult);
		this.regNetMsg(4, this.doGrewupEquipResult);
		this.regNetMsg(5, this.postAddSpirit);
		this.regNetMsg(7, this.postAddSoul);
		this.regNetMsg(8, this.postZhiZunUpgrade);

		this.observe(UserBag.ins().postItemChange, this.postCheckHaveCan);//道具变更
		this.observe(UserBag.ins().postItemAdd, this.postCheckHaveCan);//道具添加
		this.observe(UserBag.ins().postItemDel, this.postCheckHaveCan);//道具删除
		this.observe(UserBag.ins().postHuntStore, this.postCheckHaveCan);
		this.observe(Actor.ins().postLevelChange, this.postCheckHaveCan);
	}

	public static ins(): UserEquip {
		return super.ins() as UserEquip;
	}

	/**
	 * 发送传装备
	 * 4-1
	 * @param itemHandle    道具唯一标识
	 * @param pos           道具位置
	 */
	public sendWearEquipment(itemHandle: number, pos: number, roleIndex: number): void {
		let bytes: GameByteArray = this.getBytes(1);
		bytes.writeDouble(itemHandle);
		bytes.writeShort(roleIndex);
		bytes.writeShort(pos);
		this.sendToServer(bytes);
	}

	/**
	 * 熔炼装备
	 * 4-2
	 * @param arr        装备列表
	 * @return 是否成功发送
	 */
	public sendSmeltEquip(type: number, arr: ItemData[]): boolean {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeInt(type);
		//记录当前位置，跳过数组长度的写入
		let pos: number = bytes.position;
		bytes.position += 4;
		let n: number = 0;
		for (let i: number = 0; i < arr.length; i++) {
			if (arr[i] != null) {
				// arr[i].handle.writeByte(bytes);
				bytes.writeDouble(arr[i].handle);
				++n;
			}
		}
		if (n == 0)
			return false;
		//回到之前记录的位置，并写入数组长度
		bytes.position = pos;
		bytes.writeInt(n);
		this.sendToServer(bytes);
		return true;
	}

	/**
	 * 处理装备更新
	 * 4-1
	 * @param bytes
	 */
	private doUpDataEquip(bytes: GameByteArray): void {
		let roleID: number = bytes.readShort();
		let equipPos: number = bytes.readShort();
		let item: ItemData = new ItemData;
		item.parser(bytes);
		let role: Role = SubRoles.ins().getSubRoleByIndex(roleID);
		let equip: EquipsData = role.getEquipByIndex(equipPos);
		equip.item = item;
		this.postEquipChange();

		if (equipPos == 0 || equipPos == 2) {
			let mainRole: CharRole = EntityManager.ins().getEntityByHandle(role.handle);
			if (mainRole)
				mainRole.updateModel();
		}
	}

	/**派发装备改变 */
	public postEquipChange(): void {

	}

	/**
	 * 处理装备熔炼返回结果
	 * 4-2
	 * @param bytes
	 */
	public postSmeltEquipComplete(bytes: GameByteArray): { itemId: number, count: number }[] {
		let state: number = bytes.readInt();
		if (state == 0) {
			UserTips.ins().showTips("|C:0xf3311e&T:熔炼失败！|");
			return;
		}
		let goldCount: number = bytes.readInt();
		let len: number = bytes.readInt();
		let arr: { itemId: number, count: number }[] = [];
		for (let i = 0; i < len; i++) {
			let idata: any = {};
			idata.itemId = bytes.readInt();
			idata.count = bytes.readInt();
			arr.push(idata);
		}

		return arr;
	}

	/** 对比装备返回高战力的装备 */
	public static contrastEquip(sourceItem: ItemData, item: ItemData): ItemData {
		if (!sourceItem || sourceItem.handle == 0)
			return item;
		if (!item || item.handle == 0)
			return sourceItem;
		let sourceItemScore: number = sourceItem.point;//ItemConfig.calculateBagItemScore(sourceItem);
		let itemScore: number = item.point;//ItemConfig.calculateBagItemScore(item);
		if (itemScore > sourceItemScore)
			return item;
		else
			return sourceItem;
	}

	/** 派发熔炼装备勾选列表 */
	public postEquipCheckList(param: ItemData[]): ItemData[] {
		return param;
	}

	/**
	 * 通过角色，部位，获取玩家对应角色的对应部位装备
	 * @param job
	 * @param pos 面板类型 0 强化 1 宝石 2 注灵 3 突破
	 */
	public getEquipsByJobNPos(job: number, pos: number): EquipsData {
		let len: number = SubRoles.ins().subRolesLen;
		// let roles: RoleModel[] = GameLogic.ins().roles;
		for (let i: number = 0; i < len; i++) {
			let roles: Role = SubRoles.ins().getSubRoleByIndex(i);
			if (roles.job == job)
				return roles.getEquipByIndex(pos);
		}
		return null;
	}

	// 通过装备位置跟品质获取配置ID，job不传就默认为1
	public getEquipConfigIDByPosAndQuality(equipPos: number, quality: number, job: number = 1) {
		let zhuan = UserZs.ins().lv || 0;
		let level = Actor.level;
		let configID = 100000 + 1 + equipPos * 10000 + quality * 100 + 1000 * job;
		for (let i = 2; i < 99; i++) {
			let id = 100000 + i + equipPos * 10000 + quality * 100 + 1000 * job;
			let config = GlobalConfig.ItemConfig[id];
			if (config != undefined) {
				let equipZhuan: number = config.zsLevel ? config.zsLevel : 0;
				let equipLevel: number = config.level ? config.level : 1;
				if (equipZhuan <= zhuan && equipLevel <= level) {
					configID = id;
				} else {
					break;
				}
			} else {
				break;
			}
		}
		return configID;
	}
	//传奇计算id专用
	public getEquipConfigIDByPosAndQualityByLegend(roleId: number, equipPos: number, quality: number, job: number = 1) {
		let zhuan = UserZs.ins().lv || 0;
		let level = Actor.level;
		let configID = 100000 + 1 + equipPos * 10000 + quality * 100 + 1000 * job;
		let role: Role = SubRoles.ins().getSubRoleByIndex(roleId);
		let equipsData: EquipsData = role.getEquipByIndex(equipPos);//当前穿戴的评分
		for (let i = 1; i < 99; i++) {
			let id = 100000 + i + equipPos * 10000 + quality * 100 + 1000 * job;
			let config = GlobalConfig.ItemConfig[id];
			if (config != undefined) {
				let equipZhuan: number = config.zsLevel ? config.zsLevel : 0;
				let equipLevel: number = config.level ? config.level : 1;
				if (equipZhuan <= zhuan && equipLevel <= level) {
					//增加一个评分判定
					if (equipsData && equipsData.item.configID) {
						let power: number = ItemConfig.pointCalNumber(GlobalConfig.ItemConfig[id]);
						if (equipsData.item.point < power) {
							configID = id;
							break;
						}
					} else
						configID = id;
				} else {
					break;
				}
			} else {
				break;
			}
		}
		return configID;
	}

	//神装计算id专用
	public getEquipConfigIDByPosAndQualityByGod(role: Role, equipPos: number, quality: number, job: number = 1) {
		let zhuan = UserZs.ins().lv || 0;
		let level = Actor.level;
		let maxID: number;
		let configID: number; // 100000 + 1 + equipPos * 10000 + quality * 100 + 1000 * job;
		let equipsData: EquipsData = role.getEquipByIndex(equipPos);//当前穿戴的评分
		for (let i = 2; i < 99; i++) {
			let id = 100000 + i + equipPos * 10000 + quality * 100 + 1000 * job;
			let config = GlobalConfig.ItemConfig[id];
			if (config != undefined) {
				let equipZhuan: number = config.zsLevel ? config.zsLevel : 0;
				let equipLevel: number = config.level ? config.level : 1;
				if (equipZhuan <= zhuan && equipLevel <= level) {
					//增加一个评分判定
					if (equipsData && equipsData.item.configID) {
						let power: number = ItemConfig.pointCalNumber(GlobalConfig.ItemConfig[id]);
						if (equipsData.item.point <= power) {
							configID = id;
							break;
						}
						maxID = id;
					} else
						configID = id;

				} else {
					break;
				}
			} else {
				break;
			}
		}
		if (configID == null) {
			configID = maxID ? maxID : 100000 + 1 + equipPos * 10000 + quality * 100 + 1000 * job;
		}
		return configID;
	}

	public checkEquipsIsWear(item: ItemData): boolean {
		let len: number = SubRoles.ins().subRolesLen;
		for (let i: number = 0; i < len; i++) {
			let role: Role = SubRoles.ins().getSubRoleByIndex(i);
			if (role.job != ItemConfig.getJob(item.itemConfig) && ItemConfig.getJob(item.itemConfig) != 0) continue;
			let equipLen: number = role.getEquipLen();
			// let onEquips: EquipsData[] = SubRoles.ins().getSubRoleByIndex(i).equipsData;
			for (let j: number = 0; j < equipLen; j++) {
				if (item.handle == role.getEquipByIndex(j).item.handle) {
					return true;
				}
			}
		}
		return false;
	}

	private doGrewupEquipResult(bytes: GameByteArray) {
		let roleId = bytes.readShort();
		let result = bytes.readInt();
		let configID = bytes.readInt();

		if (ItemConfig.getQuality(GlobalConfig.ItemConfig[configID]) == 4) {
			this.postMixEquip(roleId, result, configID);
		} else {
			this.postMixGodEquip(roleId, result, configID);
		}
	}

	/** 神装合成 */
	public postMixEquip(...params): any[] {
		return params;
	}

	/** 神装合成 */
	public postMixGodEquip(...params): any[] {
		return params;
	}

	/**
	 * 发送升级装备
	 * 4-3
	 * @param roleID    英雄唯一标识
	 * @param pos           装备位置
	 */
	public sendGrewupEquip(roleID, pos) {
		let bytes: GameByteArray = this.getBytes(3);
		bytes.writeShort(roleID);
		bytes.writeShort(pos);
		this.sendToServer(bytes);
	}

	/**
	 * 发送合成装备
	 * 4-4
	 * @param roleID    英雄唯一标识
	 * @param configID    装备配置ID
	 * @param pos           装备位置
	 */
	public sendMixEquip(roleID, configID, pos) {
		let bytes: GameByteArray = this.getBytes(4);
		bytes.writeShort(roleID);
		bytes.writeInt(configID);
		bytes.writeInt(pos);
		this.sendToServer(bytes);
	}

	public isFind: boolean = false;

	public postCheckHaveCan(): number {
		let len: number = SubRoles.ins().subRolesLen;
		for (let i = 0; i < len; i++) {
			this.isFind = this.checkRedPoint(4, i);
			if (this.isFind) break;
		}
		if (!this.isFind) {//神装状态
			// let role: RoleModel[] = GameLogic.ins().roles;
			for (let a: number = 0; a < len; a++) {
				for (let i = 0; i < 8; i++) {
					this.isFind = this.setOrangeEquipItemState(i, SubRoles.ins().getSubRoleByIndex(a));
					if (this.isFind)
						return 1;
				}
			}
		}
		if (!this.isFind) {//传奇状态
			for (let i = 0; i < len; i++) {
				this.isFind = this.checkRedPoint(5, i);
				if (this.isFind) break;
			}
			if (!this.isFind) {
				// let role: RoleModel[] = GameLogic.ins().roles;
				for (let a: number = 0; a < len; a++) {
					for (let i = 0; i < 2; i++) {
						this.isFind = this.setLegendEquipItemUpState(i > 0 ? 2 : 0, SubRoles.ins().getSubRoleByIndex(a));
						this.isFind = this.setLegendEquipItemState(i > 0 ? 2 : 0, SubRoles.ins().getSubRoleByIndex(a)) || this.isFind;
						if (this.isFind)
							return 1;
					}
				}
			}
		}
		if (!this.isFind) {
			this.isFind = Boolean(UserBag.ins().getHuntGoods(0).length);
		}
		return this.isFind ? 1 : 0;
	}

	public checkRedPoint(qualty: number, roleId?: number): boolean {
		let itemList = UserBag.ins().getEquipsByQuality(qualty);
		let len = itemList.length;
		for (let i: number = 0; i < len; i++) {
			let job: number;
			let role: Role;
			if (!isNaN(roleId)) {
				job = ItemConfig.getJob(itemList[i].itemConfig);//Math.floor(itemList[i].itemConfig.id / 1000 % 10);
				role = SubRoles.ins().getSubRoleByIndex(roleId);
				if (role.job != job)
					return false;
			}
			if (!role)
				return false;
			let id = this.getEquipConfigIDByPosAndQualityByGod(role, ItemConfig.getSubType(itemList[i].itemConfig), ItemConfig.getQuality(itemList[i].itemConfig));
			let fitConfig = GlobalConfig.ItemConfig[id];
			if (!fitConfig)
				continue;

			let equipZsLevel: number = itemList[i].itemConfig.zsLevel ? itemList[i].itemConfig.zsLevel : 0;
			let equipLevel: number = itemList[i].itemConfig.level ? itemList[i].itemConfig.level : 0;
			let fitZsLevel: number = fitConfig.zsLevel ? fitConfig.zsLevel : 0;
			let fitLevel: number = fitConfig.level ? fitConfig.level : 0;
			let L = equipZsLevel * 10000 + equipLevel;
			let fitL = fitZsLevel * 10000 + fitLevel;
			if (fitL > L) {
				return true;
			}
		}
		return false;
	}

	/**
	 * 获取神装格子的状态
	 * @param index
	 * @param role
	 */
	public setOrangeEquipItemState(index: number, role: Role): boolean {
		let equipData: EquipsData = role.getEquipByIndex(index);
		let nextConfig: ItemConfig;
		if (equipData.item.itemConfig && ItemConfig.getQuality(equipData.item.itemConfig) < 4)
			nextConfig = null;
		else
			nextConfig = GlobalConfig.ItemConfig[equipData.item.configID + 1];
		let needNum: number = 0;
		let costID: number = 0;

		if (equipData.item.itemConfig && ItemConfig.getQuality(equipData.item.itemConfig) == 4 && equipData.item.itemConfig.zsLevel >= 12)
			return false;

		if (equipData.item.itemConfig && ItemConfig.getQuality(equipData.item.itemConfig) == 5)
			return false;

		if (nextConfig != null && (nextConfig.level > Actor.level || nextConfig.zsLevel > UserZs.ins().lv))
			return false;

		if (nextConfig != undefined && equipData.item.handle != 0 && ItemConfig.getQuality(equipData.item.itemConfig) == 4 && equipData.item.itemConfig.level != 1 && UserBag.fitleEquip.indexOf(equipData.item.configID) == -1) {
			let grewupConfig = GlobalConfig.LegendLevelupConfig[equipData.item.configID];
			if (grewupConfig) {
				needNum = grewupConfig.count;
				costID = grewupConfig.itemId;
			}

		} else {
			let configId: number = UserEquip.ins().getEquipConfigIDByPosAndQualityByGod(role, index, 4, role.job);
			let equipsData: EquipsData = role.getEquipByIndex(index);//当前穿戴的评分
			//增加一个评分判定
			if (equipsData && equipsData.item.configID) {
				let power: number = ItemConfig.pointCalNumber(GlobalConfig.ItemConfig[configId]);
				if (equipsData.item.point > power) {
					return false;//当前穿的评分比神装高 就不显示红点
				}
			}

			let mixConfig = GlobalConfig.LegendComposeConfig[configId];
			if (mixConfig) {
				needNum = mixConfig.count;
				costID = mixConfig.itemId;
			}
		}
		let curNum = UserBag.ins().getItemCountById(0, costID);
		return curNum >= needNum;
	}

	/**
	 * 获取传奇装备格子的合成状态
	 * @param index
	 * @param role
	 */
	public setLegendEquipItemState(index: number, role: Role): boolean {
		let equipData: EquipsData = role.getEquipByIndex(index);
		let nextConfig: ItemConfig = null;
		let q = ItemConfig.getQuality(equipData.item.itemConfig);
		if (equipData.item.itemConfig && q == 5) {
			//传奇装备最高10 转
			if (equipData.item.itemConfig.zsLevel >= 10)
				return false;
			nextConfig = GlobalConfig.ItemConfig[equipData.item.configID + 1];
		}
		else {
			nextConfig = null;
		}
		let needNum: number = 0;
		let costID: number = 0;

		if (nextConfig != null && nextConfig.zsLevel > UserZs.ins().lv)
			return false;

		if (nextConfig != null && equipData.item.handle != 0 && q == 5) {
			let grewupConfig = GlobalConfig.LegendLevelupConfig[equipData.item.configID];
			needNum = grewupConfig.count;
			costID = grewupConfig.itemId;
		} else {
			let configId: number = this.getEquipConfigIDByPosAndQualityByLegend(role.index, index, 5);
			let mixConfig = GlobalConfig.LegendComposeConfig[configId];
			if (!mixConfig) return false;
			needNum = mixConfig.count;
			costID = mixConfig.itemId;
		}
		let curNum = UserBag.ins().getItemCountById(0, costID);
		if (UserZs.ins().lv >= 3)
			return curNum >= needNum;
		else
			return false;
	}

	/**
	 * 获取传奇装备格子的升级状态
	 * @param index
	 * @param role
	 */
	public setLegendEquipItemUpState(index: number, role: Role): boolean {
		let equipData: EquipsData = role.getEquipByIndex(index);
		let nextEquipData = GlobalConfig.ItemConfig[equipData.item.configID + 1];

		let q = ItemConfig.getQuality(equipData.item.itemConfig);
		//判断逻辑来源 LegendEquipPanel.updateAttrPanel() 函数
		//满级
		if (nextEquipData == undefined && equipData.item.handle != 0 && q == 5) {
			return false;
		} else {
			//升级
			if (nextEquipData != undefined && equipData.item.handle != 0 && q == 5) {
				let configID: number = role.getEquipByIndex(index).item.configID;
				//升级后超过角色等级，无法升级
				let nextEquipConfig = GlobalConfig.ItemConfig[configID + 1];
				if (nextEquipConfig.level > Actor.level || nextEquipConfig.zsLevel > UserZs.ins().lv) {
					return false;
				}
				//消耗道具
				//背包道具数量
				let grewupConfig = GlobalConfig.LegendLevelupConfig[configID];
				let curNum = UserBag.ins().getItemCountById(0, grewupConfig.itemId);
				//背包数量对比
				return curNum >= grewupConfig.count;
				//合成
			} else {
				return false;
			}
		}
	}
	/**
	 * 获取传奇是否满级
	 * @param role
	 */
	public getLegendEquipItemUpMax(roleId: number): boolean {
		for (let i = 0; i < 8; i++) {
			if (i != 0 && i != 2)
				continue;

			let equipData = SubRoles.ins().getSubRoleByIndex(roleId).getEquipByIndex(i);
			if (!equipData) return true;
			let nextEquipData = GlobalConfig.ItemConfig[equipData.item.configID + 1];
			let q = ItemConfig.getQuality(equipData.item.itemConfig);
			if (nextEquipData == undefined && equipData.item.handle != 0 && q == 5) {//满级

			} else {
				return false;
			}
		}


		return true;
	}

	public requestAddSpirit(roleIndex: number, equipIndex: number, equipAry: number[]): void {
		let bytes: GameByteArray = this.getBytes(5);
		bytes.writeShort(roleIndex);
		bytes.writeShort(equipIndex);
		bytes.writeShort(equipAry.length);
		for (let i = 0; i < equipAry.length; i++) {
			bytes.writeDouble(equipAry[i]);
		}
		this.sendToServer(bytes);
	}

	public postAddSpirit(bytes: GameByteArray): void {
		let roleId = bytes.readShort();
		let equipIndex = bytes.readShort();
		let lv = bytes.readShort();
		let exp = bytes.readInt();
		let equipData = SubRoles.ins().getSubRoleByIndex(roleId).getEquipByIndex(equipIndex);
		equipData.spiritLv = lv;
		equipData.spiritExp = exp;
	}

	public requestAddSoul(roleIndex: number, equipIndex: number): void {
		let bytes: GameByteArray = this.getBytes(7);
		bytes.writeShort(roleIndex);
		bytes.writeShort(equipIndex);
		this.sendToServer(bytes);
	}

	public postAddSoul(bytes: GameByteArray): void {
		let roleId = bytes.readShort();
		let equipIndex = bytes.readShort();
		let lv = bytes.readShort();
		let equipData = SubRoles.ins().getSubRoleByIndex(roleId).getEquipByIndex(equipIndex);
		equipData.soulLv = lv;
	}

	public postZhiZunUpgrade(bytes: GameByteArray): void {
		let roleId = bytes.readShort();''
		let subType = bytes.readShort();
		let lv = bytes.readShort();
		let equipData = SubRoles.ins().getSubRoleByIndex(roleId).getEquipByIndex(subType);
		equipData.soulLv = lv;
	}

	public upgradeZhiZunEquip(roleId: number, subType: number): void {
		let bytes: GameByteArray = this.getBytes(8);
		bytes.writeShort(roleId);
		bytes.writeShort(subType);
		this.sendToServer(bytes);
	}
}

namespace GameSystem {
	export let  userEquip = UserEquip.ins.bind(UserEquip);
}
