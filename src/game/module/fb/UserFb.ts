/**副本管理器1*/
class UserFb extends BaseSystem {
	/** 关卡boss*/
	public static FB_TYPE_GUANQIABOSS: number = 1;
	/** 主城*/
	public static FB_TYPE_CITY: number = 20;
	/** 合服boss*/
	public static FB_TYPE_HEFUBOSS: number = 51;
	/** 挑战副本*/
	public static FB_TYPE_TIAOZHAN: number = 9;
	/** 试炼boss*/
	public static FB_TYPE_ZHUANSHENGBOSS: number = 10;
	/** 全民boss*/
	public static FB_TYPE_ALLHUMENBOSS: number = 7;
	/** 个人副本*/
	public static FB_TYPE_PERSONAL: number = 6;
	/** VIP专属BOSS*/
	public static FB_TYPE_HOMEBOSS: number = 17;
	/** 材料副本*/
	public static FB_TYPE_MATERIAL: number = 2;
	/** 经验副本*/
	public static FB_TYPE_EXP: number = 16;
	/** 仙盟BOSS*/
	public static FB_TYPE_GUILD_BOSS: number = 15;
	/** 天盟争霸*/
	public static FB_TYPE_GUILD_WAR: number = 14;
	/**神兵幻境 */
	public static FB_TYPE_MIJING: number = 21;
	public static FB_ID_JINGYAN: number = 3005;
	//矿洞
	public static FB_ID_MINE: number = 99999;//50000;
	//引导副本野外boss
	public static FB_TYPE_GUIDEBOSS: number = 18;
	//世界boss
	public static FB_TYPE_NEW_WORLD_BOSS: number = 19;
	//烈焰副本
	public static FB_TYPE_LIEYAN: number = 23;
	//神兵圣域
	public static FB_TYPE_GOD_WEAPON: number = 26;
	//神兵塔
	public static FB_TYPE_GOD_WEAPON_TOP: number = 27;
	/**剧情*/
	public static FB_TYPE_STORY: number = 28;
	/**
	 * 守护神剑的副本类型
	 * @type {number}
	 */
	public static FB_TYPE_GUARD_WEAPON: number = 29;
	/**跨服boss */
	public static FB_TYPE_KF_BOSS: number = 32;
	/**魔界入侵 */
	public static FB_TYPE_DEVILDOM_BOSS: number = 39;
	/**跨服竞技场 */
	public static FB_TYPE_KF_ARENA: number = 40;
	/**飞剑奇缘 */
	public static FB_TYPE_FEIJIANACT: number = 100;

	/**
	 * 烈焰戒指收费副本
	 * @type {number}
	 */
	public static FB_TYPE_FIRE_RING: number = 24;

	/** 日常副本数据 FbModel Dictionary */
	public fbModel = {};
	/**关卡数据 */
	/** 大地图章节组id */
	private _groupID: number = 1;
	/** 关卡id */
	private _guanqiaID: number = -1;

	/** 当前波的掉落物 */
	public rewards: WaveDropData[] = [];
	public eliteRewards: WaveDropData[][] = [];

	/** 关卡boss是否已经挑战过 */
	public bossIsChallenged: boolean;

	/**boss召唤令 使用次数 */
	public bossCallNum: number;
	public maxLen: number = 0;

	/** 章节关卡奖励领取状态 */
	public guanqiaReward: number = 0;
	/** 世界关卡领取奖励状态 0:表示未过一关*/
	public worldReward: number = 0;
	/** 世界关卡 - 可领取奖励关卡 */
	public worldGuanQias: number[] = [];

	/** 世界关卡 - 已领取奖励关卡 */
	public worldGuanQiaHasReceive: number[] = [];

	public currentEnergy: number = 0;

	public canChallengGuanQia: boolean = true;

	public encounterPos: number[] = [];

	public expMonterCount: number = 0;
	public expMonterCountKill: number = 0;

	public isQuite: boolean = true;

	public guideBossKill: number = 0;//假人被杀次数
	public guideBossPlayerId: number;
	public guideBossPlayerJob: number;
	public guideBossPlayerSex: number;
	public guideBossPlayerName: string;

	public showAni: boolean = true;
	public showAutoPk: number = -1;
	//开启自动闯关等级
	public static AUTO_GUANQIA: number = 10;

	/**
	 * 经验副本下发信息
	 * useTime 已挑战次数 sdTime 已扫荡次数 cid可领取挑战奖励副本id  sid可领取扫荡奖励id
	 */
	public fbExp: { useTime: number, sdTime: number, cid: number, sid }; //
	public fbExpTotal: number = 0;

	/** 组队副本通关ID */
	public tfPassID: number = 0;

	/** 下次可邀请时间 */
	private _tfInviteTime: number = 0;

	/** 组队副本切换状态更新事件 */
	public static TEAM_FB_WIN_REFLASH_PANEL: string = "TEAM_FB_WIN_REFLASH_PANEL";
	/** 初次登陆显示组队副本红点 */
	public showTfRed: boolean = true;
	/** 组队副本标题展开标题高度 */
	public static TF_EXPAND_HEIGHT: number = 298;
	/** 组队副本标题正常标题高度 */
	public static TF_SIMLPE_HEIGHT: number = 149;
	/** 是否为组队副本队长 */
	public isTFCaptain: boolean;
	/** 当前组队副本房间ID */
	public tfRoomID: number = 0;
	public curFbID: number;
	public curFbLeftTime: number;
	/** 组队副本 */
	public static FB_TEAM: number = 35;
	/** 组队副本房间成员 */
	public tfMembers: TeamFuBenRoleVo[];

	/** 组队副本全服广播 */
	public tfFlower: { sendRoleName: string,getRoleName: string,id:number,count: number }[];
	/** 组队副本通关排行 */
	public tfPassRanks: { configID: number, members: { position: number, roleName: string }[] }[];

    public ID:any[];

	/**
	 * 烈焰副本
	 * useTime 已挑战次数 canTakeAward是否可领取奖励
	 */
	public fbRings: { buyTime: number, challengeTime: number, canTakeAward: boolean } = { buyTime: 0, challengeTime: 0, canTakeAward: false };

	public get rCount(): number {
		return this.fbConfig.rCount || 0;
	};

	public get goldEff(): number {
		return this.fbConfig.goldEff || 0;
	};

	public get expEff(): number {
		return this.fbConfig.expEff || 0;
	};

	public goldEffLast: number;
	public expEffLast: number;

	public get zyPos(): { x: number, y: number }[] {
		return this.fbConfig.zyPos;
	};

	public get energy(): number {
		return this.fbConfig.energy || 0;
	};

	public get waveEnergy(): number {
		return this.fbConfig.waveEnergy || 0;
	};

	public get waveMonsterCount(): number {
		return this.fbConfig.waveMonsterCount || 0;
	};

	public get waveMonsterId(): number[] {
		return this.fbConfig.waveMonsterId || [];
	};

	public get outPos(): { x: number, y: number, a: number } {
		return this.fbConfig.outPos || { x: 0, y: 0, a: 0 };
	};

	public get rPos(): { x: number, y: number }[][] {
		return this.fbConfig.rPos || [];
	};

	public get eliteMonsterId(): number {
		return this.fbConfig.eliteMonsterId || 0;
	};

	public get wanderpercent(): number {
		return this.fbConfig.wanderpercent == undefined ? 5000 : this.fbConfig.wanderpercent;
	};

