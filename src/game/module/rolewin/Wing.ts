/**
 * 翅膀数据
 */
class Wing extends BaseSystem {
	/** 可更换的翅膀装备 */
	// private canChangeWingEquips: boolean[][];
	private timeID: number = 0;
	public static WingMaxLv: number = 9;
	public static WingExpRedPoint: number = 3;//4阶是3
	// public static WingSkillId: number[] = [91000, 92000, 93000, 94000, 95000];
	private godWing: GodWingData[] = [];//索引是roleId
	public static GodWingMaxSlot: number = 4;
	/** 激活所需任务数 */
	public static ACTIVATION_COUNT: number = 16;

	public constructor() {
		super();
		this.sysId = PackageID.Wing;
		this.regNetMsg(1, this.doUpDataWing);
		this.regNetMsg(2, this.doBoost);
		this.regNetMsg(3, this.postWingWear);//6号消息合成神羽为快速合成才会返回穿戴是否成功
		this.regNetMsg(4, this.postActivate);
		this.regNetMsg(5, this.postGodWingData);//神羽成功
		this.regNetMsg(8, this.postUseDanSuccess);//使用提升丹成功
		this.regNetMsg(11, this.postWingEquip);

		this.observe(UserBag.ins().postItemAdd, this.startCheckHaveCan);
		this.observe(UserBag.ins().postItemDel, this.startCheckHaveCan);
		this.observe(GameLogic.ins().postChildRole, this.startCheckHaveCan);
		this.observe(Actor.ins().postLevelChange, this.startCheckHaveCan);
		this.observe(this.postWingUpgrade, this.startCheckHaveCan);
	}

	public static ins(): Wing {
		return super.ins() as Wing;
	}

	public wingSkillDic: number[];
	private initConfig(): void {
		if (!this.wingSkillDic) {
			this.wingSkillDic = [];
			let config = GlobalConfig.WingLevelConfig;
			for (let k in config) {
				if (config[k].pasSkillId) {
					this.wingSkillDic.push(config[k].pasSkillId);
				}
			}
		}
	}

	public getWingSkillByIndex(index) {
		this.initConfig();
		return this.wingSkillDic[index];
	}

	private isListen: boolean = false;

	private startCheckHaveCan(isWear: boolean = false, roleIndex: number = -1): void {
		if (this.isListen)
			return;
		this.isListen = true;
		TimerManager.ins().doTimerDelay(3000, 1000, 1, this.showNavBtnRedPoint, this);
	}

	/**
	 * 培养请求
	 * @param roleId 角色
	 * @param type  培养类型
	 */
	public sendBoost(roleId: number, type: number): void {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeShort(roleId);
		bytes.writeByte(type);
		this.sendToServer(bytes);
	}

	/**
	 * 升级请求
	 * @param roleId 角色
	 */
	public sendUpgrade(roleId: number): void {
		let bytes: GameByteArray = this.getBytes(3);
		bytes.writeShort(roleId);
		this.sendToServer(bytes);
	}

	/**
	 * 激活请求
	 * @param roleId 角色
	 */
	public sendActivate(roleId: number): void {
		let bytes: GameByteArray = this.getBytes(4);
		bytes.writeShort(roleId);
		this.sendToServer(bytes);
	}

	/**
	 * 翅膀装备穿戴请求
	 * @param roleId 角色
	 * @param itemId 物品
	 * @param dressIndex 位置
	 */
	public dressWingEquip(roleId: number, itemId: number, dressIndex: number): void {
		let bytes: GameByteArray = this.getBytes(11);
		bytes.writeDouble(itemId);
		bytes.writeShort(roleId);
		bytes.writeShort(dressIndex);
		this.sendToServer(bytes);
	}

	/**
	 * 发送直升一阶
	 * @param role 角色索引
	 *
	 * 6-12
	 */
	public sendBigUpLevel(role: number): void {
		let bytes: GameByteArray = this.getBytes(12);
		bytes.writeInt(role);
		this.sendToServer(bytes);
	}

	public doBigUpLevel(bytes: GameByteArray): void {
		let result: number = bytes.readInt();
		let str: string;
		if (!result) {
			let type: number = bytes.readInt();
			// let index: number = bytes.readShort();
			// SubRoles.ins().getSubRoleByIndex(index).wingsData.parserBoost(bytes);
			// let crit: number = bytes.readShort();
			// let addExp: number = bytes.readInt();
			// this.postBoost(crit, addExp);
			// if (!type)
			// 	str = "使用成功，翅膀等阶+1";
			// else
			// str = "使用成功，增加" + GlobalConfig.WingCommonConfig.levelExpChange + "经验";
		}
		else {
			str = "道具不足够";
		}
		UserTips.ins().showTips(str);
	}

	/**
	 * 翅膀数据同步
	 * 6-1
	 * @param bytes
	 */
	private doUpDataWing(bytes: GameByteArray): void {
		let index: number = bytes.readShort();
		SubRoles.ins().getSubRoleByIndex(index).wingsData.parser(bytes);
	}

