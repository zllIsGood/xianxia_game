class SpecialRing extends BaseSystem {
	public static perStar: number = 10;
	public mainHandler: number[] = [];//判断戒指是否已经存在
	public ringList: any[] = [];
	public loginDayCount: number = 0;
	public ringActiNum: number = 0;
	public specialRingHandler: number[] = [];
	private ringsConfig: any[] = [];
	private moneyOpenGrid: number = 0;

	/**
	 * 技能格子的信息
	 */
	public skillInfo: RingSkillInfo[];

	/**
	 * 火焰戒指ID
	 */
	public static FIRE_RING_ID: number = 7;

	/**
	 * 火焰戒指的移动速度
	 * @type {number}
	 */
	public static FIRE_RING_MOVING_SPEED: number = 3750;

	/**
	 * 火焰戒指技能格元宝开启阶数要求
	 * @type {number}
	 */
	public static GRID_OPEN_LEVEL: number = 20;

	public abilityIds: number[] = [];

	private skillLvDic = {};

	public constructor() {
		super();

		this.sysId = PackageID.Ring;
		this.regNetMsg(1, this.postRingUpdate);
		this.regNetMsg(2, this.postActiveRing);
		this.regNetMsg(3, this.postSpicelRingUpdate);
		this.regNetMsg(4, this.postGetSpicelRingInfo);
		this.regNetMsg(5, this.postSRStairUp);
		this.regNetMsg(6, this.postSRStairUp);
		this.regNetMsg(7, this.postUnLock);
		this.regNetMsg(8, this.postSkillInfo);
		this.regNetMsg(9, this.postRingAbility);

		this.observe(GameLogic.ins().postEnterMap, this.createRingAvatar);
	}

	private postRingAbility(bytes: GameByteArray): void {
		let count = bytes.readShort();
		for (let i: number = 0; i < count; i++) {
			let id: number = bytes.readShort();
			let lv: number = bytes.readShort();
			this.abilityIds[id] = lv;
		}
		if (GameMap.fbType == 0) {
			let cfg = this.getSpecialRingDataById(SpecialRing.FIRE_RING_ID);
			if (cfg) {
				let stage = this.getRingStair(cfg.level);
				if (stage >= 2) {
					if (this.specialRingHandler[SpecialRing.FIRE_RING_ID] > 0) {
						EntityManager.ins().removeByHandle(this.specialRingHandler[SpecialRing.FIRE_RING_ID]);
					}
					SpecialRing.ins().createRingMonster(SpecialRing.FIRE_RING_ID);
				}
			}
		}
	}


	/**
	 * 创建野外戒指形象
	 */
	private createRingAvatar(): void {
		if (GameMap.fbType == 0) {
			let cfg = this.getSpecialRingDataById(SpecialRing.FIRE_RING_ID);
			if (cfg) {
				let stage = this.getRingStair(cfg.level);
				if (stage >= 2) SpecialRing.ins().createRingMonster(SpecialRing.FIRE_RING_ID);
			}
		}
	}

	public sendUpGrade(index: number, roleID: number): void {
		let bytes: GameByteArray = this.getBytes(1);
		bytes.writeShort(index);
		bytes.writeShort(roleID);
		this.sendToServer(bytes);
	}

	public postRingUpdate(bytes: GameByteArray): boolean {
		let ringIndex: number = bytes.readShort();
		let roleIndex: number = bytes.readShort();
		let ringLv: number = bytes.readShort();
		SubRoles.ins().getSubRoleByIndex(roleIndex).setExRingsData(ringIndex, ringLv);
		return true;
	}

	public sendActiveRing(index: number, useGameGold: number = 0): void {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeShort(index);
		bytes.writeByte(useGameGold);
		this.sendToServer(bytes);
	}

	public postActiveRing(bytes: GameByteArray): any {
		let sRingIndex: number = bytes.readShort();
		let sRingLv: number = bytes.readShort();
		let sExp: number = bytes.readInt();
		let fight = bytes.readByte();
		let specialRing: SpecialRingData = this.getSpecialRingDataById(sRingIndex);
		specialRing.level = sRingLv;
		specialRing.exp = sExp;
		specialRing.fight = fight;
		this.ringActiNum++;
		if (sRingIndex == SpecialRing.FIRE_RING_ID) {
			this.updateGrid();
		}
		return [sRingIndex, 0];
	}

	public postSRStairUp(bytes: GameByteArray): any {
		let sRingIndex: number = bytes.readShort();
		let sRingLv: number = bytes.readShort();
		let sExp: number = bytes.readInt();
		let fight = bytes.readByte();
		let specialRing: SpecialRingData = this.getSpecialRingDataById(sRingIndex);
		specialRing.level = sRingLv;
		specialRing.exp = sExp;
		specialRing.fight = fight;
		this.createRingAvatar();
		this.updateGrid();
		return [sRingIndex, 0];
	}

	public sendSpicelRingUpdate(index: number): void {
		let bytes: GameByteArray = this.getBytes(3);
		bytes.writeShort(index);
		this.sendToServer(bytes);
	}

	public postSpicelRingUpdate(bytes: GameByteArray): any {
		let sRingIndex: number = bytes.readShort();
		let sRingLv: number = bytes.readShort();
		let sExp: number = bytes.readInt();
		let specialRing: SpecialRingData = this.getSpecialRingDataById(sRingIndex);
		let isCrit: number = 0;
		isCrit = bytes.readByte();
		let fight = bytes.readByte();
		specialRing.level = sRingLv;
		specialRing.exp = sExp;
		specialRing.fight = fight;
		return [sRingIndex, isCrit];
	}

	public postGetSpicelRingInfo(bytes: GameByteArray): boolean {
		this.loginDayCount = bytes.readInt();
		let ringCount: number = bytes.readShort();
		this.ringList = [];
		this.ringActiNum = 0;
		for (let i = 0; i < ringCount; i++) {
			let specialRing: SpecialRingData = new SpecialRingData();
			specialRing.parser(bytes);
			this.ringList.push(specialRing);
			if (specialRing.level > 0) this.ringActiNum++;
		}
		if (GameMap.fbType == 0) {
			GameLogic.ins().postHookStateChange(GameLogic.HOOK_STATE_FIND_ENMENY);
		}
		this.createRingAvatar();
		return true;
	}

	public isFireRing(handler: number): boolean {
		return (this.specialRingHandler[SpecialRing.FIRE_RING_ID] == handler);
	}

	public createRingMonster(id: number) {
		if (!this.ringList || this.ringList.length <= 0) return;
		let config: ActorExRingConfig = GlobalConfig.ActorExRingConfig[id];
		let data = this.getSpecialRingDataById(id);
		if (data.level < config.showMonsterLv) return;
		let monId = config.monsterId;
		let abilityId = this.getAbilityID();
		if (abilityId) {
			let cfg = GlobalConfig.ActorExRingItemConfig[SpecialRing.FIRE_RING_ID][abilityId][this.abilityIds[abilityId]];
			if (cfg) monId += cfg.monId;
		}

		if (!EntityManager.ins().getEntityByHandle(this.specialRingHandler[id])) {
			let role: CharRole = EntityManager.ins().getNoDieRole();
			if (role) {
				let m: EntityModel = UserFb.createModel(GlobalConfig.MonstersConfig[monId]);
				m.setAtt(AttributeType.atMoveSpeed, SpecialRing.FIRE_RING_MOVING_SPEED);
				m.x = role.x;
				m.y = role.y;
				m.masterHandle = Actor.handle;

				this.specialRingHandler[id] = m.handle = egret.getTimer();
				//烈焰印记
				m.lyMarkLv = LyMark.ins().lyMarkLv;
				m.lyMarkSkills = LyMark.ins().skills;

				let monster: CharMonster = GameLogic.ins().createEntityByModel(m, Team.My) as CharMonster;
				monster.AI_STATE = AI_State.Stand;
			}
		}
	}

	public sendRingLevelUp(index: number): void {
		let bytes: GameByteArray = this.getBytes(5);
		bytes.writeShort(index);
		this.sendToServer(bytes);
	}

	public sendRingFight(index: number, state: number): void {
		let bytes: GameByteArray = this.getBytes(6);
		bytes.writeShort(index);
		bytes.writeByte(state);
		this.sendToServer(bytes);
	}

	/**
	 * 检验戒指是否能操作 包括 激活 升级 戒指技能学习 戒指技能升级
	 */
	public checkOperation(): boolean {
		let bool: boolean = this.checkHaveUpRing();
		if (!bool && this.isFireRingFuse()) {
			bool = this.isCanStudySkill() || this.isCanUpgradeSkill();
		}
		return bool;
	}

	public checkHaveUpRing(): boolean {
		if (!SpecialRing.ins().checkRingOpen()) return false;
		let len: number = this.ringList.length;
		for (let i: number = 0; i < len; i++) {
			let data: SpecialRingData = this.ringList[i];
			let flag: boolean = this.checkRedPoint(data.id, data.level);
			if (flag)
				return flag;
		}
		return false;
	}

	public checkRingOpen(): boolean {
		let artifactMgr = Artifact.ins();
		let id = GlobalConfig.ActorExRingCommon.actImbaId;
		if (artifactMgr.getNewArtifactBy(artifactMgr.getArtifactIndexById(id))) {
			return artifactMgr.getNewArtifactBy(artifactMgr.getArtifactIndexById(id)).open;
		}
		return false
		// return UserTask.ins().isTaskCanAwake(UserTask.AWAKE_TASK_TYPE.RING);
	}

	public checkRedPoint(id: number, level: number): boolean {
		if (level > 0) {
			return this.checkCanUpdate(id, level);
		} else {
			return this.checkCanActive(id);
		}
	}

	/**
	 * 只有烈焰戒指可以升级
	 * @param id
	 * @param level
	 */
	public checkCanUpdate(id: number, level: number): boolean {
		let result: boolean = false;
		if (id == SpecialRing.FIRE_RING_ID && this.isFireRingFuse()) {//需要融合之后才能升级
			let config: ActorExRingConfig = GlobalConfig.ActorExRingConfig[id];
			if (this.getRingConfigById(id, level + 1)) {//需要有下一阶可以升级
				if (level % 11 == 0) {
					result = true;
				} else {
					let config = this.getRingConfigById(id, level);
					let count: number = UserBag.ins().getItemCountById(0, config.costItem);
					result = (config.cost <= count);
				}
			}
		}
		return result;
	}

	public checkCanActive(id: number): boolean {
		let config = GlobalConfig.ActorExRingConfig[id];
		let canActive: boolean = false;
		if (id == SpecialRing.FIRE_RING_ID) {
			if (!this.isFireRingActivate()) {
				canActive = this.isFireRingCanActivate();
			}
		}
		else {
			let lvl = this.getSpecialRingDataById(id).level;
			if (lvl == 0) {
				canActive = (SpecialRing.ins().loginDayCount >= config.openDay && config.openDay >= 0)
					|| (UserVip.ins().lv >= config.openVip && config.openVip >= 0)
					&& (Actor.yb >= config.openYb);
			}
		}
		return canActive;
	}

	/**
	 * 是否可以提升灵戒
	 */
	public canGradeupRing(type: number): boolean[] {
		let boolList: boolean[] = [false, false, false];
		let subRoles = SubRoles.ins();
		let len: number = subRoles.subRolesLen;
		let lv: number = 0;
		let config: ExRing0Config | ExRing1Config;
		let costNum: number = 0;
		let itemNum: number = 0;
		for (let i: number = 0; i < len; i++) {
			let role: Role = subRoles.getSubRoleByIndex(i);
			lv = role.getExRingsData(type);
			config = GlobalConfig[`ExRing${type}Config`][lv];
			costNum = config.cost;
			if (costNum) {
				itemNum = UserBag.ins().getItemCountById(0, GlobalConfig.ExRingConfig[type].costItem);
				boolList[i] = (itemNum >= costNum);
			} else {
				boolList[i] = false;
			}
		}
		return boolList;
	}

	public getRingConfigById(id: number, level: number): any {
		if (this.ringsConfig.length == 0) {
			this.initConfig()
		}
		if (this.ringsConfig[id] && this.ringsConfig[id][level]) return this.ringsConfig[id][level];
		return null;
	}

	private initConfig(): void {
		this.ringsConfig = [];
		let config: ActorExRingConfig[] = GlobalConfig.ActorExRingConfig;
		for (let k in config) {
			this.ringsConfig[config[k].id] = GlobalConfig[`ActorExRing${k}Config`];
		}
	}

	public getRingStair(level: number): number {
		let stair: number = 0;
		stair = Math.ceil(level / (SpecialRing.perStar + 1));
		return stair;
	}

	public getRingStar(level: number) {
		if (level < 1) {
			return 0;
		}
		return (level - 1) % (SpecialRing.perStar + 1);
	}

	//判断是否存在
	public hasHanlder(handler: number): boolean {
		for (let i = 0; i < this.mainHandler.length; i++) {
			if (handler == this.mainHandler[i]) {
				return true;
			}
		}
		this.mainHandler.push(handler);
		return false;
	}

	//判断是否存在
	public delHanlder(handler: number): void {
		for (let i = 0; i < this.mainHandler.length; i++) {
			if (handler == this.mainHandler[i]) {
				this.mainHandler.splice(i, 1);
				return;
			}
		}
	}

	public getSpecialRingDataById(id: number): SpecialRingData {
		for (let i: number = 0; i < this.ringList.length; i++) {
			if (this.ringList[i].id == id) {
				return this.ringList[i];
			}
		}
		return null;
	}

	/**
	 * 火焰戒指是否融合（激活）
	 */
	public isFireRingFuse(): boolean {
		let isFuse = false;
		let ringData = this.getSpecialRingDataById(SpecialRing.FIRE_RING_ID);
		if (ringData && ringData.level >= 1) {
			isFuse = true;
		}
		return isFuse;
	}

	/**
	 * 火焰戒指是否解封
	 */
	public isFireRingActivate(): boolean {
		let isActivate = false;
		let ringData = this.getSpecialRingDataById(SpecialRing.FIRE_RING_ID);
		if (ringData && ringData.isUnLock) {
			isActivate = true;
		}
		return isActivate;
	}

	/**
	 * 火焰戒指是否能解封
	 */
	public isFireRingCanActivate(): boolean {
		let canActivate = false;
		let config: ActorExRingConfig = GlobalConfig.ActorExRingConfig[SpecialRing.FIRE_RING_ID];
		let openDay: number = config.openDay;
		if (SpecialRing.ins().loginDayCount >= config.openDay && UserTask.ins().isAwakeDone()) {//解封条件之一 需要登录时间，所有唤醒完成
			for (let i: number = 0; i < this.ringList.length; i++) {
				canActivate = true;
				if (this.ringList[i].id != SpecialRing.FIRE_RING_ID && this.ringList[i].level == 0) {//解封条件二，需要其他灵戒激活
					canActivate = false;
					break;
				}
			}
		}
		return canActivate;
	}

	public requestDeblock(ringId: number): void {
		let bytes: GameByteArray = this.getBytes(7);
		bytes.writeShort(ringId);
		this.sendToServer(bytes);
	}

	public postUnLock(bytes: GameByteArray): boolean {
		let ringId = bytes.readShort();
		let lvl = bytes.readShort();
		let exp = bytes.readInt();
		let isFight = bytes.readByte();
		let isUnlock = bytes.readByte();
		for (let i: number = 0; i < this.ringList.length; i++) {
			if (this.ringList[i].id == ringId) {
				this.ringList[i].level = lvl;
				this.ringList[i].exp = exp;
				this.ringList[i].fight = isFight;
				this.ringList[i].isUnLock = isUnlock;
				break;
			}
		}

		return isUnlock == 1;
	}

	public requestOpenGrid(): void {
		let bytes: GameByteArray = this.getBytes(8);
		this.sendToServer(bytes);
	}

	public requestLearnSkill(skillId: number, position: number): void {
		let bytes: GameByteArray = this.getBytes(9);
		bytes.writeShort(skillId);
		bytes.writeShort(position);
		this.sendToServer(bytes);
	}

	public requestUpgradeSkill(position: number): void {
		let bytes: GameByteArray = this.getBytes(10);
		bytes.writeShort(position);
		this.sendToServer(bytes);
	}

	public postSkillInfo(bytes: GameByteArray): void {
		this.initSkill();
		this.moneyOpenGrid = bytes.readShort();
		this.updateGrid();
		let count = bytes.readShort();
		for (let i = 0; i < count; i++) {
			let ring: RingSkillInfo = new RingSkillInfo();
			ring.position = bytes.readShort();
			ring.skillId = bytes.readShort();
			ring.skillLvl = bytes.readShort();
			this.updateSkillInfo(ring);
		}
	}

	private updateGrid(): void {
		let cfg: SpecialRingData = this.getSpecialRingDataById(SpecialRing.FIRE_RING_ID);
		let openCount = 0;
		if (cfg.level > 0) {
			openCount = this.moneyOpenGrid + this.getRingConfigById(SpecialRing.FIRE_RING_ID, cfg.level).freeSkillGrid;
		}
		this.updateGridOpen(openCount);
	}

	private updateGridOpen(num: number): void {
		for (let i = 1; i <= num; i++) {
			let ring: RingSkillInfo = this.skillInfo[i - 1];
			ring.isOpen = true;
		}
	}

	private updateSkillInfo(skill: RingSkillInfo): void {
		let count: number = this.skillInfo.length;
		for (let i = 0; i < count; i++) {
			let ring: RingSkillInfo = this.skillInfo[i];
			if (ring.position == skill.position) {
				ring.skillId = skill.skillId;
				ring.skillLvl = skill.skillLvl;
			}
		}
	}

	/**
	 * 初始化技能数据
	 */
	private initSkill(): void {
		if (!this.skillInfo) {
			this.skillInfo = [];
			for (let i = 1; i < 9; i++) {
				let ring: RingSkillInfo = new RingSkillInfo();
				ring.position = i;
				this.skillInfo.push(ring);
			}
		}
	}

	/**
	 * 获取可以学习并且拥有的技能书列表
	 * @returns {RewardData[]}
	 */
	public getCanStudyBook(): RewardData[] {
		let ary: RewardData[] = [];
		if (!this.skillInfo) return ary;
		let count: number = this.skillInfo.length;
		let filter: number[] = [];
		let filterSkill: number[] = [];
		for (let i = 0; i < count; i++) {
			let ring: RingSkillInfo = this.skillInfo[i];
			if (ring.skillId > 0) {
				filterSkill.push(ring.skillId);
			}
		}

		let books: ActorExRingBookConfig[] = this.getActorExRingBookConfigByLvl(1);
		let len = books.length;
		for (let j = 0; j < len; j++) {
			let cfg: ActorExRingBookConfig = books[j];
			if (filterSkill.indexOf(cfg.id) < 0) {
				let num = UserBag.ins().getItemCountById(0, cfg.itemId);
				if (num >= cfg.num) {
					let info: RewardData = new RewardData();
					info.id = cfg.itemId;
					info.count = num;
					info.type = 1;
					ary.push(info);
				}
			}
		}
		return ary;
	}

	public isBookCanStudy(itemId: number): boolean {
		let ary: RewardData[] = [];
		let count: number = this.skillInfo.length;
		let filter: number[] = [];
		let filterSkill: number[] = [];
		for (let i = 0; i < count; i++) {
			let ring: RingSkillInfo = this.skillInfo[i];
			if (ring.skillId > 0) {
				filterSkill.push(ring.skillId);
			}
		}

		let books: ActorExRingBookConfig[] = this.getActorExRingBookConfigByLvl(1);
		let len = books.length;
		for (let j = 0; j < len; j++) {
			let cfg: ActorExRingBookConfig = books[j];
			if (cfg.itemId == itemId && filterSkill.indexOf(cfg.id) < 0) {
				let num = UserBag.ins().getItemCountById(0, cfg.itemId);
				if (num >= cfg.num) {
					return true;
				}
			}
		}
		return false;
	}

	public getStudyBook(): RewardData[] {
		let ary: RewardData[] = [];
		let filter: number[] = [];
		let books: ActorExRingBookConfig[] = this.getActorExRingBookConfigByLvl(1);
		let len = books.length;
		for (let j = 0; j < len; j++) {
			let cfg: ActorExRingBookConfig = books[j];
			let num = UserBag.ins().getItemCountById(0, cfg.itemId);
			let info: RewardData = new RewardData();
			info.id = cfg.itemId;
			info.count = num;
			info.type = 1;
			ary.push(info);
		}
		return ary;
	}

	public getFirstStudyBookIndex(): number {
		let books: ActorExRingBookConfig[] = this.getActorExRingBookConfigByLvl(1);
		let len = books.length;
		for (let j = 0; j < len; j++) {
			let cfg: ActorExRingBookConfig = books[j];
			if (this.isBookCanStudy(cfg.itemId)) {
				return j;
			}
		}
		return 0;
	}

	/**
	 * 获取火焰戒指 能否学习或者升级
	 */
	public isCanStudySkill(): boolean {
		let ary = this.getCanStudyBook();
		let canStudy: boolean = false;
		if (ary != undefined && ary.length > 0 && this.isHaveFreeGrid()) {
			canStudy = true;
		}
		return canStudy;
	}

	public isHaveFreeGrid(): boolean {
		let count: number = this.skillInfo.length;
		for (let i = 0; i < count; i++) {
			let ring: RingSkillInfo = this.skillInfo[i];
			if (ring.skillId == 0 && ring.isOpen) {
				return true;
			}
		}
		return false;
	}

	public isCanUpgradeSkill(): boolean {
		let ary: RewardData[] = [];
		if (!this.skillInfo) return false;
		let count: number = this.skillInfo.length;
		for (let i = 0; i < count; i++) {
			let ring: RingSkillInfo = this.skillInfo[i];
			if (ring.skillId > 0) {
				let cfg: ActorExRingBookConfig = this.getActorExRingBookConfig(ring.skillId, ring.skillLvl);
				let num = UserBag.ins().getItemCountById(0, cfg.itemId);
				if (num >= cfg.num) {
					return true;
				}
			}
		}
		return false;
	}

	public fireRingRedPoint(): boolean {
		let userFb = UserFb.ins();
		return userFb.fbRings.challengeTime > 0 || userFb.fbRings.canTakeAward;
	}

	public getActorExRingBookConfig(skillId: number, skillLvl: number): ActorExRingBookConfig {
		let cfg: ActorExRingBookConfig;
		for (let i in GlobalConfig.ActorExRingBookConfig) {
			for (let j in GlobalConfig.ActorExRingBookConfig[i]) {
				if (i == skillId.toString() && j == skillLvl.toString()) {
					cfg = GlobalConfig.ActorExRingBookConfig[i][j];
					break;
				}

			}
		}
		return cfg;
	}

	public getActorExRingBookConfigByLvl(skillLvl: number): ActorExRingBookConfig[] {
		let ary: ActorExRingBookConfig[] = [];
		let filter: number[] = [];
		for (let i in GlobalConfig.ActorExRingBookConfig) {
			for (let j in GlobalConfig.ActorExRingBookConfig[i]) {
				if (j == skillLvl.toString()) {
					if (filter.indexOf(GlobalConfig.ActorExRingBookConfig[i][j].itemId) < 0) {
						filter.push(GlobalConfig.ActorExRingBookConfig[i][j].itemId);
						ary.push(GlobalConfig.ActorExRingBookConfig[i][j]);
					}
					break;
				}
			}
		}
		return ary;
	}

	public getSkillIdByItemId(itemId: number): number {
		let skillId: number;
		for (let i in GlobalConfig.ActorExRingBookConfig) {
			for (let j in GlobalConfig.ActorExRingBookConfig[i]) {
				if (GlobalConfig.ActorExRingBookConfig[i][j].itemId == itemId) {
					skillId = parseInt(i);
					return skillId;
				}
			}
		}
		return 0;
	}

	public getSkillMaxLvl(skillId: number): number {
		let count: number = 0;
		if (this.skillLvDic[skillId] != undefined) {
			count = this.skillLvDic[skillId];
		}
		else {
			for (let i in GlobalConfig.ActorExRingBookConfig) {
				if (i == skillId.toString()) {
					for (let j in GlobalConfig.ActorExRingBookConfig[i]) {
						count++;
					}
				}
			}
			this.skillLvDic[skillId] = count;
		}
		return count;
	}

	public getNextStageSkillName(ringLvl: number): string {
		let skillName: string;
		for (let i in GlobalConfig.ActorExRingAbilityConfig) {
			let cfg = GlobalConfig.ActorExRingAbilityConfig[i];
			if (cfg && cfg.ringLv == ringLvl) {
				skillName = cfg.abilityName;
				break;
			}
		}
		return skillName;
	}

	public getUnLockStage(id: number): string {
		let cfg = GlobalConfig.ActorExRingAbilityConfig[id];
		let lvl = cfg.ringLv;
		let desc;
		switch (lvl) {
			case 1:
				desc = "一";
				break;
			case 5:
				desc = "五";
				break;
			case 10:
				desc = "十";
				break;
			case 20:
				desc = "二十";
				break;
			case 40:
				desc = "四十";
				break;
			case 60:
				desc = "六十";
				break;
			case 80:
				desc = "八十";
				break;
		}
		return desc;
	}

	/**
	 * 获取火焰戒指当前能释放的ID
	 */
	public getRingSkill(): number {
		if (!this.skillInfo) return 0;
		let count = this.skillInfo.length;
		let lvl = 0;
		for (let i = 0; i < count; i++) {
			let data = this.skillInfo[i];
			if (data.skillId == 7) { //减少火焰戒指技能CD
				lvl = data.skillLvl;
				break;
			}
		}
		let ringLvl = this.getSpecialRingDataById(7).level;
		let skillId = this.getRingConfigById(7, ringLvl).summonerSkillId;
		if (lvl > 0 && skillId) {
			let remainder = skillId % 10;
			remainder += lvl;
			if (remainder > 9) remainder = 9;
			let prefix = parseInt((skillId / 10).toString());
			skillId = prefix * 10 + remainder;
		}
		return skillId;
	}

	public getCanUpgradeStars(materialsCount: number): number {
		let lvl = this.getSpecialRingDataById(SpecialRing.FIRE_RING_ID).level;
		let star = 0;
		while (true) {
			lvl++;
			let cfg = GlobalConfig.ActorExRing7Config[lvl];
			if (!cfg) {
				return star;
			}
			else {
				materialsCount -= cfg.cost;
				if (materialsCount >= 0) {
					star++;
				} else {
					return star;
				}
			}
		}
		// return 0;
	}


	/**
	*获取灵戒战力
	*/
	public getSpecailRingPower(id: number): number {
		let power = 0;
		let attr;
        let lvl = 1;
        if (id == SpecialRing.FIRE_RING_ID) {
            lvl = SpecialRing.ins().getSpecialRingDataById(SpecialRing.FIRE_RING_ID).level;
        }
        let cfg = SpecialRing.ins().getRingConfigById(id, lvl);
        if (cfg){
            if (!attr) {
                attr = cfg.attrAward;
            } else {
                attr = AttributeData.AttrAddition(attr, cfg.attrAward);
            }
        }

        if (id == SpecialRing.FIRE_RING_ID) {
        	//唤醒任务的属性加到灵戒系统
	        let taskCount: number = Object.keys(GlobalConfig.FunOpenTaskConfig).length;
	        for (let i = 1; i <= taskCount; ++i) {
	            if (i < UserTask.ins().awakeData.awakeTaskId){
	                let config = UserTask.ins().getAwakeTypeConfById(i);
	                if (config){
	                    if (!attr){
	                        attr = config.attr;
	                    }else{
	                        attr = AttributeData.AttrAddition(attr, config.attr);
	                    }
	                }
	            }
	        }
        }

        if (attr) {
        	power = UserBag.getAttrPower(attr);
        	power = power * SubRoles.ins().subRolesLen;
        }
        return power;
	}

	
	public getAbilityID(index: number = 0): number {
		let ix: number = 0;
		for (let id in this.abilityIds) {
			if (ix == index) {
				return +(id);
			}
			ix++;
		}
		return 0;
	}

	/**根据道具id获取功能id */
	public getAbilityIdByItemId(itemId: number): number {
		let dp = GlobalConfig.ActorExRingItemConfig[SpecialRing.FIRE_RING_ID];
		for (let id in dp) {
			if (dp[id][1].itemId = itemId)
				return +(id);
		}
		return 0;
	}

	/**根据道具id获取功能最大等级 */
	public getMaxAbilityLvByItemId(itemId: number): number {
		let dp = GlobalConfig.ActorExRingItemConfig[SpecialRing.FIRE_RING_ID];
		for (let id in dp) {
			if (dp[id][1].itemId = itemId)
				return CommonUtils.getObjectLength(dp[id]);
		}
		return 0;
	}

	/**检查道具是否可使用 */
	public checkCanUseByItem(itemId: number): boolean {
		let id = this.getAbilityIdByItemId(itemId);
		let maxLv = this.getMaxAbilityLvByItemId(itemId);
		if (id && this.abilityIds[id] >= maxLv) {
			return false;
		}
		return true;
	}

	public static ins(): SpecialRing {
		return super.ins() as SpecialRing;
	}

}

namespace GameSystem {
	export let specialRing = SpecialRing.ins.bind(SpecialRing);
}