	public guanqiaMonster: MonstersConfig[] = [];

	public fbConfig: ChaptersConfig = {} as any;
	//试炼评分
	public mijingFingfen: number = 4;
	public mijingUseTime: number = 0;
	public oldMijingPoint: number;

	public zuDuiRed: boolean = false;

	public constructor() {
		super();
		this.sysId = PackageID.Guanqia;
		this.regNetMsg(4, this.doRoleAllDie);
		this.regNetMsg(10, this.postFbInfo);
		this.regNetMsg(11, this.postFbInfoUp);
		this.regNetMsg(13, this.postFbTime);
		this.regNetMsg(14, this.doBossBoxNum);
		this.regNetMsg(16, this.postFbExpInfo);
		this.regNetMsg(17, this.postFbExpTotal);
		this.regNetMsg(18, this.doGuideFbAliveTime);
		this.regNetMsg(21, this.postFbRingInfo);

		//关卡相关
		this.regNetMsg(1, this.postGuanqiaInfo);
		this.regNetMsg(2, this.doWaveData);
		this.regNetMsg(3, this.doBossResult);
		this.regNetMsg(5, this.doGuanqiaReward);
		this.regNetMsg(6, this.doGuanqiaWroldReward);
		this.regNetMsg(12, this.doOfflineReward);

		//新手剧情
		this.regNetMsg(25, this.doStoryFbAlert);
		this.regNetMsg(26, this.postGuardLeftTime);
		this.regNetMsg(27, this.postGuardInfo);
		this.regNetMsg(29, this.postGuardUseSkill);
		this.regNetMsg(30, this.postGuardCopyInfo);
		this.regNetMsg(31, this.postBossDrop);
		this.regNetMsg(32, this.postGuardWeaponLogs);

		//组队副本
		this.regNetMsg(34, this.postCreateTFRoomSuccess);
		this.regNetMsg(35, this.postEnterTFRoomSuccess);
		this.regNetMsg(36, this.exitTFRoom);
		this.regNetMsg(37, this.postFTRoomChange);
		this.regNetMsg(38, this.postFTRoomPassInfo);
		this.regNetMsg(39, this.doTeamFuBenEnd);
		this.regNetMsg(40, this.doTeamFuBenRelive);
		this.regNetMsg(41,this.postTeamFuBenRank);
		this.regNetMsg(42,this.postTeamFbFlowarRecords);
		this.regNetMsg(43, this.teamFbSysInviteInfo);
		this.regNetMsg(44,this.postTeamFbFlowarRecords1);


		this.observe(GameLogic.ins().postEnterMap, this.onChangeScene);
		this.observe(GameLogic.ins().postHpChange, this.recordKill);

		this.observe(this.postGuanqiaInfo, this.getMapReward);
	}
	public challengeGuard(): void {
		let bytes: GameByteArray = this.getBytes(26);
		this.sendToServer(bytes);
	}

	private postBossDrop(bytes: GameByteArray): void {
		let type = bytes.readByte();
		let bossHandle = bytes.readDouble();
		let len = bytes.readByte();

		for (let j = 0; j < len; j++) {
			let reward = new RewardData();
			reward.type = bytes.readInt();
			reward.id = bytes.readInt();
			reward.count = bytes.readInt();
			if (reward.type == 0 && reward.id != 1 && reward.id != 2 && reward.id != MoneyConst.rune) {
				//掉落除了元宝和金币 战纹精华，其他都不出现
			}
			else {
				DropHelp.addDrop([DropHelp.tempDropPoint.x != 0 ? DropHelp.tempDropPoint.x : Math.floor(EntityManager.ins().getNoDieRole().x / GameMap.CELL_SIZE),
					DropHelp.tempDropPoint.y != 0 ? DropHelp.tempDropPoint.y : Math.floor(EntityManager.ins().getNoDieRole().y / GameMap.CELL_SIZE),
					reward])
			}
		}
		DropHelp.start();
		TimerManager.ins().doTimerDelay(500, 100, 1, () => {
			this.getBossDrop(type, bossHandle);
		}, this);
	}

	private getBossDrop(type: number, bossHandler: number): void {
		let bytes: GameByteArray = this.getBytes(31);
		bytes.writeByte(type);
		bytes.writeDouble(bossHandler);
		this.sendToServer(bytes);
	}

	public guardUseSkill(index: number): void {
		let bytes: GameByteArray = this.getBytes(29);
		bytes.writeByte(index);
		this.sendToServer(bytes);
	}

	public callGuardBoss(): void {
		let bytes: GameByteArray = this.getBytes(28);
		this.sendToServer(bytes);
	}

	/**
	 * 守护神剑扫荡
	 * 1-33
	 */
	public sendShSweep(count: number): void {
		let bytes: GameByteArray = this.getBytes(33);
		bytes.writeByte(count);
		this.sendToServer(bytes);
	}

	public postGuardCopyInfo(bytes: GameByteArray): void {
		let info = GuardWeaponModel.ins().guardCopyInfo || new GuardCopyInfo();
		info.parser(bytes.readByte(), bytes.readInt(), bytes.readByte(), bytes.readInt(), bytes.readByte(), bytes.readInt())
		GuardWeaponModel.ins().guardCopyInfo = info;
	}

	public postGuardUseSkill(bytes: GameByteArray): number {
		return bytes.readByte();
	}

	public postGuardLeftTime(bytes: GameByteArray): void {
		GuardWeaponModel.ins().leftTime = bytes.readUnsignedInt();
	}

	private recordKill([target, value]: [CharMonster, number]) {
		if (target instanceof CharRole) return;

		if (value <= 0) this.expMonterCountKill += 1;
	}

	protected initLogin(): void {
		if (GlobalConfig.DailyFubenConfig) {
			this.fbDataList.length = 0;
			for (let key in GlobalConfig.DailyFubenConfig) {
				let cfg = GlobalConfig.DailyFubenConfig[key];
				if (cfg.bossId) {
					continue;
				}
				this.fbDataList.push(cfg.id);
			}
		}
	}

	public static ins(): UserFb {
		return super.ins() as UserFb;
	}

	//切换场景清理掉奖励
	private onChangeScene() {
		this.rewards = [];
		this.eliteRewards = [];

		this.expMonterCountKill = 0;
		this.expMonterCount = 0;

		//组队副本战斗界面
		if (!this.tfRoomID)
			ViewManager.ins().close(TeamFbRoomWin);

		ViewManager.ins().close(TeamFbResultWin);
		if (GameMap.fbType == UserFb.FB_TEAM) {
			ViewManager.ins().open(TeamFbFightWin);
		} else {
			ViewManager.ins().close(TeamFbFightWin);
		}
	}

	/**根据id获取副本配置 */
	public getFbDataById(id: number): FbModel {
		return this.fbModel[id];
	}

	public pkGqboss: boolean = false;

	public autoPk(): void {
		if (!GameMap.sceneInMain()) return;
		if (Encounter.ins().isEncounter()) {
			UserTips.ins().showTips("|C:0xf3311e&T:正在挑战附近的人|");
			return;
		}
		if (!EntityManager.ins().getNoDieRole()) {
			//主角尚未出现在场景
			return;
		}
		RoleAI.ins().stop();
		RoleAI.ins().clearAIList();
		this.postPlayWarm(1);
		UserFb.ins().sendPKBoss();
		UserFb.ins().pkGqboss = true;
	}