	/**
	 * 培养回调
	 * 6-2
	 * @param bytes
	 */
	private doBoost(bytes: GameByteArray): void {
		let index: number = bytes.readShort();
		let lastLv = SubRoles.ins().getSubRoleByIndex(index).wingsData.lv;
		SubRoles.ins().getSubRoleByIndex(index).wingsData.parserBoost(bytes);
		let crit: number = 0;
		let addExp: number = bytes.readInt();
		SubRoles.ins().getSubRoleByIndex(index).wingsData.parserClearTime(bytes);//更新清空倒计时时间
		this.postBoost(crit, addExp);
		if (lastLv != SubRoles.ins().getSubRoleByIndex(index).wingsData.lv) {
			let skillAct: WingLevelConfig = GlobalConfig.WingLevelConfig[SubRoles.ins().getSubRoleByIndex(index).wingsData.lv];
			if (skillAct.pasSkillId) {
				// let skillConfig: SkillsConfig = GlobalConfig.SkillsConfig[skillAct.pasSkillId];
				// UserTips.ins().showTips(`${skillConfig.skinName}开启`);
			}
			SubRoles.ins().getSubRoleByIndex(index).setWingSkill();
			let role: CharRole = EntityManager.ins().getMainRole(index);
			if (role)
				role.updateModel();
			this.postWingUpgrade();

			Activationtongyong.show(1, skillAct.name, `j${skillAct.appearance}_png`);
		}
		this.postWingTime();
	}


	/**派发培养回调 */
	public postBoost(crit: number, addExp: number): any {
		return [crit, addExp];
	}

	/** 派发翅膀等级提升消息*/
	public postWingUpgrade(): void {

	}

	/**
	 * 激活回调
	 * @param bytes
	 */
	public postActivate(bytes: GameByteArray): void {
		let index: number = bytes.readShort();
		SubRoles.ins().getSubRoleByIndex(index).wingsData.parserOpenStatus(bytes);

		let config = GlobalConfig.WingLevelConfig[0];
		Activationtongyong.show(0, config.name, `j${config.appearance}_png`, ActivationtongyongShareType.Wing);

		//更新翅膀显示
		let role: CharRole = EntityManager.ins().getMainRole(index);
		if (!role) return;

		role.updateModel();

		// 激活翅膀后需要请求下一个唤醒任务
		UserTask.ins().requestNextAwakeTask(UserTask.AWAKE_TASK_TYPE.WING);
	}

	/**
	 * 更新翅膀装备
	 * @param bytes
	 */
	public postWingEquip(bytes: GameByteArray): void {
		let roleId: number = bytes.readShort();
		let index: number = bytes.readShort();
		let item: ItemData = new ItemData;
		item.parser(bytes);

		SubRoles.ins().getSubRoleByIndex(roleId).wingsData.getEquipByIndex(index).item = item;
		let role: CharRole = EntityManager.ins().getMainRole(roleId);
		if (!role) return;
		role.updateModel();
	}

	/**
	 * 升阶翅膀刷新倒计时
	 */
	public postWingTime(): void {

	}

	/*检查翅膀装备是否可以换*/
	// public checkWingEquip(roleid: number = -1, isWear: boolean = false): void {
	// 	let i: number, j: number, equip: EquipsData, item: ItemData, itemSubType: number, equipSubType: number;
	// 	//记录处理的装备
	// 	let tempEquips: ItemData[] = [];
	// 	//背包装备
	// 	let equipItems: ItemData[] = UserBag.ins().getBagEquipByType(4);
	// 	if (!equipItems)
	// 		return;
	// 	let len: number = roleid >= 0 ? roleid + 1 : SubRoles.ins().subRolesLen;
	// 	for (let index = roleid >= 0 ? roleid : 0; index < len; index++) {
	// 		tempEquips.length = 0;
	// 		//角色身上装备
	// 		let wingsData: WingsData = SubRoles.ins().getSubRoleByIndex(index).wingsData;
	// 		let equipCount: number = wingsData.equipsLen;
	// 		for (i = 0; i < equipCount; i++) {
	// 			equip = wingsData.getEquipByIndex(i);
	// 			//有装备跳过
	// 			if (equip.item.handle != 0)
	// 				continue;
	// 			for (j = 0; j < equipItems.length; j++) {
	// 				item = equipItems[j];

	// 				if (!item.itemConfig)
	// 					continue;
	// 				if (tempEquips.indexOf(item) >= 0//已经装备的就跳过
	// 					|| SubRoles.ins().getSubRoleByIndex(index).wingsData.lv < item.itemConfig.level//等级不足的跳过
	// 				)
	// 					continue;

