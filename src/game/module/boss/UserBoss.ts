/**世界boss,全民boss */
class UserBoss extends BaseSystem {
	/**世界boss数据 */

	public worldBossLeftTime: number[] = []; //挑战世界BOSS剩余次数
	public worldChallengeTime: number[] = []; //BOSS挑战购买次数
	public worldBossCd: number[] = [];	     //挑战CD

	public worldBossLastWinner: any[] = [];

	public worldBossrestoreTime: any[] = [];
	public worldBossBelongTime: number[] = [];//挑战boss已活动归属次数

	public curShield: number = 0;
	public totalShield: number = 0;
	public shieldType: number = 0;

	public worldInfoList: WorldBossItemData[][] = [];      //世界BOSS信息列表
	public worldBossPlayList: WorldBossItemData[][] = [];	 //世界BOSS可进入列表

	public rankList: WorldBossRankItemData[] = [];
	/** BossBlood数据*/
	/** 怪物id */
	monsterID: number = 0;
	/** hp */
	hp: number = 0;
	bossHandler: number = 0;
	lastBossID: number = -1;

	rank: WorldBossRankItemData[] = [];
	changeAttr: number[] = [];

	/**全民boss 数据 */
	/** 剩余挑战次数 */
	public challengeCount: number = 0;
	/** 恢复时间+程序运行时间（毫秒，用于倒计时） */
	public restoreTime: number = 0;
	/** 今日获得灵魄 */
	public toDaySoul: number = 0;
	/** 剩余冷却N秒 */
	public cdTime: number = 0;
	/** boss提醒 */
	public bossRemind: number = 0;

	public bossInfo: PublicBossInfo[] = [];

	private tempID: number = 0;

	public isDoingTimer: boolean = false;

	/**是否自动清除复活cd */
	public autoClear: boolean[] = [false, false, false];

	/**是否提示复活消费*/
	public ShowTip: boolean = true;

	public static WB_BAG_ENOUGH: number = 50;

	public currBossSubType: number = 0;

	public currBossConfigID: number = 0;

	public newWorldBossData: NewWorldBossData = new NewWorldBossData();

	public static BOSS_SUBTYPE_WORLDBOSS = 1; 	//世界BOSS (试炼)
	public static BOSS_SUBTYPE_QMBOSS = 2;		//全民BOSS (野外)
	public static BOSS_SUBTYPE_HOMEBOSS = 3;	//VIP专属BOSS
	public static BOSS_SUBTYPE_SHENYU = 4;	//神域Boss
	public static BOSS_SUBTYPE_GODWEAPON = 5;	//神兵圣域
	public static BOSS_SUBTYPE_GODWEAPON_TOP = 6;	//神兵塔

	public bossId:number = 0;
	public dieId:number[]= [] ;//死亡bossid
	public fuhuoId:number[]= [] ;//复活bossid
	public bossAlertList: number[] = [];
	public activeList:number[] = []; 
	private yeBoss:any[]=[];
	private vipBoss:any[]=[];
	private recharge:number = 0;
	private list:number[]=[];

	public constructor() {
		super();
		// console.log("开始执行Boss控制器")
		this.sysId = PackageID.Boss;
		this.regNetMsg(10, this.postWorldBoss);
		this.regNetMsg(11, this.setShieldPer);

		this.regNetMsg(14, this.doClearCD);
		this.regNetMsg(16, this.postLottery);
		this.regNetMsg(17, this.doLotteryRan);
		this.regNetMsg(18, this.doLotteryResult);
		this.regNetMsg(20, this.doBossBlood);
		this.regNetMsg(21, this.postUpdatePerInfo);
		this.regNetMsg(7, this.doBelongChange);
		this.regNetMsg(23, this.postAttackList);

		this.regNetMsg(24, this.doKillNotice);
		this.regNetMsg(25, this.postRemainTime);
		this.regNetMsg(26, this.postWorldBossEndTime);
		this.regNetMsg(27, this.postWorldNotice);
		this.regNetMsg(28, this.postChallageRank);
		this.regNetMsg(29, this.doBossChallengeResult);
		this.regNetMsg(30, this.doBossSetting);
		this.regNetMsg(31, this.postNewBossResult);
		this.regNetMsg(32, this.postNewBossInfo);
		this.regNetMsg(33, this.postNewBossReliveTime);
		this.regNetMsg(34, this.postNewBossOpen);
		this.regNetMsg(35, this.postAddAttrNum);
		this.regNetMsg(36, this.postNewBossRank);
		this.regNetMsg(37, this.postBossDieNotice);
		this.regNetMsg(39, this.doBossAutoFigh);

		this.recharge = Recharge.ins().leftTime;
		this.observe(GameLogic.ins().postEnterMap, this.checkShow);
		this.observe(GameLogic.ins().postHpChange, this.checkOpenBossBlood);
		this.observe(GameLogic.ins().postRemoveEntity, this.checkRemoveEntity);

		this.observe(UserZs.ins().postZsLv, this.postUpdateWorldPlayList);
		this.observe(Actor.ins().postLevelChange, this.postUpdateWorldPlayList);
		this.observe(Recharge.ins().postFranchiseInfo,this.UpdataRecharge);
		this.TimeManager();
	}

	public static ins(): UserBoss {
		return super.ins() as UserBoss;
	}

	protected initLogin() {
		this.init();
	}

	private checkOpenBossBlood([target, value]: [CharMonster, number]) {
		let monsterID: number = target.infoModel.configID;

		if (!monsterID || monsterID != this.monsterID) return;

		if (GameMap.fbType == UserFb.FB_TYPE_ZHUANSHENGBOSS) return;
		if (GameMap.fbType == UserFb.FB_TYPE_ALLHUMENBOSS) return;
		if (GameMap.fbType == UserFb.FB_TYPE_HOMEBOSS) return;
		if (GameMap.fbType == UserFb.FB_TYPE_NEW_WORLD_BOSS) return;
		if (GameMap.fbType == UserFb.FB_TYPE_GUIDEBOSS && GameMap.fubenID == 40000) return;

		this.hp = value;
		let config: MonstersConfig = GlobalConfig.MonstersConfig[UserBoss.ins().monsterID];
		value > 0 && value < config.hp ? ViewManager.ins().open(BossBloodPanel) : ViewManager.ins().close(BossBloodPanel);
	}

	/** 派发全民boss列表数据 */
	public postListData(): void {
	}

	public postHpChange(): void {
	}


	/**派发boss数据更新*/
	public postBossData(isShow: boolean, name: string = "", viewIndex: number = 0, headImage: string = ""): any {
		return [isShow, name, viewIndex, headImage];
	}


	/**
	 * 请求世界boss数据初始化&更新
	 * 10-10
	 */
	public sendWorldBossInfo(id: number): void {
		// this.sendToServer(this.getBytes(10));   //暂时注释
		// bytes.writeInt(id);
		let bytes: GameByteArray = this.getBytes(10);
		bytes.writeInt(id);
		this.sendToServer(bytes);
	}