	public postAddEnergy(): void {
		this.currentEnergy += Math.ceil(this.waveEnergy / this.waveMonsterCount);
		if (this.currentEnergy > UserFb.ins().energy) {
			this.currentEnergy = UserFb.ins().energy;
		}
	}

	public postPlayWarm(num: number) {
		return num;
	}

	public hasCount(): boolean {
		if (GlobalConfig.DailyFubenConfig) {
			for (let key in GlobalConfig.DailyFubenConfig) {
				let cfg = GlobalConfig.DailyFubenConfig[key];
				let mo: FbModel = this.fbModel[cfg.id];
				if (!mo || cfg.bossId) {
					continue;
				}
				//天仙副本开启条件
				if (mo.fbID == 3005) {
					//如开服时间未达到天仙副本开始天数，则屏蔽
					if (GlobalConfig.ZhanLingConfig.openserverday > GameServer.serverOpenDay + 1)
						continue;
				}
				let count: number = this.fbModel[mo.fbID].getCount();
				if (count > 0) {
					return true;
				}
				//死亡引导判断
				if (DieGuide.ins().dieFbRedPoint(this.fbModel[mo.fbID].getResetCount(), cfg.id))
					return true;
			}
		}
		return false;
	}

	/**
	 * 处理角色死亡
	 * 1-4
	 * @param bytes
	 */
	private doRoleAllDie(bytes: GameByteArray): void {
		// ViewManager.ins().open(ResultWin, 0);
		ResultManager.ins().create(GameMap.fbType, 0);
	}

	/**
	 * 初始化副本信息
	 * 1-10
	 * @param bytes
	 */
	postFbInfo(bytes: GameByteArray): void {
		let count: number = bytes.readShort();
		let fbModel: FbModel;
		for (let i = 0; i < count; i++) {
			fbModel = new FbModel();
			fbModel.parser(bytes);
			this.fbModel[fbModel.fbID] = fbModel;
		}
		//登录时，组队副本有红点
		if (this.zuDuiRed == false){
			if (UserFb.ins().isTeamFBOpen())  this.zuDuiRed = true;
		}
	}

	/**
	 * 发送请求召唤boss
	 */
	public sendCallBossPlay(id: number): void {
		let bytes: GameByteArray = this.getBytes(12);
		bytes.writeInt(id);
		this.sendToServer(bytes);
	}

	/**
	 * 请求挑战副本
	 * 1-10
	 * @param fbID  副本ID
	 */
	public sendChallenge(fbID: number): void {
		let bytes: GameByteArray = this.getBytes(10);
		bytes.writeInt(fbID);
		this.sendToServer(bytes);
	}

	/**
	 * 更新副本信息
	 * 1-11
	 * @param bytes
	 */
	postFbInfoUp(bytes: GameByteArray): void {
		let fbID: number = bytes.readInt();
		bytes.position -= 4;
		this.fbModel[fbID].parser(bytes);
	}

	/**
	 * 发送添加副本挑战次数
	 * 1-11
	 * @param fbID 副本id
	 */
	public sendAddCount(fbID: number, isDouble: number = 0): void {
		let bytes: GameByteArray = this.getBytes(11);
		bytes.writeInt(fbID);
		bytes.writeByte(isDouble);
		this.sendToServer(bytes);
	}

	/**
	 * 处理副本剩余时间
	 * 1-13
	 * @param bytes
	 */
	public postFbTime(bytes: GameByteArray): any {
		let fbID: number = bytes.readInt();
		let leftTime: number = bytes.readInt();
		return [fbID, leftTime];
	}

	//boss召唤的次数
	private doBossBoxNum(bytes: GameByteArray): void {
		this.bossCallNum = bytes.readShort();
	}

	/**
	 * 1-16
	 * @param bytes
	 * @returns {{useTime: number, sdTime: number, fbId: number}}
	 */
	public postFbExpInfo(bytes: GameByteArray): any {
		this.fbExp = this.fbExp || {} as any;
		this.fbExp.useTime = bytes.readByte();
		this.fbExp.sdTime = bytes.readByte();
		this.fbExp.cid = bytes.readByte();
		this.fbExp.sid = bytes.readByte();
		return this.fbExp;
	}

	//怪物总数
	public postFbExpTotal(bytes: GameByteArray): number {
		this.fbExpTotal = bytes.readInt();
		return this.fbExpTotal;
	}

	public fbExpRed(): boolean {
		if (Actor.level >= GlobalConfig.ExpFubenBaseConfig.openLv) {
			if (this.fbExp.useTime < (GlobalConfig.ExpFubenBaseConfig.freeCount + (GlobalConfig.ExpFubenBaseConfig.vipCount[UserVip.ins().lv] || 0)) || this.fbExp.cid || this.fbExp.sid) {
				return true;
			}
		}
		return false;
	}

	/**
	 * 1-18
	 * @param fbId 进入引导副本
	 */
	public sendIntoGuideFb(fbId: number): void {
		let bytes = this.getBytes(18);
		bytes.writeInt(fbId);
		this.sendToServer(bytes);
	}

	/**
	 * 1-19
	 */
	public sendGuideFbAttacker(): void {
		this.sendBaseProto(19);
	}

	/**
	 * 1-20
	 */
	public sendGuideFbAlive(): void {
		this.sendBaseProto(20);
	}

	/**
	 * 新手任务切换地图
	 * 1-24
	 */
	public sendGuideChangeMap(): void {
		this.sendBaseProto(24);
	}

	/**
	 * 1-18
	 * @param bytes
	 */
	public doGuideFbAliveTime(bytes: GameByteArray): void {
		UserBoss.ins().postRemainTime(bytes);
	}

	//烈焰副本信息
	public postFbRingInfo(bytes: GameByteArray) {
		this.fbRings.buyTime = bytes.readShort();
		this.fbRings.challengeTime = bytes.readShort();
		this.fbRings.canTakeAward = bytes.readBoolean();
	}

	/**新手副本剧情弹窗 
	 * 1-25
	*/
	public doStoryFbAlert(bytes: GameByteArray) {
		let type = bytes.readShort();
		if (type == 1) {
			ViewManager.ins().open(StoryAlertWinType1);
		}
	}

	/**新手副本剧情请求创建机器人
	 * 1-25
	*/
	public sendCreateRobot() {
		this.sendBaseProto(25)
	}


	////////////////////////////////////////////////////////////  其他  ///////////////////////////////////

	public parser(bytes: GameByteArray): void {
		let idIndex: number = bytes.readInt();
		this.guanqiaID = idIndex;
	}

	public exp: number = 0;

	public parser1(bytes: GameByteArray): void {
		// this.wave = bytes.readInt();
		this.exp = bytes.readInt();
		let count: number = bytes.readInt();
		for (let i = 0; i < count; i++) {
			let item: WaveDropData = new WaveDropData();
			item.parser(bytes);
			this.rewards.push(item);
		}
	}

	public get guanqiaID(): number {
		return this._guanqiaID;
	}

	/**大地图的章节组ID */
	public get groupID(): number {
		return this._groupID;
	}

	public set guanqiaID(value: number) {
		if (this._guanqiaID != value) {
			this._guanqiaID = value;
			this.bossIsChallenged = false;
			for (let i in GlobalConfig.WorldRewardConfig) {
				if (this._guanqiaID <= GlobalConfig.WorldRewardConfig[i].needLevel) {
					this._groupID = GlobalConfig.WorldRewardConfig[i].groupId;
					break;
				}
			}
			this.postGqIdChange();
		}
		this.encounterPos = [];
		for (let k in this.zyPos) {
			this.encounterPos.push(parseInt(k));
		}
	}