	// 				itemSubType = item.itemConfig.subType;
	// 				//单件装备
	// 				if (itemSubType == i)
	// 					tempEquips[i] = UserEquip.contrastEquip(item, tempEquips[i]);
	// 			}
	// 		}
	// 		//对比有装备的
	// 		for (i = 0; i < equipCount; i++) {
	// 			equip = wingsData.getEquipByIndex(i);
	// 			//无装备跳过
	// 			if (equip.item.handle == 0)
	// 				continue;
	// 			if (equip.item.itemConfig)
	// 				equipSubType = equip.item.itemConfig.subType;

	// 			for (j = 0; j < equipItems.length; j++) {
	// 				item = equipItems[j];

	// 				if (!item.itemConfig)
	// 					continue;

	// 				if (tempEquips.indexOf(item) >= 0//已经装备的就跳过
	// 					|| SubRoles.ins().getSubRoleByIndex(index).wingsData.lv < item.itemConfig.level//等级不足的跳过
	// 				)
	// 					continue;
	// 				itemSubType = item.itemConfig.subType;
	// 				//装备类型相同
	// 				if (equipSubType == itemSubType) {
	// 					tempEquips[i] = UserEquip.contrastEquip(tempEquips[i] ? tempEquips[i] : equip.item, item);
	// 				}
	// 			}
	// 		}
	// 		for (i = 0; i < 4; i++) {
	// 			equip = wingsData.getEquipByIndex(i);
	// 			this.canChangeWingEquips[index][i] = false;
	// 			if (tempEquips[i] && equip.item.handle != tempEquips[i].handle) {
	// 				if (isWear && roleid == index) {
	// 					this.dressWingEquip(roleid, tempEquips[i].handle, i);
	// 					this.canChangeWingEquips[index][i] = false;
	// 				}
	// 				else {
	// 					this.canChangeWingEquips[index][i] = true;
	// 				}
	// 			}
	// 		}
	// 		if (this.canChangeWingEquips[index].indexOf(true) < 0)
	// 			this.canChangeWingEquips[index].length = 0;
	// 	}
	// 	this.showNavBtnRedPoint();
	// }

	/** 检查是否需要显示红点 */
	private showNavBtnRedPoint(): void {
		//是否有装备可以穿戴
		this.isListen = false;
		let b: boolean = false;
		let actorLv = Actor.level;
		if (Wing.ins().remainTask() <= 0) {
			//是否有翅膀装备可以穿戴
			//翅膀是否有可以升级
			if (!b && this.and(this.canGradeupWing())) {
				b = true;
			}
		}

		// MessageCenter.ins().dispatch(MessagerEvent.ROLE_HINT, b);
		UserRole.ins().showNavBtnRedPoint(b);
	}

	private and(list): boolean {
		for (let k in list) {
			if (list[k] == true)
				return true;
		}

		return false;
	}

	private wingSkillLevelDic: number[];

	public getLevelBySkill(index: number): number {
		if (!this.wingSkillLevelDic) {
			this.wingSkillLevelDic = [];
			let config: WingLevelConfig[] = GlobalConfig.WingLevelConfig;
			for (let k in config) {
				if (config[k].pasSkillId > 0) {
					this.wingSkillLevelDic.push(config[k].level);
				}
			}
		}
		if (this.wingSkillLevelDic[index]) {
			return this.wingSkillLevelDic[index];
		}
		return 0;
	}

	/** TODO hepeiye
	 * 是否可以提升翅膀（包括直升丹道具）
	 */
	public canGradeupWing(): boolean[] {
		let boolList: boolean[] = [false, false, false];
		// let lvMax: number = GlobalConfig.WingCommonConfig.lvMax;
		// let len: number = SubRoles.ins().subRolesLen;
		// for (let i: number = 0; i < len; i++) {
		// 	let curlevel: number = SubRoles.ins().getSubRoleByIndex(i).wingsData.lv;
		// 	if (curlevel < lvMax) {
		// 		boolList[i] = Actor.gold >= GlobalConfig.WingLevelConfig[curlevel].normalCostTip;
		// 		if (!boolList[i]) {
		// 			//判断直升丹
		// 			let cfg: WingCommonConfig = GlobalConfig.WingCommonConfig;
		// 			let num: number = UserBag.ins().getBagGoodsCountById(0, cfg.levelItemid);
		// 			boolList[i] = num > 0;
		// 		}
		// 	}
		// 	else {
		// 		boolList[i] = false;
		// 	}
		// }
		return boolList;
	}