	/**
	 * 世界boss数据初始化&更新
	 * 10-10
	 * @param bytes
	 */ 
	public postWorldBoss(bytes: GameByteArray): number {
		let type = bytes.readByte();
		this.worldInfoList[type] = this.worldInfoList[type] || [];
		
		this.worldBossPlayList[type] = [];
		this.worldBossrestoreTime[type] = [];
		this.worldBossCd[type] = bytes.readShort() * 1000 + egret.getTimer();
		this.worldBossLeftTime[type] = bytes.readShort();
		let count = bytes.readShort();
		
		this.worldInfoList[type].length = count;
		
		for (let i = 0; i < count; i++) {
			let bossInfoData: WorldBossItemData = this.worldInfoList[type][i] || new WorldBossItemData;
			bossInfoData.parser(bytes);
			this.worldInfoList[type][i] = bossInfoData;
		}
		
		this.worldBossrestoreTime[type] = bytes.readShort() * 1000 + egret.getTimer();
		this.worldChallengeTime[type] = bytes.readShort();
		this.worldBossBelongTime[type] = bytes.readShort();
		this.updateBossPlayList(type);
		return type;
	}

	public updateBossPlayList(type: number) {
		let tempArr = UserBoss.ins().worldInfoList[type].slice()
		for (let k in tempArr) {
			let bossConfig: WorldBossConfig = GlobalConfig.WorldBossConfig[tempArr[k].id];
			if (!bossConfig) continue;
			if (type == UserBoss.BOSS_SUBTYPE_QMBOSS) {
				if (bossConfig && (UserZs.ins().lv >= bossConfig.zsLevel && Actor.level >= bossConfig.level)) {
					this.worldBossPlayList[type].push(tempArr[k]);
				}
			}
			else if (type == UserBoss.BOSS_SUBTYPE_WORLDBOSS) {
				if (bossConfig && (bossConfig.zslook.indexOf(UserZs.ins().lv) != -1 && Actor.level >= bossConfig.level)) {
					this.worldBossPlayList[type].push(tempArr[k]);
				}
			}
			else if (type == UserBoss.BOSS_SUBTYPE_HOMEBOSS) {
				let levelConfig: BossHomeConfig;
				for (let j in GlobalConfig.BossHomeConfig) {
					if (GlobalConfig.BossHomeConfig[j].boss.lastIndexOf(tempArr[k].id) != -1) {
						levelConfig = GlobalConfig.BossHomeConfig[j];
						break;
					}
				}
				if (levelConfig && UserVip.ins().lv >= levelConfig.vip && UserZs.ins().lv >= bossConfig.zsLevel && Actor.level >= bossConfig.level) {
					this.worldBossPlayList[type].push(tempArr[k]);
				}
			}
			else if (type == UserBoss.BOSS_SUBTYPE_SHENYU) {
				if (bossConfig && (UserZs.ins().lv >= bossConfig.zsLevel && Actor.level >= bossConfig.level)) {
					this.worldBossPlayList[type].push(tempArr[k]);
				}
			}
			else if (type == UserBoss.BOSS_SUBTYPE_GODWEAPON || type == UserBoss.BOSS_SUBTYPE_GODWEAPON_TOP) {
				if (tempArr[k].canInto)
					this.worldBossPlayList[type].push(tempArr[k]);
			}
		}
	}

	public postUpdateWorldPlayList() {
		for (var t in this.worldInfoList) {
			let _type = +t;
			this.worldBossPlayList[_type] = [];
			this.updateBossPlayList(_type);
		}
	}

	/**
	 * 处理boss护盾百分比
	 * 10-11
	 * @param bytes
	 */
	public setShieldPer(bytes: GameByteArray): void {
		this.shieldType = bytes.readByte();
		this.curShield = bytes.readInt();
		this.totalShield = bytes.readInt();
		let boo: number = bytes.readByte();
		let showNotice: boolean = (this.curShield == this.totalShield);
		if (showNotice) {
			if (boo) {
				UserTips.ins().showSceneTips(`|C:${0xFFDE1C}&T:BOSS开启护盾，击破护盾开启抽奖获得幸运奖励|`);
			} else {
				UserTips.ins().showSceneTips(`|C:${0xFFDE1C}&T:BOSS开启护盾，期间BOSS不会减少血量|`);
			}
		}
		this.postShieldPer();
	}

	public postShieldPer(): void {

	}

	/**
	 * 请求世界boss清除CD
	 * 10-14
	 */
	public sendClearCD(): void {
		//引导副本复活
		if (GameMap.fbType == UserFb.FB_TYPE_GUIDEBOSS) {
			UserFb.ins().sendGuideFbAlive();
		}
		else if (GameMap.fbType == UserFb.FB_TYPE_CITY)
			CityCC.ins().sendRevival();
		else if (GameMap.fbType == UserFb.FB_TYPE_HEFUBOSS)
			HefuBossCC.ins().sendRevival();
		else if (GameMap.fubenID == GlobalConfig.CampBattleConfig.fbId)
			BattleCC.ins().sendReLive();
		else if (GameMap.fubenID == GlobalConfig.PassionPointConfig.fbId)
			PaoDianCC.ins().sendReLive();
		else if (GameMap.fbType == UserFb.FB_TYPE_NEW_WORLD_BOSS) {
			this.sendNewBossBuyRelive();
		}
		else {
			this.sendToServer(this.getBytes(14));
		}
	}

	/**
	 * 处理世界boss清除CD
	 * 10-14
	 */
	private doClearCD(bytes: GameByteArray): void {
		UserTips.ins().showTips(bytes.readByte() ? '成功清除挑战CD' : 'CD已结束，直接参与挑战');
	}

	/**
	 * 请求世界boss挑战
	 * 10-15
	 */
	public sendChallengWorldBoss(id: number, type: number): void {
		this.list.push(id);
		if (this.list.length<=1){
			this.currBossSubType = type;
			this.currBossConfigID = id;
			let bytes: GameByteArray = this.getBytes(15);
			bytes.writeInt(id);
			// console.warn("发送",id)
			this.sendToServer(bytes);
		}

		this.list = [];
	}


	public worldPrize: number = 0;

	/**
	 * 世界boss开始抽奖
	 * 10-16
	 */
	private postLottery(bytes: GameByteArray) {
		this.worldPrize = bytes.readInt();
		ViewManager.ins().open(WorldBossJiangLiWin);
	}


	/**
	 * 世界boss参与抽奖
	 * 10-17
	 */
	public sendJoinLottery(): void {
		this.sendBaseProto(17);
	}

	/**
	 * 世界boss开始抽奖
	 * 10-17
	 */
	public doLotteryRan(bytes: GameByteArray): void {
		let ran: number = bytes.readShort();
		this.postLotteryRan(ran);
	}

	public postLotteryRan(n: number) {
		return n;
	}

	/**
	 * 查看挑战记录
	 * 10-28
	 */
	public sendChallengRank(id: number): void {
		this.currBossSubType = id;
		let bytes: GameByteArray = this.getBytes(28);
		bytes.writeInt(id);
		this.sendToServer(bytes);
	}

	/**
	 * 世界boss抽奖结果
	 * 10-18
	 */
	public doLotteryResult(bytes: GameByteArray) {
		let name: string = bytes.readString();
		let ranPoint: number = bytes.readShort();
		this.postLotteryResult(name, ranPoint)
	}

	public postLotteryResult(str: string, n: number) {
		return [str, n]
	}