	/**
	 * 当前关卡宝箱是否可领取
	 * @param    pass    关卡
	 */
	public isReceiveBox(pass: number): boolean {
		return this.worldGuanQias.indexOf(pass) != -1;
	}

	/**
	 * 当前关卡宝箱是否已领取
	 * @param    pass    关卡
	 */
	public isGetReceiveBox(pass: number): boolean {
		return this.worldGuanQiaHasReceive.indexOf(pass) != -1;
	}

	/**
	 * 是否能挑战boss
	 */
	public isShowBossPK(): boolean {
		return this.guanqiaID != -1
	}

	/** 获取当前波的掉落物（列表最后一个开始） */
	public getRewardsPop(): WaveDropData[] {
		return this.rewards;
	}


	/**
	 * 获取下一关地图奖励
	 */
	public getMapReward() {
		let index = 1;
		while (GlobalConfig.WorldRewardConfig[index]) {
			if (!this.isGetReceiveBox(index) && GlobalConfig.WorldRewardConfig[index].needLevel < UserFb.ins().guanqiaID) {
				this.sendGuanqiaWroldReward(index);
				//return;
			}
			index++;
		}
	}

	/**
	 * 获取当前可领取地图奖励
	 */
	public getCurrentReward(): RewardData[] {
		let index = 1;
		while (GlobalConfig.WorldRewardConfig[index]) {
			let config = GlobalConfig.WorldRewardConfig[index];
			let result = this.isGetReceiveBox(index)
			let id = UserFb.ins().guanqiaID
			if (!this.isGetReceiveBox(index) && UserFb.ins().guanqiaID > config.needLevel) {
				return config.rewards;
			}
			index++;
		}
		return null;
	}

	/**
	 * 获取下次奖励
	 */
	public getNextReward(): RewardData[] {
		let index = 1;
		while (GlobalConfig.WorldRewardConfig[index]) {
			let config = GlobalConfig.WorldRewardConfig[index];
			if (UserFb.ins().guanqiaID <= config.needLevel) {
				return config.rewards;
			}
			index++;
		}
		return null;
	}

	/**
	 * 获取下次通关奖励所需章节数
	 *
	 */
	public getNextNeedChapter() {
		let index = 1;
		while (GlobalConfig.WorldRewardConfig[index]) {
			let config = GlobalConfig.WorldRewardConfig[index];
			if (UserFb.ins().guanqiaID <= config.needLevel) {
				return config.needLevel - UserFb.ins().guanqiaID + 1;
			}
			index++;
		}
		return 0;
	}

	/**
	 * 获取当次和下一次的关卡差通关地图数据
	 *
	 */
	public getDiffChapter(): number {
		let index = 1;
		while (GlobalConfig.WorldRewardConfig[index]) {
			let config = GlobalConfig.WorldRewardConfig[index];
			if (UserFb.ins().guanqiaID <= config.needLevel && index > 1) {
				let preconfig = GlobalConfig.WorldRewardConfig[index - 1];

				return config.needLevel - preconfig.needLevel;
			}
			index++;
		}
		return 0;
	}

	/**
	 * 获取当次前最新关卡地图数据
	 *
	 */
	public getNewChapter(): WorldRewardConfig {
		let index = 1;
		while (GlobalConfig.WorldRewardConfig[index]) {
			let config = GlobalConfig.WorldRewardConfig[index];
			if (UserFb.ins().guanqiaID <= config.needLevel) {
				let idx: number = index - 1;
				idx = idx ? idx : 1;
				return GlobalConfig.WorldRewardConfig[idx];
			}
			index++;
		}
		return null;
	}

	/**
	 * 根据当前关卡找出对应的正在寻找的碎片
	 * */
	public getChipByGuanQia() {
		for (let k in GlobalConfig.WorldRewardConfig) {
			let config: WorldRewardConfig = GlobalConfig.WorldRewardConfig[k];
			if (this.guanqiaID <= config.needLevel)
				return config.rewards[0].id;
		}
		return 0;
	}


	/**
	 * 处理关卡初始化信息
	 * 1-1
	 * @param bytes
	 */
	public postGuanqiaInfo(bytes: GameByteArray): void {
		let lastID: number = this.guanqiaID;

		this.parser(bytes);

		// this.rCount = bytes.readShort();
		this.goldEffLast = bytes.readInt();
		this.expEffLast = bytes.readInt();

		this.fbConfig = JSON.parse(bytes.readString());

		if (lastID != -1 && this.guanqiaID != lastID) {
			this.currentEnergy = 0;
			ViewManager.ins().open(EffectivenessTip);
		}
		// this.goldEff = bytes.readInt();
		// this.expEff = bytes.readInt();
		// let len = bytes.readShort();
		// this.zyPos = [];
		// for (let i = 0; i < len; i++) {
		// 	this.zyPos.push({x: bytes.readShort(), y: bytes.readShort()});
		// }
		// this.energy = bytes.readInt();
		// this.waveEnergy = bytes.readInt();
		// this.waveMonsterCount = bytes.readShort();
		//
		// len = bytes.readShort();
		// this.waveMonsterId = [];
		// for (let i = 0; i < len; i++) {
		// 	this.waveMonsterId.push(bytes.readInt());
		// }
		//
		// this.outPos = {x: bytes.readShort(), y: bytes.readShort(), a: bytes.readShort()};
		//
		// len = bytes.readShort();
		// this.rPos = [];
		// for (let i = 0; i < len; i++) {
		// 	this.rPos[i] = [];
		// 	let len1 = bytes.readShort();
		// 	for (let j = 0; j < len1; j++)
		// 		this.rPos[i].push({x: bytes.readShort(), y: bytes.readShort()});
		// }
		//
		// this.eliteMonsterId = bytes.readInt();
		// this.wanderpercent = bytes.readInt();

		this.guanqiaMonster = JSON.parse(bytes.readString());

		if (GameMap.fubenID == 0)
			GameLogic.ins().createGuanqiaMonster();
	}


	public fbDataList: number[] = [];

	public postGqIdChange(): void {

	}

	/**
	 * 清完一波请求
	 *
	 * 是否精英怪奖励
	 */
	public sendGetReward(isElite?: boolean): void {
		let bytes: GameByteArray = this.getBytes(1);
		bytes.writeByte(isElite ? 1 : 0);
		this.sendToServer(bytes);
	}

	/**
	 * 请求挑战boss
	 */
	public sendPKBoss(): void {
		let bytes: GameByteArray = this.getBytes(2);
		let char = EntityManager.ins().getNoDieRole();

		TimerManager.ins().doTimer(500, 1, () => {
			bytes.writeInt(Math.floor(char.x));
			bytes.writeInt(Math.floor(char.y));
			this.sendToServer(bytes);
		}, this);
	}

	/**
	 * 处理关卡波数信息
	 * 1-2
	 * @param bytes
	 */
	private doWaveData(bytes: GameByteArray): void {
		this.exp = bytes.readInt();
		let count: number = bytes.readInt();
		let awards = [];
		for (let i = 0; i < count; i++) {
			let item: WaveDropData = new WaveDropData();
			item.parser(bytes);
			awards.push(item);
		}
		let isElite: number = bytes.readByte();
		if (isElite > 0) {
			this.eliteRewards.push(awards);
			if (this.eliteRewards.length > 5) this.eliteRewards.shift();
			GameLogic.ins().createGuanqiaMonster(false, true);
		} else {
			this.rewards = this.rewards.concat(awards);
		}
	}