	/** TODO hepeiye
	 * 是否可以使用道具（羽毛）提升翅膀
	 */
	public canItemGradeupWing(): boolean[] {
		let boolList: boolean[] = [false, false, false];
		let lvMax: number = Wing.WingMaxLv;
		let len: number = SubRoles.ins().subRolesLen;
		for (let i: number = 0; i < len; i++) {
			//获取角色是否激活了翅膀
			let roleOpenWing: number = SubRoles.ins().getSubRoleByIndex(i).wingsData.openStatus;
			if (roleOpenWing) {
				let curlevel: number = SubRoles.ins().getSubRoleByIndex(i).wingsData.lv;
				if (curlevel < lvMax && curlevel < Wing.WingExpRedPoint) {
					//获取背包是否有羽毛道具
					let config: WingLevelConfig = GlobalConfig.WingLevelConfig[curlevel];
					if (Assert(config, `get WingLevelConfig null ${curlevel}`)) continue;
					let num: number = UserBag.ins().getItemCountById(0, config.itemId);
					boolList[i] = config.itemNum <= num;
				} else {
					boolList[i] = false;
				}
				//翅膀直升丹
				if (!boolList[i]) {
					let count: number = UserBag.ins().getItemCountById(0, GlobalConfig.WingCommonConfig.levelItemid);
					boolList[i] = count > 0 && curlevel == Wing.WingExpRedPoint;
				}
			}
		}
		return boolList;
	}

	/**是否有翅膀可以激活
	 * @params roleId == -1 表示取全部
	 */
	public isHaveActivationWing(roleId: number = -1): boolean {
		if (this.remainTask() > 0) return false;

		let len: number = SubRoles.ins().subRolesLen;
		if (roleId == -1) {
			for (let i: number = 0; i < len; i++) {
				let wingData = SubRoles.ins().getSubRoleByIndex(i).wingsData;
				if (!wingData.openStatus) return true;
			}
		} else {
			let wingData = SubRoles.ins().getSubRoleByIndex(roleId).wingsData;
			if (!wingData.openStatus) return true;
		}
		return false;
	}

	/**
	 * 是否可以激活角色翅膀
	 * @returns boolean
	 */
	public canRoleOpenWing(): boolean[] {
		let boolList: boolean[] = [false, false, false];
		let len: number = SubRoles.ins().subRolesLen;
		for (let i: number = 0; i < len; i++) {
			//获取角色是否激活了翅膀
			let roleOpenWing: number = SubRoles.ins().getSubRoleByIndex(i).wingsData.openStatus;
			boolList[i] = !roleOpenWing && !this.remainTask();
		}
		return boolList;
	}

	public remainTask(): number {
		let count: number = UserTask.ins().isCanAwake(UserTask.AWAKE_TASK_TYPE.WING)?0:1;
		return count;
	}

	//本次登录是否提示 默认是提示
	public static hint: boolean = true;

	/**神羽相关*/
	/**
	 * 申请穿戴
	 * 6-3
	 * */
	public sendWingWear(roleId: number, itemId: number): void {
		let bytes: GameByteArray = this.getBytes(3);
		bytes.writeShort(roleId);
		bytes.writeInt(itemId);
		this.sendToServer(bytes);
	}
	/**
	 * 穿戴是否成功
	 * 6-3
	 * */
	public postWingWear(bytes: GameByteArray): boolean {
		let b: boolean = bytes.readBoolean();
		return b;
	}
	/**
	 * 神羽数据同步
	 * 6-5
	 * @param bytes
	 */
	public postGodWingData(bytes: GameByteArray): void {
		let roleId: number = bytes.readShort();
		if (!this.godWing[roleId])
			this.godWing[roleId] = new GodWingData();
		this.godWing[roleId].parser(bytes)

	}

	/**
	 * 神羽合成返回
	 * 6-6
	 * @param bytes
	 */
	public sendWingCompose(type: number, itemId: number, roleIndex?: number): void {
		//1快速合成（会触发返回3号消息） 2合成
		let tp: number = type;
		let bytes: GameByteArray = this.getBytes(6);
		bytes.writeShort(tp);
		bytes.writeInt(itemId);//合成的物品id
		if (tp == 1) {
			bytes.writeInt(roleIndex);//需要穿戴的人物索引
		}
		this.sendToServer(bytes);
	}

	/**
	 * 神羽置换
	 * 6-7
	 * @param bytes
	 */
	/**获取神羽当前部位id*/
	public sendResetGodWing(src: number, des: number): void {
		let bytes: GameByteArray = this.getBytes(7);
		bytes.writeInt(src);
		bytes.writeInt(des);
		this.sendToServer(bytes);
	}

	/** 使用提升丹
	 * 6-8
	 * @param id 当前role
	 * @param type 使用丹类型
	 */
	public sendUseDan(id: number, type: number): void {
		let bytes: GameByteArray = this.getBytes(8);
		bytes.writeByte(id);
		bytes.writeByte(type);
		this.sendToServer(bytes);
	}

	/**
	 * 使用提升丹成功
	 * 6-8
	 */
	public postUseDanSuccess(bytes: GameByteArray): void {
		let wingsData: WingsData = SubRoles.ins().getSubRoleByIndex(bytes.readByte()).wingsData;
		let type: number = bytes.readByte();
		let count: number = bytes.readShort();
		if (type == 0)
			wingsData.aptitudeDan = count;
		else
			wingsData.flyUpDan = count;
	}