	/**
	 * 处理boss血条面板的信息
	 * 10-20
	 * @param bytes
	 */
	private doBossBlood(bytes: GameByteArray): void {
		this.monsterID = bytes.readInt();
		this.hp = bytes.readDouble();

		if (this.hp && this.monsterID != this.lastBossID) {
			//材料副本、经验副本和通天塔不弹
			if (GameMap.fbType != UserFb.FB_TYPE_MATERIAL && GameMap.fbType != UserFb.FB_TYPE_TIAOZHAN && GameMap.fbType != UserFb.FB_TYPE_EXP && GameMap.fbType != UserFb.FB_TYPE_GUIDEBOSS && GameMap.fbType != UserFb.FB_TYPE_GUANQIABOSS) {
				this.postBossAppear();
			}
		}
		this.lastBossID = this.monsterID;

		if (this.hp <= 0) {
			this.lastBossID = -1;
		}

		this.bossHandler = bytes.readDouble();
		let handler = bytes.readDouble();//boss正在攻击的目标handle

		let count: number = bytes.readShort();
		this.rank.length = count;
		// egret.log("10-20");
		for (let i = 0; i < count; i++) {
			this.rank[i] = this.rank[i] || new WorldBossRankItemData();
			this.rank[i].parser(bytes);
			this.rank[i].rank = i + 1;
		}
		this.postHpChange();
		if (GameMap.fbType != UserFb.FB_TYPE_ZHUANSHENGBOSS
			&& GameMap.fbType != UserFb.FB_TYPE_ALLHUMENBOSS
			&& GameMap.fbType != UserFb.FB_TYPE_HOMEBOSS
			&& (GameMap.fbType == UserFb.FB_TYPE_GUIDEBOSS && GameMap.fubenID == 40001)) {
			ViewManager.ins().open(BossBloodPanel);
		}
		if (!this.hp || (this.hp <= 0 && GuildWar.ins().getModel().checkinAppoint(1))) {
			ViewManager.ins().close(BossBloodPanel);
		}
	}

	public postBossAppear() {
		return this.monsterID;
	}

	//boss死亡或消失
	public postBossDisappear(entity) {
		this.bossHandler = 0;
		return entity;
	}

	/**
	 * 世界boss更新跟人信息
	 * 10-21
	 */
	public postUpdatePerInfo(bytes: GameByteArray): any[] {
		this.worldBossCd[this.currBossSubType] = bytes.readShort() * 1000 + egret.getTimer();
		this.worldBossLeftTime[this.currBossSubType] = bytes.readShort();
		return [this.worldBossCd, this.worldBossLeftTime];
	}


	/**
	 * 世界boss所属变更
	 * 10-7
	 */
	private doBelongChange(bytes: GameByteArray) {
		let handle = bytes.readDouble();
		let oldHandle = bytes.readDouble();
		let oldName = bytes.readString();
		this.postBelongChange(handle, oldHandle, oldName);
	}

	public postBelongChange(handle, oldHandle = 0, oldName = '') {
		UserBoss.ins().changecanPlayList(handle);
		this.attHandle = handle;
		EntityManager.ins().showHideSomeOne(handle);
		// this.postHasAttackChange(1);
		if (handle > 0) {
			let belongHandel: CharRole[] = EntityManager.ins().getMasterList(handle);
			let belongName: string = "";
			if (belongHandel && belongHandel[0] && belongHandel[0].infoModel) {
				belongName = belongHandel[0].infoModel.name;
				this.setBelongHPandColor();
			} else {
				return;
			}
			let str: string = "";
			if (handle > 0 && oldHandle > 0) {
				let btname: string = belongName;
				let strlist = btname.split("\n");
				if (strlist[1])
					btname = strlist[1];
				else
					btname = strlist[0];

				let tname: string = oldName;
				strlist = tname.split("\n");
				if (strlist[1])
					tname = strlist[1];
				else
					tname = strlist[0];


				tname = StringUtils.replaceStr(tname, "0xffffff", ColorUtil.ROLENAME_COLOR_GREEN + "");
				str = `|C:${ColorUtil.ROLENAME_COLOR_GREEN}&T:${btname}|击败了|C:${ColorUtil.ROLENAME_COLOR_GREEN}&T:${tname}|，成为了新的归属者。`
				UserTips.ins().showSceneTips(str);
			} else {
				if (handle > 0 && belongName != "") {
					// str = `|C:${ColorUtil.ROLENAME_COLOR_GREEN}&T:${belongName}|成为了新的归属者。`;
					// UserTips.ins().showSceneTips(str);
				}
			}
		}
	}

	/**
	 * 攻击列表
	 * 10-23
	 */
	private postAttackList(bytes: GameByteArray) {
		let count: number = bytes.readUnsignedInt();
		this.weixieList = [];
		let boo: boolean = false;
		for (let i: number = 0; i < count; i++) {
			let handle = bytes.readDouble();
			UserBoss.ins().changeWeiXieList(handle);
			if (!boo && GameLogic.ins().currAttackHandle == handle) {
				boo = true;
			}
		}
		this.postHasAttackChange(0);
	}


	/**
	 * boss场景连杀公告
	 * 10-24
	 */
	private doKillNotice(bytes: GameByteArray) {
		let name: string = bytes.readString();
		let killNum: number = bytes.readShort();
		let ID: number = bytes.readShort();

		let str: string = GlobalConfig.WorldBossKillMsgConfig[ID].msg;
		str = StringUtils.substitute(str, name, killNum);
		UserTips.ins().showSceneTips(str);
	}


	//复活剩余的cd时间
	private _reliveTime: number = 0;

	public killerHandler: number = 0;

	/**
	 * BOSS复活时间
	 * 10-25
	 */
	public postRemainTime(bytes: GameByteArray): void {
		this.reliveTime = bytes.readShort();
		this.killerHandler = bytes.readDouble();

		if (this.reliveTime > 0) {
			this.clearWorldBossList();
		}
		// else
		// {
		// 	this.setBelongHPandColor();
		// }
		// UserTips.ins().showTips("你被击败，请等待复活");
	}

	private setBelongHPandColor(): void {
		if (this.attHandle != Actor.handle) {
			let belongHandel: CharRole[] = EntityManager.ins().getMasterList(this.attHandle);
			for (let k in belongHandel) {
				if (!(belongHandel[k] instanceof CharRole)) continue;
				belongHandel[k].setNameTxtColor(ColorUtil.ROLENAME_COLOR_YELLOW);
			}
		}
	}


	/**
	 * BOSS胜利结算
	 * 10-26
	 */
	public winner: string = "";
	public worldBossEndTime: number;

	public postWorldBossEndTime(bytes: GameByteArray): void {
		this.winner = bytes.readString();
		let remainTime = 60000;
		if (GwBoss.ins().isGwBoss)
			remainTime = 30000;
		this.worldBossEndTime = egret.getTimer() + remainTime;
		this.clearWorldBossList();
	}

	private UpdataDieList():void{
		for (let i = 0 ; i < this.fuhuoId.length; i++){
			for (let j = 0 ; j < this.dieId.length; j++){
				if (this.fuhuoId[i] == this.dieId[j]){
					this.dieId.splice(j,1);
				}
			}
		}
	}

	/**
	 * 通知BOSS复活
	 * 10-27
	 */
	// public postWorldNotice(id: number): void {