	/**
	 * 处理挑战boss结果
	 * 1-3
	 * @param bytes
	 */

	private doBossResult(bytes: GameByteArray): void {
		let result: boolean = bytes.readBoolean();
		let fbType: number = bytes.readShort();
		let count: number = bytes.readShort();
		let reward: RewardData;
		let rewards: RewardData[] = [];
		for (let i = 0; i < count; i++) {
			reward = new RewardData();
			reward.parser(bytes);
			rewards.push(reward);
		}

		if (result) {
			let len: number = SubRoles.ins().subRolesLen;
			let role: CharRole;
			for (let k: number = 0; k < len; k++) {
				role = EntityManager.ins().getMainRole(k);
				if (role) {
					role.resetStand();
				}
			}

			for (let j = 0; j < rewards.length; j++) {
				reward = rewards[j];
				if (reward.type == 0 && reward.id != 1 && reward.id != 2 && reward.id != MoneyConst.rune && GameMap.fbType == UserFb.FB_TYPE_STORY) {
					//掉落除了元宝和金币 符文精华，其他都不出现
				}
				else {
					// Encounter.ins().postCreateDrop(DropHelp.tempDropPoint.x != 0 ? DropHelp.tempDropPoint.x : Math.floor(EntityManager.ins().getNoDieRole().x / GameMap.CELL_SIZE),
					// 	DropHelp.tempDropPoint.y != 0 ? DropHelp.tempDropPoint.y : Math.floor(EntityManager.ins().getNoDieRole().y / GameMap.CELL_SIZE),
					// 	reward);
					DropHelp.addDrop([DropHelp.tempDropPoint.x != 0 ? DropHelp.tempDropPoint.x : Math.floor(EntityManager.ins().getNoDieRole().x / GameMap.CELL_SIZE),
					DropHelp.tempDropPoint.y != 0 ? DropHelp.tempDropPoint.y : Math.floor(EntityManager.ins().getNoDieRole().y / GameMap.CELL_SIZE),
						reward])
				}

				//获得神器
				if (reward.type == 1) {
					let conf = GlobalConfig.ItemConfig[reward.id];
					let type = ItemConfig.getType(conf);
					if (type == 7) {
						let itemData = new ItemData();
						itemData.configID = reward.id;
						UserTips.ins().showGoodEquipTips(itemData);
					}
				}
			}

			let f: Function = () => {
				if (GameMap.fbType != UserFb.FB_TYPE_EXP) {
					this.sendGetBossReward();
				}
				//是挑战副本的话，添加关闭方法
				let f2: Function = null;
				if ((fbType == UserFb.FB_TYPE_TIAOZHAN && SkyLevelModel.ins().getIsopenNext) || GameMap.fbType == UserFb.FB_TYPE_PERSONAL) {
					f2 = () => {
						UserFb.ins().pkGqboss = false;
						if (GameMap.fbType == UserFb.FB_TYPE_PERSONAL) {
							ViewManager.ins().open(BossWin, 0)
						} else {
							if (UserFb.ins().isQuite) {
								ViewManager.ins().open(FbWin, 2);
							}
						}
					}
				}

				if (fbType == UserFb.FB_TYPE_GUIDEBOSS && GameMap.fubenID == 40000) {//全民boss引导副本
					let isBelong: number = UserFb.ins().guideBossKill;
					let belongName, job, sex, belongImg;
					if (isBelong) {
						belongName = Actor.myName;
						job = SubRoles.ins().roles[0].job;
						sex = SubRoles.ins().roles[0].sex;
					} else {
						belongName = UserFb.ins().guideBossPlayerName;
						job = UserFb.ins().guideBossPlayerJob;
						sex = UserFb.ins().guideBossPlayerSex;
					}
					// belongImg = `yuanhead${job}${sex}`;
					belongImg = `main_role_head${job}`
					// ViewManager.ins().open(ResultWin, true, rewards, "", null, [isBelong, belongName, belongImg]);
					ResultManager.ins().create(fbType, true, rewards, "", null, [isBelong, belongName, belongImg])
				}
				else if (GameMap.fbType == UserFb.FB_TYPE_EXP) {
					TimerManager.ins().doTimer(800, 1, () => {
						ViewManager.ins().open(ExpFbResultWin)
					}, this);
				} else if (GameMap.fbType == UserFb.FB_TYPE_LIEYAN) {
					TimerManager.ins().doTimer(800, 1, () => {
						ViewManager.ins().open(FireResultWin);
					}, this);
				} else if (GameMap.fbType == UserFb.FB_TYPE_MIJING) {//试炼
				} else if (GameMap.fbType == UserFb.FB_TYPE_STORY) {//剧情

				} else if (fbType != UserFb.FB_TYPE_GUANQIABOSS) {
					if (rewards.length) {
						TimerManager.ins().doTimer(800, 1, () => {
							// ViewManager.ins().open(ResultWin, 1, rewards, "获得奖励如下：", f2);
							ResultManager.ins().create(fbType, 1, rewards, "获得奖励如下：", f2);
						}, this);
					} else {
						UserFb.ins().pkGqboss = false;
						UserFb.ins().sendExitFb();
					}
				} else {
					if (this.outPos.x && this.outPos.y) {
						let posX: number = this.outPos.x * GameMap.CELL_SIZE;
						let posY: number = this.outPos.y * GameMap.CELL_SIZE;

						if (this.outPos.hasOwnProperty("a") && this.outPos.a == 1) GameLogic.ins().addOutEff(posX, posY);
						let len: number = SubRoles.ins().subRolesLen;
						let char: CharRole;
						for (let i: number = 0; i < len; i++) {
							char = EntityManager.ins().getMainRole(i);
							if (char) {
								// GameMap.moveEntity(char, posX, posY);
								let distance = MathUtils.getDistance(char.x, char.y, posX, posY);
								egret.Tween.get(char.moveTweenObj).to({ x: posX, y: posY }, distance / GameMap.CELL_SIZE * 100).call(this.tempFunc, this)
								char.dir = DirUtil.get8DirBy2Point(char, { x: posX, y: posY });
								char.playAction(EntityAction.FLY);
								char.drawJumpShadow();
							}
						}
						TimerManager.ins().doTimer(1000, 0, this.tempFunc, this);
					} else {
						this.initPos = true;
						UserFb.ins().pkGqboss = false;
						UserFb.ins().sendExitFb();
					}
				}
			};
			DropHelp.addCompleteFunc(f, this);
			DropHelp.start();
		}
		else {
			UserFb.ins().pkGqboss = false;
			//如果主动退出的是关卡boss，则关闭自动挑战
			if (GameMap.fbType == UserFb.FB_TYPE_GUANQIABOSS) {
				PlayFun.ins().closeAuto();
			}
			// if (GameMap.fbType == UserFb.FB_TYPE_MIJING) {//试炼
			// 	ViewManager.ins().open(GwResultView, GameMap.fubenID, 4);
			// } else {
			// ViewManager.ins().open(ResultWin, 0);
			ResultManager.ins().create(fbType, 0);
			// }
		}
		if (GameMap.fbType == UserFb.FB_TYPE_GUANQIABOSS) {
			Hint.ins().postKillBossEx(UserFb.ins().guanqiaID);
		}

	}