    /** 子角色可以使用飞升丹
	 * @param roleID
	 */
	public canUseFlyUpByRoleID(roleID: number): boolean {
		let role: Role = SubRoles.ins().getSubRoleByIndex(roleID);
		if (role.wingsData && role.wingsData.openStatus == 1) {
			if (role.wingsData.flyUpDan < GlobalConfig.WingLevelConfig[role.wingsData.lv].flyPill) {
				let itemData: ItemData = UserBag.ins().getBagItemById(GlobalConfig.WingCommonConfig.flyPillId);
				let num: number = itemData ? itemData.count : 0;
				if (num)
					return true;
			}
		}

		return false;
	}

	/** 子角色可以使用资质丹
	 * @param roleID
	 */
	public canUseAptitudeByRoleID(roleID: number): boolean {
		let role: Role = SubRoles.ins().getSubRoleByIndex(roleID);
		if (role.wingsData && role.wingsData.openStatus == 1) {
			if (role.wingsData.aptitudeDan < GlobalConfig.WingLevelConfig[role.wingsData.lv].attrPill) {
				let itemData: ItemData = UserBag.ins().getBagItemById(GlobalConfig.WingCommonConfig.attrPillId);
				let num: number = itemData ? itemData.count : 0;
				if (num)
					return true;
			}
		}

		return false;
	}

	/**
	 * 使用飞升丹或资质丹
	 * @param id
	 */
	public userDans(id: number): void {
		let len: number = SubRoles.ins().roles.length;
		let role: Role;
		let maxRole: Role = null;
		let maxLvRole: Role = null;
		let maxUnOpen: number = 0;
		let lvMax: number = 0;
		let cfg: WingLevelConfig;
		let useMax: boolean;
		let isZiZhi: boolean = id == GlobalConfig.WingCommonConfig.attrPillId;
		for (let i: number = 0; i < len; i++) {
			role = SubRoles.ins().getSubRoleByIndex(i);
			if (role.wingsData.openStatus == 1) {
				cfg = GlobalConfig.WingLevelConfig[role.wingsData.lv];
				useMax = (isZiZhi && role.wingsData.aptitudeDan >= cfg.attrPill) || (!isZiZhi && role.wingsData.flyUpDan >= cfg.flyPill);
				if (!useMax) {
					if (!maxRole)
						maxRole = role;

					if (role.wingsData.lv > maxRole.wingsData.lv)
						maxRole = role;

					if (!maxLvRole)
						maxLvRole = role;

					if (isZiZhi && role.wingsData.aptitudeDan > maxRole.wingsData.aptitudeDan)
						maxLvRole = role;

					if (!isZiZhi && role.wingsData.flyUpDan > maxRole.wingsData.flyUpDan)
						maxLvRole = role;

				}
				else
					lvMax++;
			}
			else
				maxUnOpen++;
		}

		if (maxUnOpen >= len) {
			UserTips.ins().showTips("所有角色均未开启羽翼");
			return;
		}

		if (lvMax >= len) {
			UserTips.ins().showTips("所有角色羽翼" + (isZiZhi ? "资质" : "飞升") + "已满级");
			return;
		}

		let index: number = maxRole.index;
		if (maxRole.index != maxLvRole.index && maxRole.wingsData.lv == maxLvRole.wingsData.lv)
			index = maxLvRole.index;

		ViewManager.ins().open(RoleWin, 3, index);
	}
	
	/**获取神羽部位当前道具id*/
	public getCurLevelItemId(roleId: number, slot: number): GodWingLevelConfig {
		let glconfig: GodWingLevelConfig;
		let level: number;
		if (!this.godWing[roleId])
			return null;
		level = this.godWing[roleId].getLevel(slot);
		if (!level)
			return null;

		glconfig = GlobalConfig.GodWingLevelConfig[level][slot];
		return glconfig;//空代表未激活
	}

	/**获取神羽部位下一级道具id*/
	public getNextLevelItemId(roleId: number, slot: number): GodWingLevelConfig {
		let glconfig: GodWingLevelConfig;
		let level: number;
		if (!this.godWing[roleId]) {
			level = this.getStartLevel(slot);
		}
		level = this.godWing[roleId].getLevel(slot);
		level = level ? (this.getNextLevel(level)) : 0;
		if (!GlobalConfig.GodWingLevelConfig[level])
			return glconfig;//空代表满级
		glconfig = GlobalConfig.GodWingLevelConfig[level][slot];
		return glconfig;
	}
	/**快速合成红点*/
	public quickComposeRedPoint(roleIndex: number, slot: number) {
		let lv: number = Wing.ins().getGodWing(roleIndex).getLevel(slot);
		let nextLvl = this.getNextLevel(lv);
		if (!nextLvl)
			return false;

		let cfg: GodWingLevelConfig = GlobalConfig.GodWingLevelConfig[nextLvl][slot];
		if (!this.checkGodWingLevel(roleIndex, cfg.itemId))
			return false;

		if (this.checkGodWingItem(roleIndex, cfg.itemId, slot)) {
			return true;
		}
		return false;
	}
	/**装备红点*/
	public wearItemRedPoint(roleIndex: number, slot: number) {
		//在背包是否有更高阶可替换
		if (this.checkSlotLevel(roleIndex, slot)) {
			return true;
		}
		return false;
	}