	private  lunBoss = [75,76,77,78,79,80,81,82,83,84,85,86];
	public postWorldNotice(bytes: GameByteArray): void {
		let type: number = bytes.readByte();
		let id: number = bytes.readInt();
		if(this.fuhuoId.indexOf(id) == -1)  this.fuhuoId.push(id);
		
		this.UpdataDieList();

		let lv: number = Actor.level;
		let zslv: number = UserZs.ins().lv;
		let samsaraLv:number = (SamsaraModel.ins().samsaraInfo!=undefined)?SamsaraModel.ins().samsaraInfo.lv:0;
		if (type == UserBoss.BOSS_SUBTYPE_QMBOSS) {
			let tempArr = UserBoss.ins().worldInfoList[type];
			for (let k in tempArr) {
				let config: WorldBossConfig = GlobalConfig.WorldBossConfig[id];
				if (tempArr[k].id == id && this.getBossRemindByIndex(id,1) && zslv >= config.zsLevel && lv >= config.level) {
					let bossBaseConfig: MonstersConfig = GlobalConfig.MonstersConfig[config.bossId];
					tempArr[k].hp = 100;
					tempArr[k].bossState = 1;

					let playList = this.worldBossPlayList[type];
					for (let j in playList) {
						if (playList[j] && playList[j].id == id) {
							playList[j].hp = 100;
							playList[j].bossState = 1;
							break;
						}
					}
					let str: string = `|C:0xfee900&T:BOSS||C:0xfe4444&T:${bossBaseConfig.name}||C:0xfee900&T:出现在||C:0x16b2ff&T:野外BOSS！|`;

					Chat.ins().postSysChatMsg(new ChatSystemData(3, str));

					if (UserBoss.ins().worldBossLeftTime[type]) {
						if (this.lunBoss.indexOf(id) >= 0 && samsaraLv < config.samsaraLv)  return;
						this.postBossData(true, bossBaseConfig.name, 1, bossBaseConfig.head);
					}
					break;
				}
			}
		} else if (type == UserBoss.BOSS_SUBTYPE_HOMEBOSS) {
			let config: WorldBossConfig = GlobalConfig.WorldBossConfig[id];
			let bossBaseConfig: BossHomeConfig = GlobalConfig.BossHomeConfig[id];
			if (bossBaseConfig && zslv >= config.zsLevel && lv >= config.level && UserVip.ins().lv >= bossBaseConfig.vip) {
				let tempArr = UserBoss.ins().worldInfoList[type];
				let playList = this.worldBossPlayList[type];
				let layerId = bossBaseConfig.boss;
				for (let k in tempArr) {
					if (layerId.lastIndexOf(tempArr[k].id) != -1) {
						tempArr[k].hp = 100;
						tempArr[k].bossState = 1;
					}
				}

				for (let j in playList) {
					if (layerId.lastIndexOf(playList[j].id) != -1) {
						playList[j].hp = 100;
						playList[j].bossState = 1;
					}
				}
				let str: string = `|C:0xfee900&T:VIP专属BOSS${id}层所有BOSS刷新了，这里的BOSS太多了，简直就是打宝天堂|`;
				Chat.ins().postSysChatMsg(new ChatSystemData(3, str));

				if (UserBoss.ins().worldBossLeftTime[type]) {
					this.postBossData(true, `VIPBOSS`, 4);
				}
			}
		} else if (type == UserBoss.BOSS_SUBTYPE_SHENYU) {
			let tempArr = UserBoss.ins().worldInfoList[type];
			for (let k in tempArr) {
				let config: WorldBossConfig = GlobalConfig.WorldBossConfig[id];
				if (tempArr[k].id == id && this.getBossRemindByIndex(id,1) && zslv >= config.zsLevel && lv >= config.level) {
					let bossBaseConfig: MonstersConfig = GlobalConfig.MonstersConfig[config.bossId];
					tempArr[k].hp = 100;
					tempArr[k].bossState = 1;

					let playList = this.worldBossPlayList[type];
					for (let j in playList) {
						if (playList[j] && playList[j].id == id) {
							playList[j].hp = 100;
							playList[j].bossState = 1;
							break;
						}
					}
					let str: string = `|C:0xfee900&T:BOSS||C:0xfe4444&T:${bossBaseConfig.name}||C:0xfee900&T:出现在||C:0x16b2ff&T:神域BOSS！|`;

					Chat.ins().postSysChatMsg(new ChatSystemData(3, str));

					if (UserBoss.ins().worldBossLeftTime[type]) {
						this.postBossData(true, bossBaseConfig.name, 3, bossBaseConfig.head);
					}
					break;
				}
			}
		} else if (type == UserBoss.BOSS_SUBTYPE_GODWEAPON || type == UserBoss.BOSS_SUBTYPE_GODWEAPON_TOP) {
			let tempArr = UserBoss.ins().worldInfoList[type];
			for (let k in tempArr) {
				let config: WorldBossConfig = GlobalConfig.WorldBossConfig[id];
				if (tempArr[k].id == id) {
					let bossBaseConfig: MonstersConfig = GlobalConfig.MonstersConfig[config.bossId];
					tempArr[k].hp = 100;
					tempArr[k].bossState = 1;

					let playList = this.worldBossPlayList[type];
					for (let j in playList) {
						if (playList[j] && playList[j].id == id) {
							playList[j].hp = 100;
							playList[j].bossState = 1;
							break;
						}
					}
					break;
				}
			}
		}

	}


	/**
	 * BOSS挑战记录
	 * 10-28
	 */
	public postChallageRank(bytes: GameByteArray): any {
		let id: number = bytes.readInt();
		let count: number = bytes.readByte();
		let datas: string[][] = []
		let tNum: number;
		for (let i = 0; i < count; i++) {
			datas[i] = [];
			tNum = bytes.readInt();
			datas[i][0] = DateUtils.getFormatBySecond(DateUtils.formatMiniDateTime(tNum) / 1000, 6);
			datas[i][1] = bytes.readString();
			datas[i][2] = bytes.readDouble().toString();
			datas[i][3] = 1 + "";//增加一个长度区别显示，在WildBossJoinItem类下使用
		}
		datas.reverse();
		return [id, datas];
	}

	/**
	 * BOSS结算
	 * 10-29
	 */
	public doBossChallengeResult(bytes: GameByteArray): void {
		let isBelong: number = bytes.readByte();
		let belongName = bytes.readString();
		let job: number = bytes.readByte();
		let sex: number = bytes.readByte();
		let count: number = bytes.readShort();
		let myReward: RewardData[] = [];
		for (let i: number = 0; i < count; i++) {
			myReward[i] = new RewardData;
			myReward[i].parser(bytes);
		}

		// let belongHandel: CharRole = EntityManager.ins().getMasterList(this.attHandle)[0];
		// let belongRoleInfo: Role = <Role>belongHandel.infoModel;
		// let belongImg: string = `yuanhead${belongRoleInfo.job}${belongRoleInfo.sex}`;
		// let belongImg: string = `yuanhead${job}${sex}`;
		let belongImg: string = `main_role_head${job}`
		// ViewManager.ins().open(ResultWin, true, myReward, "", null, [isBelong, belongName, belongImg]);
		ResultManager.ins().create(GameMap.fbType, true, myReward, "", null, [isBelong, belongName, belongImg]);

	}

	public setBossSetting(id: number): void {
		let index: number = this.bossAlertList.indexOf(id);
		if (index != -1) {
			this.bossAlertList.splice(index, 1);
		} else {
			this.bossAlertList.push(id)
		}
	}