	public initPos: boolean = true;

	private tempFunc(): void {
		let char = EntityManager.ins().getNoDieRole();
		if (!char) {
			TimerManager.ins().remove(this.tempFunc, this);
			return;
		}
		let x_Grid = Math.floor(char.x / GameMap.CELL_SIZE);
		let y_Grid = Math.floor(char.y / GameMap.CELL_SIZE);
		let out_X_Grid = this.outPos.x;
		let out_Y_Grid = this.outPos.y;
		if (x_Grid == out_X_Grid && y_Grid == out_Y_Grid) {
			TimerManager.ins().remove(this.tempFunc, this);
			GameLogic.ins().removeOutEff();
			this.initPos = false;
			UserFb.ins().pkGqboss = false;
			UserFb.ins().sendExitFb();
			Hint.ins().postSeceneIn();
		}
	}

	/**
	 * 请求领取boss奖励
	 * 1-3
	 */
	public sendGetBossReward(): void {
		this.sendBaseProto(3);
	}

	/**
	 * 退出副本
	 * 1-4
	 */
	public sendExitFb(): void {
		this.sendBaseProto(4);
	}

	/**
	 * 发送领取关卡奖励
	 * 1-5
	 */
	public sendGetAward(): void {
		this.sendBaseProto(5);
	}

	/**
	 * 处理关卡奖励领取状态
	 * 1-5
	 * @param bytes
	 */
	public doGuanqiaReward(bytes: GameByteArray): void {
		this.guanqiaReward = bytes.readShort() + 1;
		this.postZhangJieAwardChange();
		this.postGqIdChange();
		this.postGuanqiaWroldReward();
	}

	/**派发章节领取状态变更消息 */
	public postZhangJieAwardChange(): void {

	}

	/**
	 * 领取地区奖励
	 * 1-6
	 */
	public sendGuanqiaWroldReward(pass: number): void {
		let bytes: GameByteArray = this.getBytes(6);
		bytes.writeInt(pass);
		this.sendToServer(bytes);
	}

	/**
	 * 地区奖励记录
	 * 1-6
	 */
	public doGuanqiaWroldReward(bytes: GameByteArray): void {
		let len: number = bytes.readInt();
		let isReceive: number = 0;
		let pass: number = 0;
		this.worldGuanQias = [];
		this.worldGuanQiaHasReceive = [];
		for (let i: number = 0; i < len; i++) {
			//0 可领取
			//1 已领取
			//2 未达到
			isReceive = bytes.readInt();
			pass = i + 1;
			//记录所有可以领取宝箱的关卡
			if (isReceive == 0) {
				this.worldGuanQias.push(pass);
			} else if (isReceive == 1) {
				this.worldGuanQiaHasReceive.push(pass)
			}
			//记录已通关的最高值
			if (isReceive == 0 || isReceive == 1) {
				this.worldReward = pass;
			}
		}
		this.postGuanqiaWroldReward();
	}

	public postGuanqiaWroldReward(): void {

	}

	/**
	 * 处理离线奖励
	 * 1-12
	 * @param bytes
	 */
	private doOfflineReward(bytes: GameByteArray): void {
		let arr = [];
		arr[0] = bytes.readInt();//离线时间
		arr[1] = bytes.readInt();//经验
		arr[2] = bytes.readInt();//金钱
		arr[3] = bytes.readInt();//装备数量
		arr[4] = bytes.readInt();//出售的装备数
		let len: number = bytes.readInt();//额外加成个数
		let aryObj: Object[] = [];
		for (let i = 0; i < len; i++) {
			let obj: Object = new Object();//经验金钱额外加成
			obj["type"] = bytes.readInt();//加成类型（1图鉴,2月卡,3印记,4新神器）
			obj["exp"] = bytes.readInt();
			obj["gold"] = bytes.readInt();
			aryObj.push(obj);
		}
		arr[5] = aryObj;


		len = bytes.readByte();
		let coin: { id: number, count: number }[] = [];
		for (let i = 0; i < len; i++) {
			let tmp: any = {};
			tmp.id = bytes.readByte();
			tmp.count = bytes.readInt();
			coin.push(tmp);
		}
		ViewManager.ins().open(OfflineRewardWin, arr, coin);
	}

	/** 获取 宝箱可领取奖励关卡 */
	public getWorldGuanQia(): number {
		if (this.worldGuanQias.length > 0)
			return this.worldGuanQias[this.worldGuanQias.length - 1];
		else
			return 0;
	}

	/**
	 * 获取可领取奖励或者下一关的宝箱
	 * @returns number
	 */
	public getWorldGuanQiaBox(): number {
		let len: number = this.worldGuanQias.length;
		if (len > 0) {
			let index: number;
			for (let i = 0; i < len; i++) {
				index = this.worldGuanQias[i];
				//返回最前一个可领取宝箱
				if (UserFb.ins().isReceiveBox(index))
					return index;
			}
		}
		//返回下一关的奖励宝箱
		return this.worldReward + 1;
	}

	public sendKillMonster(id: number) {
		let bytes: GameByteArray = this.getBytes(13);
		bytes.writeInt(id);
		this.sendToServer(bytes);
	}

	//挑战经验副本
	public sendChallengeExpFb() {
		this.sendBaseProto(14);
	}

	//扫荡经验副本 mul 倍数
	public sendSaodang() {
		let bytes: GameByteArray = this.getBytes(15);
		this.sendToServer(bytes);
	}

	//领取扫荡经验副本 mul 倍数
	public sendGetAwardMul(type, mul) {
		let bytes: GameByteArray = this.getBytes(16);
		bytes.writeByte(type);
		bytes.writeByte(mul);
		this.sendToServer(bytes);
	}

	//请求挑战烈焰副本
	public sendChallengeFbRing() {
		this.sendBaseProto(22);
	}

	//请求领取战烈焰副本奖励
	public sendFbRingTakeAward(mul) {
		let bytes: GameByteArray = this.getBytes(23);
		bytes.writeShort(mul);
		this.sendToServer(bytes);
	}

	public checkGuanqiaIconShow(): boolean {
		return OpenSystem.ins().checkSysOpen(SystemType.CHALLENGE);
	}

	public postGuardInfo(bytes: GameByteArray): void {
		let num = bytes.readByte();
		GuardWeaponModel.ins().challengeTimes = num;
		GuardWeaponModel.ins().isShowSweep = bytes.readByte() == 1;
	}


	/**
	 * 守护神剑-请求获奖记录
	 */
	public sendGuardWeaponLogs() {
		this.sendBaseProto(32);
	}

	/**
	 * 守护神剑-下发获奖记录
	 */
	public postGuardWeaponLogs(bytes: GameByteArray) {
		let len = bytes.readByte();
		let arr = [];
		for (let i = 0; i < len; i++) {
			let noticeId = bytes.readInt();//公告id
			let roleName = bytes.readString();//玩家名字
			let monsterName = bytes.readString();//怪物名字
			let itemName = bytes.readString();//物品名字
			arr.push({
				noticeId: noticeId,
				roleName: roleName,
				monsterName: monsterName,
				itemName: itemName
			});
		}
		return arr;
	}