	/**格子红点*/
	public gridRedPoint(roleIndex: number, slot: number) {
		//检查已经穿戴的某个部位 在背包是否有更高阶可替换
		if (this.wearItemRedPoint(roleIndex, slot)) {
			return true;
		}
		if (this.quickComposeRedPoint(roleIndex, slot)) {
			return true;
		}
		return false;
	}
	/**
	 * 是否有可装备的神羽
	 *
	 */
	public isWearGodWing(i: number) {

		let role: Role = SubRoles.ins().getSubRoleByIndex(i);
		if (!role) return false;
		for (let j = 1; j <= Wing.GodWingMaxSlot; j++) {
			if (this.gridRedPoint(role.index, j)) {
				return true;
			}
		}
		return false;
	}
	/**检查某个部位是否有穿戴*/
	public checkSlot(roleId: number, slot: number) {
		let lv: number = Wing.ins().getGodWing(roleId).getLevel(slot);
		if (!lv) {
			return false;
		}
		return true;
	}
	/**获取能穿的id*/
	public getWearItem(roleId: number, slot: number) {
		let lv: number = Wing.ins().getGodWing(roleId).getLevel(slot);
		let items: ItemData[] = UserBag.ins().getItemByType(ItemType.TYPE_16);
		for (let i = 0; i < items.length; i++) {
			let itemConf = GlobalConfig.GodWingItemConfig[items[i].configID];
			if (this.checkGodWingLevel(roleId, itemConf.itemId) && itemConf.slot == slot && itemConf.level > lv) {
				return itemConf.itemId;
			}
		}
		return 0;
	}
	/**在背包是否有更高阶可替换*/
	public checkSlotLevel(roleId: number, slot: number) {
		let lv: number = Wing.ins().getGodWing(roleId).getLevel(slot);
		// if( lv ){
		let items: ItemData[] = UserBag.ins().getItemByType(ItemType.TYPE_16);
		for (let i = 0; i < items.length; i++) {
			let itemConf = GlobalConfig.GodWingItemConfig[items[i].configID];
			if (this.checkGodWingLevel(roleId, itemConf.itemId) && itemConf.slot == slot && itemConf.level > lv) {
				return true;
			}
		}
		// }
		return false;
	}
	/**检查当前神羽道具是否符合穿戴要求*/
	public checkGodWingLevel(roleId: number, itemId: number) {
		let gwconfig: GodWingItemConfig = GlobalConfig.GodWingItemConfig[itemId];
		let myWinglevel = 0;
		let wd: WingsData = SubRoles.ins().getSubRoleByIndex(roleId).wingsData;
		myWinglevel += wd.lv;
		if (wd.openStatus)//已激活要+1处理一下
			myWinglevel += 1;
		if (myWinglevel >= gwconfig.level) {
			return true;
		}

		return false;
	}
	/**检查当前神羽道具是否有足够材料合成*/
	public checkGodWingItem(roleId: number, itemId: number, slot?: number) {
		//是否有足够的材料
		let gwconfig: GodWingItemConfig = GlobalConfig.GodWingItemConfig[itemId];
		let totalSum: number = gwconfig.composeItem.count;
		let mySum: number = 0;
		let itemdata: ItemData = UserBag.ins().getBagItemById(gwconfig.composeItem.id);
		if (itemdata)
			mySum = itemdata.count;
		//传了值代表要判定包括自身穿戴那件
		if (slot) {
			let isWear: number = this.getGodWing(roleId).getLevel(slot);
			if (isWear)
				totalSum -= 1;
		}

		if (mySum >= totalSum)
			return true

		return false;
	}
	/**
	 * 当前部位是否有可快速合成/升阶神羽
	 * 快速合成条件:1.可合成 2.能穿戴
	 */
	public isQuicComposeGodWing(roleId: number, slot: number) {
		let role: Role = SubRoles.ins().getSubRoleByIndex(roleId);
		if (!role) return false;
		let level: number = this.godWing[roleId].getLevel(slot);
		if (!level) {
			level = this.getStartLevel(slot);
		}
		if (!level)
			return false;



		//是否达到穿戴等级
		let myWinglevel = 0;
		let wd: WingsData = SubRoles.ins().getSubRoleByIndex(roleId).wingsData;
		myWinglevel += wd.lv;
		if (wd.openStatus)//已激活要+1处理一下
			myWinglevel += 1;
		if (myWinglevel < level) {
			return false;
		}
		//是否有足够的材料
		let isAct = Wing.ins().getGodWing(roleId).getLevel(slot);
		if (isAct) {//此部位是否有激活
			//求下一阶材料
			level = this.getNextLevel(level);
			if (!level)
				return false;
		}
		let itemId: number = GlobalConfig.GodWingLevelConfig[level][slot].itemId;
		let gwconfig: GodWingItemConfig = GlobalConfig.GodWingItemConfig[itemId];
		let totalSum: number = gwconfig.composeItem.count;
		let mySum: number = 0;
		let itemdata: ItemData = UserBag.ins().getBagItemById(gwconfig.composeItem.id);
		if (itemdata)
			mySum = itemdata.count;

		//查看当前装备中是否有神羽 有则把自身拥有数量+1 (快速合成)
		let myLevel: number = Wing.ins().getGodWing(roleId).getLevel(slot);
		if (myLevel) {
			let lcfg: GodWingLevelConfig = GlobalConfig.GodWingLevelConfig[myLevel][slot];
			if (lcfg.itemId == gwconfig.composeItem.id)//穿戴部位有相同的道具
				mySum += 1;
		}

		if (mySum >= totalSum)
			return true;


		return false;

	}
	/**
	 * 当前部位仅判断是否有可合成神羽
	 */
	public isComposeGodWingOnly(itemId: number) {
		let gwconfig: GodWingItemConfig = GlobalConfig.GodWingItemConfig[itemId];
		let totalSum: number = gwconfig.composeItem.count;
		let mySum: number = 0;
		let itemdata: ItemData = UserBag.ins().getBagItemById(gwconfig.composeItem.id);
		if (itemdata)
			mySum = itemdata.count;
		if (mySum >= totalSum)
			return true;

		return false;
	}