	/**
	 * 世界boss_发送boss提醒设置
	 * 10-29
	 */
	public sendBossSetting() {
		let len: number = this.bossAlertList ? this.bossAlertList.length : 0;
		let bytes: GameByteArray = this.getBytes(29);
		bytes.writeShort(len);
		for (let i: number = 0; i < len; i++) {
			bytes.writeShort(this.bossAlertList[i]);
		}
		this.sendToServer(bytes);
	}

	/**
	 * 世界boss_下发boss提醒设置
	 * 10-30
	 */
	public doBossSetting(bytes: GameByteArray): void {
		this.bossAlertList = []
		let count = bytes.readShort();
		for (let i: number = 0; i < count; i++) {
			let id: number = bytes.readShort();
			this.bossAlertList.push(id);
		}
	}

	public getBossRemindByIndex(id: number,type:number): boolean {
		if (type == 1){
			return (this.bossAlertList.indexOf(id) != -1);
		} else if (type == 2){
			return (this.activeList.indexOf(id) != -1);
		}
	}

	public setBossAutoFigh(id: number): void {
		let index1: number = this.activeList.indexOf(id);
		if (index1 != -1) {
			this.activeList.splice(index1, 1);
		} else {
			this.activeList.push(id)
		}
	}

	/**
	 * 世界boss_发送boss自动挑战设置
	 * 10-39
	 */
	public sendBossAutoFigh() {
		let len: number = this.activeList ? this.activeList.length : 0;
		let bytes: GameByteArray = this.getBytes(39);
		bytes.writeShort(len);
		for (let i: number = 0; i < len; i++) {
			bytes.writeShort(this.activeList[i]);
		}
		this.sendToServer(bytes);
	}

	/**
	 * 取消归属
	 * 10-35
	 */
	public sendCleanBelong() {
		this.sendBaseProto(35);
	}

	/**
	 * 世界boss_收到boss自动挑战设置
	 * 10-39
	 */
	public doBossAutoFigh(bytes: GameByteArray): void {
		this.activeList = [];
		let count = bytes.readShort();
		for (let i: number = 0; i < count; i++) {
			let id: number = bytes.readShort();
			this.activeList.push(id);
		}
		
		for (let i = 0; i < this.activeList.length; i++){
			for (let j = i; j < this.activeList.length; j++){
				if (this.activeList[i]<this.activeList[j]){
					let num = this.activeList[j]
					this.activeList[j] = this.activeList[i];
					this.activeList[i] = num;
				}
			}
		}
	}

	private UpdataRecharge():void{
		this.recharge = Recharge.ins().leftTime;
		this.TimeManager();
	}

	private TimeManager():void{
		let view: PlayFunView = (ViewManager.ins().getView(PlayFunView) as PlayFunView);
		// console.warn(view!=undefined)
		if (view!=undefined){
			if (this.worldInfoList.length == 7 && this.recharge>0 && view.autoPkBoss.selected == false && UserFb.ins().checkInFB() == false){
				TimerManager.ins().doTimer(15000,0,this.checkAutoFigh,this)
			}
		}
	}

	private UpGrade():void{
		for (let i = 0; i < this.dieId.length; i++){
			for(let m = 0; m < this.yeBoss.length; m++){
				if (this.yeBoss[m].id != undefined){
					if (this.dieId[i] == this.yeBoss[m].id){
						this.yeBoss[m].bossState = 2;
					}
				}
			}

			for(let k = 0; k < this.vipBoss.length; k++){
				if (this.vipBoss[k].id != undefined){
					if (this.dieId[i] == this.vipBoss[k].id){
						this.vipBoss[k].bossState = 2;
					}
				}
			}
		}

		for (let i = 0; i < this.fuhuoId.length; i++){
			for(let m = 0; m < this.yeBoss.length; m++){
				if (this.yeBoss[m].id !=undefined){
					if (this.fuhuoId[i] == this.yeBoss[m].id){
						this.yeBoss[m].bossState = 1;
					}
				}
			}

			for(let k = 0; k < this.vipBoss.length; k++){
				if (this.vipBoss[k].id !=undefined){
					if (this.fuhuoId[i] == this.vipBoss[k].id){
						this.vipBoss[k].bossState = 1;
					}
				}
			}
		}
	}

	public checkAutoFigh():void{
		// console.log("每十秒执行一次")
		this.yeBoss = this.worldInfoList[2];
		this.vipBoss = this.worldInfoList[3];
		if (this.yeBoss.length == 0 && this.vipBoss.length == 0){
			console.warn("暂不处理")
		}else {
			this.UpGrade();
		}
		this.list = [];

		// console.warn("死亡列表："+this.dieId,"复活列表:"+this.fuhuoId)
		if (GameMap.fubenID == 0  && this.activeList.length>0){
			for(let i = 0; i < this.activeList.length; i++){
				for(let j = 0;j < this.vipBoss.length; j++){
					if (this.activeList[i] == this.vipBoss[j].id && this.vipBoss[j].bossState == 1){
						if (this.dieId.length>0){
							if (this.dieId.indexOf(this.vipBoss[j].id) == -1){
								this.sendChallengWorldBoss(this.vipBoss[j].id, UserBoss.BOSS_SUBTYPE_HOMEBOSS)
							} else if (this.dieId.indexOf(this.vipBoss[j].id) == 0 && this.fuhuoId.indexOf(this.vipBoss[j].id) == 0){
								this.sendChallengWorldBoss(this.vipBoss[j].id, UserBoss.BOSS_SUBTYPE_HOMEBOSS)
							}
						} else {
							this.sendChallengWorldBoss(this.vipBoss[j].id, UserBoss.BOSS_SUBTYPE_HOMEBOSS)
						}
					}
				}
			}
	
			let count = this.worldBossLeftTime[2];
			for(let i = 0; i < this.activeList.length; i++){
				for(let j = 0;j < this.yeBoss.length; j++){
					if (this.activeList[i] == this.yeBoss[j].id && this.yeBoss[j].bossState == 1 && count>0){
						if (this.dieId.length>0){
							if (this.dieId.indexOf(this.yeBoss[j].id) == -1){
								this.sendChallengWorldBoss(this.yeBoss[j].id, UserBoss.BOSS_SUBTYPE_QMBOSS)
							} else if (this.dieId.indexOf(this.yeBoss[j].id) == 0 && this.fuhuoId.indexOf(this.yeBoss[j].id) == 0){
								this.sendChallengWorldBoss(this.yeBoss[j].id, UserBoss.BOSS_SUBTYPE_QMBOSS)
							} 
						} else {
							this.sendChallengWorldBoss(this.yeBoss[j].id, UserBoss.BOSS_SUBTYPE_QMBOSS)
						}
					}
				}
			}
		}
	}

	public checkNewWorldBossOpen() {
		return Actor.level >= GlobalConfig.NewWorldBossBaseConfig.openLv;
	}

	/**
	 * 10-31
	 * 请求进入新世界boss副本
	 */
	public sendIntoNewBoss() {
		this.sendBaseProto(31);
	}