	/**
	 * 经验飘点
	 * @param {XY} globalPoint 点位
	 * @param {number} count    点数
	 * @param {number} delay    每点延时
	 * @returns {XY}
	 */
	public postExpFly(globalPoint: XY, count: number = 1, delay: number = 10) {
		return [globalPoint, count, delay];
	}

	//获取当前可以打的经验副本id
	public getExpFbId() {
		let config = GlobalConfig.ExpFubenConfig;
		let lv = Actor.level;
		let _id: number = 0;
		for (let id in config) {
			if (config[id].slv > lv) {
				break;
			}
			_id = +id;
		}
		return _id;
	}

	public checkInFB(): boolean {
		if (GameMap.fbType == UserFb.FB_TYPE_GUANQIABOSS || UserFb.ins().pkGqboss) {
			UserTips.ins().showCenterTips(`|C:0xf3311e&T:当前正在挑战关卡中|`);
			return true;
		}
		if (GameMap.fubenID != 0 && !CityCC.ins().isCity) {
			UserTips.ins().showCenterTips("|C:0xf3311e&T:正在挑战副本中，请稍后再试|");
			return true;
		}
		//判断是否在挑战遭遇战，防止遭遇战过程中玩家进入其它副本
		if (Encounter.ins().isEncounter()) {
			UserTips.ins().showTips("|C:0xf3311e&T:正在挑战附近的人|");
			return true;
		}
		return false;
	}


	createMonster(id: number): EntityModel {
		let config = this.guanqiaMonster[id];
		let model = UserFb.createModel(config);
		model.name = config.name;
		model._avatar = +config.avatar;
		model._scale = config.scale;
		model.wanderrange = config['wanderrange'];
		model.wandertime = config['wandertime'];
		model.effect = config.effect;
		model._dirNum = config.dirNum;
		return model;
	}

	static createModel(config: MonstersConfig): EntityModel {
		let model: EntityModel = new EntityModel;
		model.type = EntityType.Monster;
		model.configID = config.id;
		model.setAtt(AttributeType.atHp, config.hp);
		model.setAtt(AttributeType.atMaxHp, config.hp);
		model.setAtt(AttributeType.atAttack, config.atk);
		model.setAtt(AttributeType.atDef, config.def);
		model.setAtt(AttributeType.atRes, config.res);
		model.setAtt(AttributeType.atCrit, config['crit']);
		model.setAtt(AttributeType.atTough, config['tough']);
		model.setAtt(AttributeType.atMoveSpeed, config['ms'] || 3750);
		model.setAtt(AttributeType.atAttackSpeed, config['as'] || 1000);
		model.setAtt(AttributeType.atPenetrate, config['penetRate'] || 0);
		return model;
	}

	/**  获取个人boss配置列表 */
	static getPersonalBossFbIds(): DailyFubenConfig[] {
		let result: DailyFubenConfig[] = [];
		for (let i in GlobalConfig.DailyFubenConfig) {
			let c: DailyFubenConfig = GlobalConfig.DailyFubenConfig[i];
			if (c && c.bossId)
				result.push(c);
		}
		return result;
	}

	/** 是否有可挑战 */
	static isCanChallenge(): boolean {
		let datas: DailyFubenConfig[] = this.getPersonalBossFbIds();
		let len: number = datas.length;
		let data: DailyFubenConfig;
		let sCount: number;
		for (let i: number = 0; i < len; i++) {
			data = datas[i];
			//还没数据不处理
			if (!UserFb.ins().getFbDataById(data.id))
				continue;
			//还有次数
			sCount = UserFb.ins().getFbDataById(data.id).getCount();
			if (sCount > 0) {
				if (data.monthcard) {
					if (Recharge.ins().monthDay > 0) {
						return true;
					}
				} else if (data.privilege) {
					if (Recharge.ins().getIsForeve()) {
						return true;
					}
				} else if (data.specialCard) {
					if (Recharge.ins().franchise) {
						return true;
					}
				}
				else {
					if (data.zsLevel > 0) {
						if (UserZs.ins().lv >= data.zsLevel)
							return true;
					}
					else {
						if (Actor.level >= data.levelLimit)
							return true;
					}
				}
			}
		}
		return false;
	}

	public setAutoPk() {
		if (this.showAutoPk == -1) {
			this.showAutoPk = 0;
			this.postAutoPk();
		}

		// TimerManager.ins().remove(this.autoPkEnd, this);
		// TimerManager.ins().doTimer(3000, 1, this.autoPkEnd, this)
	}

	public postAutoPk() {

	}

	public postAutoPk2() {

	}

	/** 组队副本世界邀请cd */
	public getTfInviteCD(): number {
		return Math.floor((this._tfInviteTime * 1000 + DateUtils.SECOND_2010 * 1000 - GameServer.serverTime) / 1000);
	}

	/**
	 * 组队副本红点值改变
	 */
	public postShowRedChange(value: boolean): void {
		this.showTfRed = value;
	}

	/** 组队副本是否开启 */
	public isTeamFBOpen(): boolean {
		return UserZs.ins().lv >= GlobalConfig.TeamFuBenBaseConfig.needZsLv && (GameServer.serverOpenDay + 1) >= GlobalConfig.TeamFuBenBaseConfig.openDay;
	}

	/** 请求创建组队副本房间
	 * 1-34
	 */
	public sendCreateTFRoom(): void {
		let bytes: GameByteArray = this.getBytes(34);
		this.sendToServer(bytes);
	}

	/** 创建组队副本房间成功
	 * 1-34
	 */
	public postCreateTFRoomSuccess(bytes: GameByteArray): void {
		this.tfRoomID = bytes.readInt();
		let cfgID: number = bytes.readInt();
		if (this.tfRoomID)
			ViewManager.ins().open(TeamFbRoomWin, 1, cfgID, this.tfRoomID);
		else
			ViewManager.ins().close(TeamFbRoomWin);
	}

	/** 请求进入组队副本房间
	 * 1-35
	 * @param id 房间ID
	 */
	public sendEnterTFRoom(id: number): void {
		let bytes: GameByteArray = this.getBytes(35);
		bytes.writeInt(id);
		this.sendToServer(bytes);
	}

	/** 请求进入组队副本房间成功
	 * 1-35
	 */
	public postEnterTFRoomSuccess(bytes: GameByteArray): void {
		switch (bytes.readByte()) {
			case 0:
				let cfgID: number = bytes.readInt();
				this.tfRoomID = bytes.readInt();
				ViewManager.ins().open(TeamFbRoomWin, 1, cfgID, this.tfRoomID);
				break;
			case 1:
				UserTips.ins().showTips(`每周${DateUtils.WEEK_CN[GlobalConfig.TeamFuBenBaseConfig.closeTime[0]]}${GlobalConfig.TeamFuBenBaseConfig.closeTime[1]}后不能挑战`);
				break;
			case 2:
				UserTips.ins().showTips("在副本内不能进入");
				break;
			case 3:
				UserTips.ins().showTips("已经在别的房间");
				break;
			case 4:
				UserTips.ins().showTips("要进入的房间不存在");
				break;
			case 5:
				UserTips.ins().showTips("当前通关的层级不够");
				break;
			case 6:
				UserTips.ins().showTips("配置错误,不存在该房间配置");
				break;
			case 7:
				UserTips.ins().showTips("房间已经满人");
				break;
		}
	}

	/** 请求退出组队副本房间
	 * 1-36
	 */
	public sendExitTFRoom(): void {
		this.sendBaseProto(36);
	}