	/**
	 * 判断合成页所有阶神羽是否可合成
	 */
	public isComposeGodWingAll() {
		for (let k in GlobalConfig.GodWingSuitConfig) {
			let cfg: GodWingSuitConfig = GlobalConfig.GodWingSuitConfig[k];
			for (let i = 1; i <= Wing.GodWingMaxSlot; i++) {
				let glcfg: GodWingLevelConfig = GlobalConfig.GodWingLevelConfig[cfg.lv][i];
				if (this.isComposeGodWingOnly(glcfg.itemId))
					return true;
			}
		}
		return false;
	}

	/**
	 * 判断合成页某部位某阶神羽是否可合成
	 */
	public isComposeGodWingLevel(lv: number, slot: number) {
		let glcfg: GodWingLevelConfig = GlobalConfig.GodWingLevelConfig[lv][slot];
		if (this.isComposeGodWingOnly(glcfg.itemId)) {
			return true;
		}
		return false;
		// let cfg:GodWingSuitConfig = GlobalConfig.GodWingSuitConfig[lv];
		// for( let i = 1;i <= Wing.GodWingMaxSlot;i++ ){
		// 	let glcfg:GodWingLevelConfig = GlobalConfig.GodWingLevelConfig[cfg.lv][i];
		// 	if( this.isComposeGodWingOnly(glcfg.itemId) )
		// 		return true;
		// }
		// return false;
	}


	/**
	 * 判断合成页某阶某部位神羽是否可合成
	 */
	public isComposeGodWingSlot(lv: number, slot: number) {
		let cfg: GodWingSuitConfig = GlobalConfig.GodWingSuitConfig[lv];
		let glcfg: GodWingLevelConfig = GlobalConfig.GodWingLevelConfig[cfg.lv][slot];
		if (this.isComposeGodWingOnly(glcfg.itemId))
			return true;
		return false;
	}

	/**
	 * 是否有可合成神羽
	 * @param type: 空值:是否可合成  1:是否可合成并且达到可装备条件
	 */
	public isComposeGodWing(type?: number) {
		//求出当前当前开启角色中所有的神羽部位数据
		let len: number = SubRoles.ins().subRolesLen;
		for (let i = 0; i < 3; i++) {
			let role: Role = SubRoles.ins().getSubRoleByIndex(i);
			if (!role) continue;
			let slotData: { slot: number, level: number }[] = this.calcGodWingSlot(i);
			//当前角色四个部位神羽数据
			for (let j = 0; j < slotData.length; j++) {
				let gl: GodWingLevelConfig = GlobalConfig.GodWingLevelConfig[slotData[j].level][slotData[j].slot];
				//1情况判断此角色穿戴条件是否满足
				if (type) {
					let myWinglevel = 0;
					let wd: WingsData = SubRoles.ins().getSubRoleByIndex(i).wingsData;
					myWinglevel += wd.lv;
					if (wd.openStatus)//已激活要+1处理一下
						myWinglevel += 1;
					if (myWinglevel < gl.level) {
						continue;
					}
				}
				let gwconfig: GodWingItemConfig = GlobalConfig.GodWingItemConfig[gl.itemId];
				let itemId: number = gwconfig.composeItem.id;
				let itemData: ItemData = UserBag.ins().getBagItemById(itemId);
				let totalSum = gwconfig.composeItem.count;
				let mySum = itemData ? itemData.count : 0;
				if (mySum >= totalSum) {
					return true;
				}
			}
		}
		return false;
	}
	/**
	 * 求出当前角色四个部位神羽数据
	 * */
	public calcGodWingSlot(roleId: number) {
		let slotData: { slot: number, level: number }[] = [];
		for (let i = 1; i <= Wing.GodWingMaxSlot; i++) {
			let lv: number = Wing.ins().getGodWing(roleId).getLevel(i);
			let tmp: { slot: number, level: number } = { slot: 0, level: 0 };
			tmp.slot = i;
			if (!lv) {
				//此部位没有等级 代表未激活
				lv = this.getStartLevel(i);
			}
			tmp.level = lv;
			slotData.push(tmp);
		}
		return slotData;
	}