	/**
	 * 10-31
	 * 新世界boss 下发副本结果
	 * @param bytes
	 */
	public postNewBossResult(bytes: GameByteArray): void {
		this.newWorldBossData.isKill = !!bytes.readByte();
		this.newWorldBossData.rank = bytes.readInt();

		this.newWorldBossData.lastKillRoleName = bytes.readString();
		this.newWorldBossData.randomRoleName = bytes.readString();

		this.newWorldBossData.totalTime = bytes.readInt();

		this.newWorldBossData.randomAwards = [];
		let len = bytes.readShort();
		for (let i = 0; i < len; i++) {
			this.newWorldBossData.randomAwards[i] = new RewardData();
			this.newWorldBossData.randomAwards[i].parser(bytes);
		}

		// ViewManager.ins().open(ResultWin, 1);
		ResultManager.ins().create(GameMap.fbType, 1);
	}

	/**
	 * 10-32
	 * 请求新世界boss信息
	 */
	public sendGetNewBossInfo() {
		this.sendBaseProto(32);
	}

	/**
	 * 10-32
	 * 新世界boss信息
	 * @param bytes
	 */
	public postNewBossInfo(bytes: GameByteArray): void {
		this.newWorldBossData.bossID = bytes.readInt();
		this.newWorldBossData.curHp = bytes.readDouble();
	}

	/**
	 * 10-33
	 * 购买世界boss复活
	 */
	public sendNewBossBuyRelive() {
		this.sendBaseProto(33);
	}

	/**
	 * 10-33
	 * 新世界boss复活cd时间
	 * @param bytes
	 */
	public postNewBossReliveTime(bytes: GameByteArray): void {
		this.reliveTime = bytes.readShort();
		// this.newWorldBossData.reliveCD = egret.getTimer()+cd*1000;
	}

	/**
	 * 10-34
	 * 新世界boss信息
	 * @param bytes
	 */
	public postNewBossOpen(bytes: GameByteArray): void {
		this.newWorldBossData.isOpen = !!(bytes.readByte());
		this.newWorldBossData.startTime = bytes.readInt();
		if (this.newWorldBossData.startTime) {
			this.newWorldBossData.startTime = DateUtils.formatMiniDateTime(this.newWorldBossData.startTime);
		}
	}

	/**
	 * 10-35
	 * 新世界boss鼓舞次数
	 */
	public postAddAttrNum(bytes: GameByteArray) {
		this.newWorldBossData.addAttrNum = bytes.readShort();
	}

	/**
	 * 10-36
	 * 新世界boss排行榜数据
	 * @param bytes
	 */
	public postNewBossRank(bytes: GameByteArray) {
		let len = bytes.readShort();
		if (this.newWorldBossData.rankList == null) {
			this.newWorldBossData.rankList = [];
		}
		this.newWorldBossData.rankList.length = len;
		for (let i = 0; i < len; i++) {
			this.newWorldBossData.rankList[i] = this.newWorldBossData.rankList[i] || new NewWorldBossRankData();
			this.newWorldBossData.rankList[i].parser(bytes);
		}

		this.newWorldBossData.rankList.sort(this.sortNewBossRank);
	}

	private sortNewBossRank(a, b): number {
		if (a.value > b.value)
			return -1;
		return 1;
	}

	/**
	 * 通知boss被击杀死亡
	 * 10-37
	 */

	public postBossDieNotice(bytes: GameByteArray): void {
		this.bossId = bytes.readInt();
		if (this.dieId.indexOf(this.bossId) == -1)  this.dieId.push(this.bossId)
		// console.warn("死亡id:"+this.bossId,"死亡列表："+this.dieId)
		//boss被击杀，则关闭冒泡提示
		let config: WorldBossConfig = GlobalConfig.WorldBossConfig[this.bossId];
		if (!config) return;//找不到对应的boss配置，则跳出，不做关闭提示处理，防止异常报错
		switch (config.type) {
			case UserBoss.BOSS_SUBTYPE_WORLDBOSS://试炼
			case UserBoss.BOSS_SUBTYPE_QMBOSS://野外
				let bossBaseConfig: MonstersConfig = GlobalConfig.MonstersConfig[config.bossId];
				UserBoss.ins().postBossData(false, bossBaseConfig.name);
				//重新刷新列表处理红点
				this.sendWorldBossInfo(config.type);
				break;
			case UserBoss.BOSS_SUBTYPE_HOMEBOSS://VIP专属BOSS
				UserBoss.ins().postBossData(false, `VIP专属BOSS`);
				//重新刷新列表处理红点
				this.sendWorldBossInfo(config.type);
				break;
		}
	}


	/**
	 * 请求购买挑战次数
	 * 10-30
	 */
	public sendBuyChallengeTimes(type: number) {
		let bytes: GameByteArray = this.getBytes(30);
		bytes.writeByte(type);
		this.sendToServer(bytes);
	}

	/**
	 * 新请求购买鼓舞次数
	 * 10-34
	 */
	public sendBuyAddAttrNum() {
		this.sendBaseProto(34);
	}

	/**
	 * 界boss_boss应该攻击的归属者角色handle
	 * .
	 */
	// public doBossTargetChange(bytes: GameByteArray): void {
	// 	this.handler = bytes.readDouble();
	// }

	public checkWorldBossMoney(): boolean {
		return Actor.yb >= this.checkWorldBossNeed();
	}

	public checkWorldBossNeed(): number {
		if (GameMap.fbType == UserFb.FB_TYPE_GUIDEBOSS) {
			return GlobalConfig.LeadFubenBaseConfig.BuyRebornCost;
		}
		else if (GameMap.fbType == UserFb.FB_TYPE_CITY) {
			return GlobalConfig.CityBaseConfig.BuyRebornCost;
		}
		else if (GameMap.fbType == UserFb.FB_TYPE_HEFUBOSS) {
			return GlobalConfig.HefuBossBaseConfig.BuyRebornCost;
		}
		else if (GameMap.fbType == UserFb.FB_TYPE_NEW_WORLD_BOSS) {
			return GlobalConfig.NewWorldBossBaseConfig.clearCdCost;
		}
		else if (GameMap.fubenID == GlobalConfig.CampBattleConfig.fbId)
			return GlobalConfig.CampBattleConfig.buyRebornCdCost;
		else if (GameMap.fubenID == GlobalConfig.PassionPointConfig.fbId)
			return GlobalConfig.PassionPointConfig.buyRebornCdCost;

		return GlobalConfig.WorldBossBaseConfig.clearCdCost[this.currBossSubType - 1];
	}

	//是否自动复活
	public checkisAutoRelive(): boolean {
		if (this.reliveTime > 0) {//cd中
			if (this.autoClear[this.currBossSubType]) {//自动清除cd
				if (this.checkWorldBossMoney()) {//元宝足够
					this.sendClearCD();
					return false;
				} else {
					UserTips.ins().showTips("元宝不足，无法立即复活");
					this.autoClear[this.currBossSubType] = false;
				}
			}
			return true;
		}
		return false;
	}

	public set reliveTime(num: number) {
		if (this._reliveTime != num) {
			this._reliveTime = num;
			TimerManager.ins().remove(this.timeClock, this);
			TimerManager.ins().doTimer(1000, this._reliveTime, this.timeClock, this);
		}
	}

	public get reliveTime(): number {
		return this._reliveTime;
	}

	private timeClock(): void {
		this._reliveTime--;
		if (this._reliveTime <= 0) {
			TimerManager.ins().remove(this.timeClock, this);
		}
	}