	/**
	 * 离开副本成功
	 * 1-36
	 */
	private exitTFRoom(bytes: GameByteArray): void {
		switch (bytes.readByte()) {
			case 1: //自己退出
				break;
			case 2: //被踢了
				UserTips.ins().showTips(`您被队长踢出房间`);
				break;
			case 3: //房主解散
				UserTips.ins().showTips(`队长解散了房间`);
				break;
		}

		ViewManager.ins().close(TeamFbRoomWin);
		this.tfRoomID = 0;

	}

	/** 请求开始组队副本
	 * 1-37
	 */
	public sendBeginTF(): void {
		this.sendBaseProto(37);
	}

	/**
	 * 组队副本房间信息变更
	 * 1-37
	 */
	public postFTRoomChange(bytes: GameByteArray): void {
		this.tfRoomID = bytes.readInt();
		let len: number = bytes.readByte();
		if (!this.tfMembers)
			this.tfMembers = [];

		this.tfMembers.length = len;
		this.isTFCaptain = false;

		let vo: TeamFuBenRoleVo;
		for (let i: number = 0; i < len; i++) {
			vo = this.tfMembers[i];
			if (!vo) {
				vo = new TeamFuBenRoleVo();
				this.tfMembers[i] = vo;
			}

			vo.parse(bytes);
			if (vo.roleID == Actor.actorID && vo.position == 1)
				this.isTFCaptain = true;
		}
	}

	/** 请求踢出玩家
	 * 1-38
	 * @param id 玩家ID
	 */
	public sendOutTFRoom(id: number): void {
		let bytes: GameByteArray = this.getBytes(38);
		bytes.writeInt(id);
		this.sendToServer(bytes);
	}

	/**
	 * 组队副本下发个人基础信息
	 * 1-38
	 *
	 */
	public postFTRoomPassInfo(bytes: GameByteArray): void {
		this.tfPassID = bytes.readInt();
		this._tfInviteTime = bytes.readInt();
	}

	/** 请求离开组队副本并继续
	 * 1-39
	 * @param type 0.退出创房间, 1.继续挑战
	 */
	public sendExitTFFb(type: number): void {
		let bytes: GameByteArray = this.getBytes(39);
		bytes.writeByte(type);
		this.sendToServer(bytes);
	}

	/**
	 * 组队副本结算
	 * 1-39
	 */
	private doTeamFuBenEnd(bytes: GameByteArray): void {
		let id: number = bytes.readInt();
		let result: number = bytes.readByte();
		let len: number = bytes.readByte();

		let list: TeamFuBenRoleVo[] = [];
		list.length = len;
		let vo: TeamFuBenRoleVo;
		for (let i: number = 0; i < len; i++) {
			vo = new TeamFuBenRoleVo();
			list[i] = vo;
			vo.roleID = bytes.readInt();
			vo.position = bytes.readByte();
			vo.roleName = bytes.readString();
			vo.job = bytes.readByte();
			vo.sex = bytes.readByte();
		}

		ViewManager.ins().open(TeamFbResultWin, id, result, list);
	}

	/**
	 * 下发复活倒计时
	 * 1-40
	 */
	private doTeamFuBenRelive(bytes: GameByteArray): void {
		UserBoss.ins().killerHandler = bytes.readDouble();
		UserBoss.ins().reliveTime = bytes.readInt();
		if (UserBoss.ins().reliveTime > 0) {
			UserBoss.ins().clearWorldBossList();
			ViewManager.ins().open(WorldBossBeKillWin);
		}
		else
			ViewManager.ins().close(WorldBossBeKillWin);
	}

	/**
	 * 请求组队副本通关排名
	 * 1-40
	 */
	public sendTFRank(): void {
		this.sendBaseProto(40);
	}

	/**
	 * 下发组队副本通关排名
	 * 1-41
	 *
	 */
	public postTeamFuBenRank(bytes: GameByteArray): void {
		this.tfPassRanks = [];
		let len: number = bytes.readByte();
		let vo: { configID: number, members: { position: number, roleName: string }[] };
		let subLen: number;
		for (let i: number = 0; i < len; i++) {
			vo = {configID: bytes.readInt(), members: []};
			subLen = bytes.readByte();
			for (let j: number = 0; j < subLen; j++)
				vo.members.push({
					position: bytes.readByte(),
					roleName: bytes.readString()
				});

			this.tfPassRanks.push(vo);
		}
	}

	/**
	 * 组队副本请求发鲜花
	 * 1-41
	 *
	 */
	public sendTfFlower(id: number,flowerId:number,count: number): void {
		let bytes: GameByteArray = this.getBytes(41);
		bytes.writeInt(id);
		bytes.writeInt(flowerId);
		bytes.writeInt(count);
		this.sendToServer(bytes);
	}

	/**
	 * 组队副本下发鲜花记录
	 * 1-42
	 */
	/** 组队副本鲜花记录 */
	public tfFlowerRecords: { roleName: string,id:number,count: number }[];
	public postTeamFbFlowarRecords(bytes: GameByteArray): void {
		let len: number = bytes.readInt();
		if (!this.tfFlowerRecords)
			this.tfFlowerRecords = [];

		for (let i: number = 0; i < len; i++){
			this.tfFlowerRecords.push({
				roleName: bytes.readString(),
				id:bytes.readInt(),
				count: bytes.readInt()
			});
		}

		while (this.tfFlowerRecords.length > 10)
			this.tfFlowerRecords.shift();
	}


	/**
	 * 组队副本下发鲜花全服播放
	 * 1-44
	 */
	public FlowerRecords: {sendRoleName:string, getRoleName: string,id:number,count: number }[];
	public postTeamFbFlowarRecords1(bytes: GameByteArray): void {
		if (this.FlowerRecords == null){
			this.FlowerRecords = [];
		}
		let  sendRoleName1 =bytes.readString();
		let  getRoleName1 = bytes.readString();
		let id1 = bytes.readInt();

		let config = GlobalConfig.FlowerConfig;
		let anim:number = 0;
		for(let j in config){
			if (id1 == config[j].id){
				anim = config[j].animation
			}
		}

		if(getRoleName1 != Actor.myName && (anim == 0 || anim == 1)) return;
		if(getRoleName1 == Actor.myName && anim == 0) return;

		let data :{sendRoleName:string, getRoleName: string,id:number,count: number} = {
			sendRoleName: sendRoleName1,
			getRoleName: getRoleName1,
			id:id1,
			count: bytes.readInt()
		}

		this.FlowerRecords.push(data);
	}

	/**
	 * 组队副本发送系统邀请
	 * 1-42
	 */
	public sendTfSysInvite(des: string): void {
		let bytes: GameByteArray = this.getBytes(42);
		bytes.writeString(des);
		this.sendToServer(bytes);
	}

	/**
	 * 组队副本系统邀请返回
	 * 1-43
	 */
	private teamFbSysInviteInfo(bytes: GameByteArray): void {
		Chat.ins().postSysChatMsg(new ChatSystemData(3, bytes.readString()));
	}

	/**
	 * 清空组队副本鲜花记录
	 */
	public clearTfFlowerRecords(): void {
		this.tfFlowerRecords = [];
	}

	public onShow():void{
		if (UserFb.ins().zuDuiRed == false){
			this.postOnHide();
		}
	}

	public postOnHide():void{
		//
	}
}

namespace GameSystem {
	export let  userfb = UserFb.ins.bind(UserFb);
}