	/**获取表中某个部位最初神羽等级数据*/
	public getStartLevel(slot: number) {
		for (let k in GlobalConfig.GodWingLevelConfig) {
			let gwconfig: GodWingLevelConfig[] = GlobalConfig.GodWingLevelConfig[k];
			for (let j in gwconfig) {
				if (gwconfig[j].slot == slot) {
					return gwconfig[j].level;//部位最初等级
				}
			}
		}
		return 0;
	}

	/**获取当前等级的上一级*/
	public getPreLevel(curLevel: number) {
		let prelevel = 0;
		for (let k in GlobalConfig.GodWingLevelConfig) {
			if (!prelevel) {
				prelevel = Number(k);
				continue;
			}
			if (Number(k) == curLevel)
				return prelevel;
			prelevel = Number(k);
		}
		return prelevel;
	}
	/**获取当前等级的下一级*/
	public getNextLevel(curLevel: number) {
		let keys = [];
		for (let i in GlobalConfig.GodWingLevelConfig) {
			keys.push(+i);
		}
		keys.sort((a, b) => {
			if (a < b)
				return -1;
			return 1;
		});
		for (let k of keys) {
			if (curLevel < k)
				return k;
		}
		return 0;
	}


	//获取神羽部位名字
	public getNameFromSlot(slot: number) {
		let gwName = "";
		switch (slot) {
			case 1:
				gwName = "飞羽";
				break;
			case 2:
				gwName = "纤羽";
				break;
			case 3:
				gwName = "绒羽";
				break;
			case 4:
				gwName = "翎羽";
				break;
		}
		return gwName;
	}


	/**获取神羽数据*/
	public getGodWing(roleId: number) {
		if (!this.godWing[roleId])
			this.godWing[roleId] = new GodWingData();
		return this.godWing[roleId]
	}


}
/**神羽数据*/
class GodWingData {
	private data: Map<{ slot: number; level: number }> = {};//神羽具体数据
	public parser(bytes: GameByteArray): void {
		let len: number = bytes.readShort();
		for (let i = 0; i < len; i++) {
			let slot: number = bytes.readShort();
			let level: number = bytes.readInt();
			this.data[slot] = { slot: slot, level: level };
		}
	}
	public getLevel(slot: number) {
		return this.data[slot] ? this.data[slot].level : 0;
	}
	public getData() {
		return this.data;
	}

	//获取角色套装等级
	public getSuitLevel(): number {
		let minLv: number = Number.MAX_VALUE;
		let slot: number = 0;
		//获取最低等级
		for (let i in this.data) {
			if (this.data[i].level < minLv) {
				slot = this.data[i].slot;
				minLv = this.data[i].level;
			}
		}
		if (!slot) return 0;
		//获取最低等级对应所有部位数量(从高到低兼容)
		let glconfig: GodWingLevelConfig = GlobalConfig.GodWingLevelConfig[minLv][slot];//最小等级配置
		if (!glconfig) return 0;
		let ishave: number[] = [];
		for (let k in GlobalConfig.GodWingItemConfig) {
			let gwconfig: GodWingItemConfig = GlobalConfig.GodWingItemConfig[k];
			if (ishave.length >= Wing.GodWingMaxSlot) break;
			if (gwconfig.level >= glconfig.level && glconfig.slot != gwconfig.slot) {//高到低兼容等级其他部位
				if (this.data[gwconfig.slot] && this.data[gwconfig.slot].level >= gwconfig.level) {//不同于最低等级的部位的其他部位等级
					ishave.push(gwconfig.itemId);
					//同等级其他部位其中一件没有
					// for (let k in GlobalConfig.GodWingSuitConfig){
					//
					// 	return Number(k);
					// }
				}
			}
		}
		if (ishave.length >= Wing.GodWingMaxSlot - 1)//自己部位除外
			return minLv;

		return 0;
	}

	//获取角色套装拥有数量
	public getSuitSum() {
		let lv: number = this.getSuitLevel();
		// if( !lv ){
		//
		// 	return 0;
		// }
		let sum: number = 0;
		for (let i in this.data) {
			if (this.data[i].level >= lv) {
				sum++;
			}
		}

		return sum;
	}



}


namespace GameSystem {
	export let  wing = Wing.ins.bind(Wing);
}