	//---------------------------------------------------------------------全民boss界面信息
	public parser(bytes: GameByteArray) {
		this.challengeCount = bytes.readShort();
		this.restoreTime = bytes.readShort() * 1000 + egret.getTimer();
		this.toDaySoul = bytes.readInt();
		this.cdTime = bytes.readShort() * 1000 + egret.getTimer();
		this.bossRemind = bytes.readInt();

		if (!this.hp || (this.hp <= 0 && GuildWar.ins().getModel().checkinAppoint(1))) {
			ViewManager.ins().close(BossBloodPanel);
		}
	}

	// public getRemindByIndex(index: number): boolean {
	// 	return ((this.bossRemind >> index) & 1) == 1;
	// }

	// public setRemind(value: number): void {
	// 	this.bossRemind ^= value;
	// 	this.sendSaveRemind();
	// }

	public publicBossIdDic: number[] = [];

	public parserBossList(bytes: GameByteArray) {
		// let count: number = bytes.readShort();
		// this.bossInfo = [];
		// this.publicBossIdDic = [];
		// let info: PublicBossInfo;
		// for (let i = 0; i < count; i++) {
		// 	info = new PublicBossInfo;
		// 	info.parser(bytes);
		// 	this.bossInfo.push(info);
		// 	this.publicBossIdDic.push(GlobalConfig.PublicBossConfig[info.id].bossId)
		// }
	}

	public parserBoss(bytes: GameByteArray) {
		// let id: number = bytes.readInt();
		// bytes.position -= 4;
		// let tempHP: number;
		// let lv: number = Actor.level;
		// let zslv: number = UserZs.ins().lv;
		// for (let i = 0; i < this.bossInfo.length; i++) {
		// 	tempHP = this.bossInfo[i].hp
		// 	if (this.bossInfo[i].id == id) {
		// 		this.bossInfo[i].parser(bytes);
		// 		//删除提示
		// 		if (this.tempID && //有提示
		// 			this.tempID == GlobalConfig.PublicBossConfig[id].bossId &&//提示boss和当前boss一样
		// 			this.bossInfo[i].isDie) {//boss死亡
		// 			this.tempID = 0;
		// 			this.postBossData(false);
		// 		}
		// 		//提示重生
		// 		if (tempHP == 0 && this.bossInfo[i].hp == 100
		// 			&& this.getBossRemindByIndex(i)
		// 			&& zslv >= GlobalConfig.PublicBossConfig[id].zsLevel && lv >= GlobalConfig.PublicBossConfig[id].level) {
		// 			this.tempID = GlobalConfig.PublicBossConfig[id].bossId;
		// 			this.postBossData(true, GlobalConfig.MonstersConfig[this.tempID].name);
		// 		}
		// 		break;
		// 	}
		// }
	}


	//-----------------------------------------------------------
	public checkShow(): void {
		let fbID: number = GameMap.fubenID;
		if (isNaN(fbID)) {
			return;
		}

		if (GameMap.fubenID != GameMap.lastFbId) {
			this.lastBossID = -1;
			GameMap.lastFbId = GameMap.fubenID;
		}

		if (fbID != 0 && GameMap.fbType != UserFb.FB_TYPE_GUANQIABOSS) {
			if (GameMap.fbType == UserFb.FB_TYPE_NEW_WORLD_BOSS && GameMap.fubenID == GlobalConfig.NewWorldBossBaseConfig.fbId) {
				ViewManager.ins().open(NewWorldBossUIView);
			}
			else if (GameMap.fbType == UserFb.FB_TYPE_ZHUANSHENGBOSS
				|| GameMap.fbType == UserFb.FB_TYPE_ALLHUMENBOSS
				|| GameMap.fbType == UserFb.FB_TYPE_HOMEBOSS
				|| (GameMap.fbType == UserFb.FB_TYPE_GUIDEBOSS && GameMap.fubenID != 40001)//天盟争霸引导除外
			) {
				ViewManager.ins().open(WorldBossUiInfo);
			}
			else if (GameMap.sceneInMine()) {
				ViewManager.ins().open(MineScenePanel);
			}
		}
		else {
			ViewManager.ins().close(MineScenePanel);
			ViewManager.ins().close(WorldBossUiInfo);
			ViewManager.ins().close(WorldBossBeKillWin);
			ViewManager.ins().close(NewWorldBossUIView);
		}
	}

	//是否自动复活
	public checkRelive(): boolean {
		if (GwBoss.ins().isRoleDie()) {//cd中
			if (this.checkWorldBossMoney()) {//元宝足够
				// UserBoss.ins().sendClearCD();
				return true;
			} else {
				UserTips.ins().showTips("元宝不足，无法立即复活");
				this.autoClear[this.currBossSubType] = false;
			}
		}
		return false;
	}

	private checkRemoveEntity([handle, entity]) {
		let model = entity.infoModel;
		if (model && model.team != Team.My && model.type == EntityType.Role && model.masterHandle) {
			let masterHandle = model.masterHandle;
			if (!EntityManager.ins().getMasterList(masterHandle))
				EntityManager.ins().showNearSomeOne();
		}

		if (model && handle == this.bossHandler) {
			this.postBossDisappear(entity);
		}
	}


	/** 获取boss排名数据 */
	public getRankList(index: number): WorldBossRankItemData {
		return this.rankList[index];
	}

	public init(): void {
		// this.sendInfo();s
		// this.sendBossList();
		this.sendWorldBossInfo(UserBoss.BOSS_SUBTYPE_WORLDBOSS);
		this.sendWorldBossInfo(UserBoss.BOSS_SUBTYPE_QMBOSS);
		this.sendWorldBossInfo(UserBoss.BOSS_SUBTYPE_HOMEBOSS);
		this.sendWorldBossInfo(UserBoss.BOSS_SUBTYPE_SHENYU);
		this.sendWorldBossInfo(UserBoss.BOSS_SUBTYPE_GODWEAPON);
		this.sendWorldBossInfo(UserBoss.BOSS_SUBTYPE_GODWEAPON_TOP);
	}

	/**威胁的列表 */
	public weixieList: number[] = [];

	public changeWeiXieList(handel: number, add: boolean = true, showName: string = ""): void {
		if (Actor.handle == handel) {
			//过滤自己
			return;
		}
		let index: number = this.checkListElements(handel, this.weixieList);
		if (add) {
			if (index == -1) {
				this.weixieList.push(handel);
			}
		} else {
			if (index != -1) {
				this.weixieList.splice(index, 1);
			}
		}
	}

	//可攻击列表
	public canPlayList: number[] = [];
	public belongName: string = "";

	public changecanPlayList(handel: number, add: boolean = true): void {
		let tempHandel;
		// egret.log("asdasd"+handel)
		if (Actor.handle != handel) {
			if (handel == 0) {
				this.canPlayList = [];
				this.belongName = "";
			} else {
				this.weixieList = [];
				this.canPlayList[0] = handel;
				tempHandel = EntityManager.ins().getEntityBymasterhHandle(handel);
				if (tempHandel) this.belongName = tempHandel.infoModel.name;
			}
		} else {
			this.weixieList = [];
			this.canPlayList = [];
			this.belongName = Actor.myName;
		}
		this.postHasAttackChange(0);
		this.postCanplayChange();
	}

	//检查列表是否有重复的数据
	checkListElements(handle: number, list: number[]): number {
		if (list.length <= 0) {
			return -1;
		}
		for (let i: number = 0; i < list.length; i++) {
			if (list[i] == handle) {
				return i;
			}
		}
		return -1;
	}

	public postHasAttackChange(b: number) {
		return b;
	}

	public postCanplayChange(): void {

	}

	public attHandle: number = 0;//归属者 masterhandle


	// public handler: number = 0; //BOSS正在攻击 handle

	public clearWorldBossList(): void {
		if (GameMap.fbType == UserFb.FB_TYPE_ZHUANSHENGBOSS
			|| GameMap.fbType == UserFb.FB_TYPE_ALLHUMENBOSS
			|| GameMap.fbType == UserFb.FB_TYPE_HOMEBOSS
			|| GameMap.fbType == UserFb.FB_TYPE_GUIDEBOSS
			|| GameMap.fbType == UserFb.FB_TYPE_GOD_WEAPON
			|| GameMap.fbType == UserFb.FB_TYPE_GOD_WEAPON_TOP
		) {
			this.weixieList = [];
			this.canPlayList = [];
			GameLogic.ins().currAttackHandle = 0;
		} else {
			UserBoss.ins().winner = "";
			UserFb.ins().guideBossKill = 0;
		}
	}

	public checkBossIconShow(): boolean {
		return OpenSystem.ins().checkSysOpen(SystemType.BOSS) && !UserFb.ins().pkGqboss;
	}

	//神域boss开启天数
	public checkShenyuOpen(): boolean {
		return GameServer.serverOpenDay >= GlobalConfig.WorldBossBaseConfig.shenyuOpenDay - 1;
	}

	public checkWorldBossRedPoint(type: number): boolean {
		if (!this.worldBossPlayList || !this.worldBossPlayList[type]) return false;
		if (type == UserBoss.BOSS_SUBTYPE_SHENYU && !UserBoss.ins().checkShenyuOpen()) return false;

		if (type != UserBoss.BOSS_SUBTYPE_HOMEBOSS) {
			if (!this.worldBossLeftTime || this.worldBossLeftTime.length < 0 || !this.worldBossLeftTime[type]) return false;
		}
		if (type == UserBoss.BOSS_SUBTYPE_QMBOSS || type == UserBoss.BOSS_SUBTYPE_SHENYU) {
			if (this.bossAlertList && this.bossAlertList.length) {
				let isAllDie = true;
				let tempArr = UserBoss.ins().worldInfoList[type].slice();
				let roleLv: number = UserZs.ins().lv * 1000 + Actor.level;
				for (let i = 0; i < tempArr.length; i++) {
					let isDie: boolean = (tempArr[i].relieveTime - egret.getTimer()) / 1000 > 0 || tempArr[i].hp <= 0;
					let boo: boolean = UserBoss.ins().getBossRemindByIndex(tempArr[i].id,1);
					let bossConfig: WorldBossConfig = GlobalConfig.WorldBossConfig[tempArr[i].id];
					let bossLv: number = bossConfig.zsLevel * 1000 + bossConfig.level;
					if (roleLv >= bossLv && boo && !isDie) {
						isAllDie = false;
						break;
					}
				}
				return !isAllDie;
			}
		}
		if (type == UserBoss.BOSS_SUBTYPE_GODWEAPON || type == UserBoss.BOSS_SUBTYPE_GODWEAPON_TOP) {
			for (let data of this.worldBossPlayList[type]) {
				if (data.canChallenge) {
					let needYb = GlobalConfig.WorldBossBaseConfig.challengeItemYb[type - 1];
					if (Actor.yb >= needYb)
						return true;
					let itemId = GlobalConfig.WorldBossBaseConfig.challengeItem[type - 1];
					let item = UserBag.ins().getItemByTypeAndId(0, itemId);
					if (item && item.count)
						return true;
				}
			}
			return false;
		}
		// if (this.worldBossLeftTime[type] <= 0) return false;
		let len = this.worldBossPlayList[type].length;
		for (let i: number = 0; i < len; i++) {
			if (this.worldBossPlayList[type][i].bossState != 2) return true;
		}
		return false;
	}

	//设置头像点击后的cd
	public canClick: boolean = true;
	private _clickTime: number;
	public set clickTime(value: number) {
		this.canClick = false;
		this._clickTime = value;
		TimerManager.ins().remove(this.endTimeChangeStatu, this);
		TimerManager.ins().doTimer(500, this._clickTime, this.endTimeChangeStatu, this);
	}

	private endTimeChangeStatu(): void {
		--this._clickTime;
		if (this._clickTime <= 0) {
			this.canClick = true;
			TimerManager.ins().remove(this.endTimeChangeStatu, this);
		}
	}

	/**获取个人boss列表*/
	public getListData(): any[][] {
		let tempArr = UserFb.getPersonalBossFbIds().slice();
		let dieArr: DailyFubenConfig[] = [];
		let canPlayArr: DailyFubenConfig[] = [];
		let canNotPlayArr: DailyFubenConfig[] = [];
		let roleLv: number = UserZs.ins().lv * 1000 + Actor.level;
		for (let i in tempArr) {
			let config: FbModel = UserFb.ins().getFbDataById(tempArr[i].id);
			let isDie: boolean = config.getPlayCount() <= 0;
			if (isDie) {
				dieArr.push(tempArr[i]);
			} else {
				let bossLv: number = tempArr[i].zsLevel * 1000 + tempArr[i].levelLimit;
				if (tempArr[i].monthcard) {
					if (Recharge.ins().monthDay > 0) {
						canPlayArr.unshift(tempArr[i]);
					} else {
						canNotPlayArr.push(tempArr[i]);
					}
				} else if (tempArr[i].specialCard) {
					if (Recharge.ins().franchise) {
						canPlayArr.unshift(tempArr[i]);
					} else {
						canNotPlayArr.push(tempArr[i]);
					}
				} else if (tempArr[i].privilege) {
					if (Recharge.ins().getIsForeve()) {
						canPlayArr.unshift(tempArr[i]);
					} else {
						canNotPlayArr.push(tempArr[i]);
					}
				} else {
					if (roleLv >= bossLv) {
						canPlayArr.push(tempArr[i]);
					} else {
						canNotPlayArr.push(tempArr[i]);
					}
				}
			}
		}
		return [canPlayArr, canNotPlayArr, dieArr]
	}

	/**
	 * 野外boss能否挑战
	 * @param data
	 * @returns {any}
	 */
	public static isCanChallenge(data: WorldBossConfig): boolean {
		let canChallenge;
		if (data.samsaraLv > 0) {
			canChallenge = Actor.samsaraLv >= data.samsaraLv;
		}
		else {
			let roleLv: number = UserZs.ins().lv * 1000 + Actor.level;
			let bossLv: number = data.zsLevel * 1000 + data.level;
			canChallenge = roleLv >= bossLv;
		}
		return canChallenge;
	}

	/**
	 * 获取神兵圣域boss数据列表
	 */
	public getGwBossList(): WorldBossItemData[] {
		let gwList = this.worldInfoList[UserBoss.BOSS_SUBTYPE_GODWEAPON].concat();
		let topList = this.worldInfoList[UserBoss.BOSS_SUBTYPE_GODWEAPON_TOP].concat();
		for (let i = 0; i < topList.length; i++) {
			let data = topList[i];
			let config = GlobalConfig.WorldBossConfig[data.id];
			if (data.canInto) {
				gwList.push(topList[i]);
				break;
			}

		}
		return gwList;
	}
}

namespace GameSystem {
	export let  userboss = UserBoss.ins.bind(UserBoss);
}