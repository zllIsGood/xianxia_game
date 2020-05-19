/**
 * Created by MPeter on 2018/3/12.
 *  跨服3v3竞技场系统
 */
class KfArenaSys extends BaseSystem {
	/**是否为跨服竞技场场景*/
	public lastKFArena: boolean = false;
	/**剩余次数 */
	public times: number = 0;
	/** 当前段位*/
	public duanLevel: number = 0;
	/** 积分*/
	public score: number = 0;
	/** 是否为队长*/
	public isTFCaptain: boolean;
	/**当前战绩 */
	public curMouth: kfArenaMark;
	/** 历史战绩*/
	public history: kfArenaMark;

	/** 队长id 0 表示没有战队*/
	public leaderID: number = 0;
	/** 匹配状态 1 匹配中*/
	public macthState: number;

	/** 副本房间成员 */
	public tfMembers: KfArenaRoleVo[];

	/**邀清人列表 */
	public inviteDataList: KFInviteData[] = [];

	/**世界邀请的cd */
	public worldTimeCd: number = 0;

	public flagHandle: number = 10011010110;
	public flagCD: number = 0;


	//战斗场景
	public scoreA: number;
	public scoreB: number;
	/*我的战场积分*/
	public ownScore: number = 0;
	/*我的战场排名*/
	public ownBattleRank: number = 0;
	/*我的阵营 1 A阵营  2 B阵营*/
	public myCampId: number;
	public readyIndex: number;
	/*开始时间戳*/
	public startTime: number;
	/**当前旗子是否被首采*/
	public firstCollect: boolean;

	/**当前采集者 阵营*/
	public collectCamp: number;

	/**可邀清帮派成员列表 */
	public guildDataList: GuildMemberInfo[];
	/**可邀清好友列表 */
	public friendsDataList: GuildMemberInfo[];

	/**我的排名*/
	public ownRank: number;
	/**排名数据列表*/
	public rankDataList: KfArenaRankData[];

	/**胜利方阵营*/
	private winCamp: number;

	/**昨日段位 */
	public yesterdayDuan: number;
	/**每日段位奖励 是否已经领取 1已经领取了，0没有领取*/
	public dailyState: number;
	/** 获得的巅峰令个数*/
	public dflCount: number = 0;
	/**巅峰令奖励领取情况，按位读 */
	public dflState: number;

	/** 开启倒计时 */
	private _openLeftTime: number = 0;

	private _openTimer: number = 0;

	/** 活动是否开启 0 开启前 1 开启中*/
	public isStartIng: number = 0;

	/** 跨服内所有服务器都达到开服40天*/
	public isServerOpen: boolean = false;

	public constructor() {
		super();
		this.sysId = PackageID.KfArena;
		this.regNetMsg(1, this.postPlayerInfo);
		this.regNetMsg(2, this.postTeamInfo);
		this.regNetMsg(5, this.postReceiveInvitation);
		this.regNetMsg(7, this.postBack);
		this.regNetMsg(9, this.postRefFlag);
		this.regNetMsg(10, this.doCollectFlag);
		this.regNetMsg(11, this.postRelive);
		this.regNetMsg(13, this.postFbInfo);
		this.regNetMsg(14, this.doResult);
		this.regNetMsg(16, this.postMacthState);
		this.regNetMsg(17, this.postChangeScore);
		this.regNetMsg(19, this.postDataInfo);
		this.regNetMsg(20, this.postKfArenaGuilds);
		this.regNetMsg(21, this.doNotice);
		this.regNetMsg(22, this.postMyBattleInfo);
		this.regNetMsg(23, this.postJoinRewards);
		this.regNetMsg(26, this.postOpenKfArena);
		this.regNetMsg(25, this.postRank);


		this.observe(GameLogic.ins().postEnterMap, this.changeScene);

	}


	/**
	 * 创建战队
	 * 72-1
	 */
	public sendCreateTeam(): void {
		this.sendBaseProto(1);
	}

	/** 玩家个人信息
	 * 72-1
	 */
	public postPlayerInfo(bytes: GameByteArray): void {
		this.times = bytes.readInt();
		this.duanLevel = bytes.readInt();
		this.score = bytes.readInt();
		if (!this.curMouth)
			this.curMouth = new kfArenaMark();
		this.curMouth.parse(bytes);
		if (!this.history)
			this.history = new kfArenaMark();
		this.history.parse(bytes);
		this.isServerOpen = bytes.readInt() == 1;
		// console.log(this.isServerOpen);
		this.isServerOpen = true;
	}

	/**
	 * 单人匹配
	 * 72-2
	 */
	public sendPersonalMatch(): void {
		this.sendBaseProto(2);
	}

	/**
	 * 战队信息
	 * 72-2
	 */
	public postTeamInfo(bytes: GameByteArray): void {
		this.leaderID = bytes.readInt();
		this.macthState = bytes.readInt();
		let len: number = bytes.readInt();
		this.tfMembers = [];
		for (let i: number = 0; i < len; i++) {
			let vo: KfArenaRoleVo = new KfArenaRoleVo();
			this.tfMembers[i] = vo;
			vo.parse(bytes);
		}
		this.isTFCaptain = Actor.actorID == this.leaderID;
	}

	/** 离开或者解散队伍
	 * 72-3
	 */
	public sendLeaveTeam(): void {
		this.sendBaseProto(3);
	}

	/** 开始匹配
	 * 72-4
	 */
	public sendStartMacth(): void {
		this.sendBaseProto(4);
	}

	/** 取消匹配
	 * 72-16
	 */
	public sendCancelMacth(): void {
		this.sendBaseProto(16);
	}

	/** 可邀请的帮派成员
	 * 72-20
	 */
	public sendGuilds(type: number): void {
		let bytes: GameByteArray = this.getBytes(20);
		bytes.writeInt(type);
		this.sendToServer(bytes);
	}

	/** 邀请玩家
	 * 72-5
	 */
	public sendInvite(id: number): void {
		let bytes: GameByteArray = this.getBytes(5);
		bytes.writeInt(id);
		this.sendToServer(bytes);
		this.postKfArenaDelID(id);
	}

	public postKfArenaDelID(id: number): number {
		return id;
	}

	/** 收到邀请
	 * 72-5
	 */
	public postReceiveInvitation(bytes: GameByteArray): void {
		let data = new KFInviteData();
		data.parse(bytes);
		//不在副本内
		if (!this.checkInviteByID(data.roleId))
			this.inviteDataList.push(data);
		if (this.inviteDataList.length > 0)
			ViewManager.ins().open(kfReceiveInviteWin, 0);
	}

	/** 判断已有邀请人*/
	public checkInviteByID(id: number): boolean {
		for (let i = 0; i < this.inviteDataList.length; i++) {
			if (this.inviteDataList[i].roleId == id)
				return true;
		}
		return false;
	}

	/** 世界邀请
	 * 72-6
	 */
	public sendWorldInvite(): void {
		this.sendBaseProto(6);
	}

	/** 回复邀请 0 拒绝 1 同意
	 * 72-7
	 */
	public sendRespondInvite(leaderId: number, state: number): void {
		let bytes: GameByteArray = this.getBytes(7);
		bytes.writeInt(leaderId);
		bytes.writeInt(state);
		this.sendToServer(bytes);
	}

	/** 返回信息
	 * 72-7
	 */
	public postBack(bytes: GameByteArray): void {
		let type = bytes.readInt();
		switch (type) {
			case 1://邀请成功
				ViewManager.ins().open(KfArenaWin, KfArenaWin.Page_Select_Macth);
				break
		}
	}

	/** 匹配状态
	 * 72-16
	 */
	public postMacthState(bytes: GameByteArray): void {
		this.macthState = bytes.readInt();
	}

	/** 可邀请的帮派成员列表
	 * 72-20
	 */
	public postKfArenaGuilds(bytes: GameByteArray): number {
		let type: number = bytes.readInt();
		let len = bytes.readInt();
		if (type == KFInviteType.Guild) {
			this.guildDataList = [];
			for (let i = 0; i < len; i++) {
				let info = new GuildMemberInfo();
				info.parse(bytes);
				this.guildDataList.push(info);
			}
		}
		else if (type == KFInviteType.Friend) {
			this.friendsDataList = [];
			for (let i = 0; i < len; i++) {
				let info = new GuildMemberInfo();
				info.parse(bytes);
				this.friendsDataList.push(info);
			}
		}
		return type;
	}

	public getDataList(type: number): GuildMemberInfo[] {
		let list: GuildMemberInfo[] = [];
		let temList: GuildMemberInfo[];
		if (type == KFInviteType.Friend)
			temList = this.friendsDataList;
		else
			temList = this.guildDataList;
		if (!temList) return list;
		for (let member of temList) {
			if (member.roleID == Actor.actorID)
				continue;
			let info = new GuildMemberInfo();
			info.copyData(member);
			list.push(info);
		}
		return list;
	}

	/** 世界邀请加入队伍
	 * 72-18
	 */
	public sendJoinTeam(id: number): void {
		let bytes: GameByteArray = this.getBytes(18);
		bytes.writeInt(id);
		this.sendToServer(bytes);
	}


	/** 踢出玩家
	 * 72-8
	 */
	public sendOutTeam(id: number): void {
		let bytes: GameByteArray = this.getBytes(8);
		bytes.writeInt(id);
		this.sendToServer(bytes);
	}

	/**
	 * 刷新旗帜
	 * 72-9
	 * */
	public postRefFlag(bytes: GameByteArray): void {
		let handle: number = bytes.readDouble();
		this.flagCD = bytes.readInt() * 1000 + egret.getTimer();//采集CD时间

		this.flagHandle = 10011010110;
	}

	/**
	 * 获取旗帜信息
	 * 72-10
	 * */
	private doCollectFlag(bytes: GameByteArray): void {
		//采集者
		let handle: number = bytes.readDouble();
		//踩集剩余时间
		let lefttimer: number = bytes.readInt();

		this.firstCollect = bytes.readBoolean();

		this.collectCamp = bytes.readByte();

		if (!lefttimer) this.collectCamp = 0;


		if (handle && handle == Actor.handle && lefttimer) {
			ViewManager.ins().open(CollectWin, handle, lefttimer);
			GameLogic.ins().currAttackHandle = 0;
		}
		else {
			ViewManager.ins().close(CollectWin);
		}
	}

	/**
	 * 请求采旗信息
	 * 72-10
	 * */
	public sendCollectFlag(): void {
		this.sendBaseProto(10);
	}

	/**
	 * 复活
	 * 72-11
	 * */
	public postRelive(bytes: GameByteArray): void {
		let cd: number = bytes.readInt();
		let handle: number = bytes.readDouble();
		let killer = EntityManager.ins().getEntityByHandle(handle);
		let killerName = "";
		if (killer) {
			let masterKiller = EntityManager.ins().getEntityByHandle(killer.infoModel.masterHandle);//如果是召唤兽 就是它主人的handler
			if (killer instanceof CharRole) {
				killerName = killer.infoModel.name;
			}
			else if (killer.infoModel.masterHandle && masterKiller) {
				killerName = `${masterKiller.infoModel.name}`;
			}
			else {
				killerName = `Boss${killer.infoModel.name}`;
			}
		}
		ViewManager.ins().open(ReliveWin, cd, killerName);
	}

	/**
	 * 进入副本初始信息
	 * 72-13
	 * */
	public postFbInfo(bytes: GameByteArray): void {
		this.startTime = bytes.readInt();//正式开始时间戳
		let endTime: number = bytes.readInt();//结束时间戳
		this.myCampId = bytes.readByte();//阵营ID
		this.scoreA = bytes.readInt();//A阵营积分
		this.scoreB = bytes.readInt();//B阵营积分
		this.readyIndex = bytes.readByte();//当前出生点配置索引

		ViewManager.ins().open(KfArenaFightWin, (DateUtils.formatMiniDateTime(this.startTime) - GameServer.serverTime) / DateUtils.MS_PER_SECOND >> 0, endTime);
	}

	/**
	 * 结算
	 * 72-14
	 * */
	public doResult(bytes: GameByteArray): void {
		let scoreA: number = bytes.readInt();//A阵营积分
		let scoreB: number = bytes.readInt();//B阵营积分
		this.winCamp = bytes.readShort();// 胜利方阵营，1 A阵营，2 B阵营 3 平局
		let len: number = bytes.readShort();
		let dtLit: KfArenaData[] = [];
		for (let i: number = 0; i < len; i++) {
			let data = new KfArenaData(bytes);
			data.rank = i + 1;
			dtLit.push(data);
		}
		//额外奖励
		let extAwards: RewardData[] = [];
		len = bytes.readShort();
		for (let i: number = 0; i < len; i++) {
			let award = new RewardData();
			award.type = bytes.readInt();
			award.id = bytes.readInt();
			award.count = bytes.readInt();
			extAwards.push(award);
		}

		ViewManager.ins().open(KfArenaResultWin, this.winCamp, scoreA, scoreB, dtLit, extAwards);
	}

	/**
	 * 进入战区
	 * 72-15
	 * */
	public enterBattle(): void {
		this.sendBaseProto(15);
	}

	/**
	 * 变化积分
	 * 72-17
	 * */
	public postChangeScore(bytes: GameByteArray): void {
		this.scoreA = bytes.readInt();//A阵营积分
		this.scoreB = bytes.readInt();//B阵营积分


	}

	public dataList: KfArenaData[];

	/**
	 * 派发场景内数据信息
	 * 72-19
	 * */
	public postDataInfo(bytes: GameByteArray): KfArenaData[] {
		this.dataList = [];
		let len: number = bytes.readShort();
		for (let i: number = 0; i < len; i++) {
			let data = new KfArenaData();
			data.readRankData(bytes);
			data.rank = i + 1;
			this.dataList.push(data);
		}
		return this.dataList;
	}

	/**
	 * 请求场景内数据信息
	 * 72-19
	 * */
	public sendDataInfo(): void {
		this.sendBaseProto(19);
	}

	/**
	 * 派发场景内的公告数据
	 * 72-21
	 * */
	private doNotice(bytes: GameByteArray): void {
		let msg = bytes.readString();
		(<NoticeView>ViewManager.ins().open(NoticeView)).showNotice(msg);


	}


	/**
	 * 我的战场信息
	 * 72-22
	 * */
	public postMyBattleInfo(bytes: GameByteArray): void {
		this.ownScore = bytes.readShort();
		this.ownBattleRank = bytes.readShort();
	}

	/**
	 * 派发排行
	 * 72-25
	 * */
	public postRank(bytes: GameByteArray): void {
		this.rankDataList = [];
		let count: number = bytes.readInt();
		for (let i: number = 0; i < count; i++) {
			this.rankDataList.push(new KfArenaRankData(bytes));
		}
		this.ownRank = bytes.readInt();

	}


	/**
	 * 请求排行
	 * 72-25
	 * */
	public sendRank(): void {
		this.sendBaseProto(25);
	}


	/**
	 * 领取每日段位奖励
	 * 72-23
	 * */
	public sendDailyRewards(): void {
		this.sendBaseProto(23);
	}

	/** 领取巅峰令达标奖励
	 * 72-24
	 */
	public sendJoinRewards(index: number): void {
		let bytes: GameByteArray = this.getBytes(24);
		bytes.writeInt(index);
		this.sendToServer(bytes);
	}

	/**
	 * 奖励领取信息
	 * 72-23
	 * */
	public postJoinRewards(bytes: GameByteArray): void {
		this.yesterdayDuan = bytes.readInt();
		this.dailyState = bytes.readInt();
		this.dflCount = bytes.readInt();
		this.dflState = bytes.readInt();
	}

	/**
	 * 开启预告
	 * 72-26
	 * */
	public postOpenKfArena(bytes: GameByteArray): void {
		this.isStartIng = bytes.readInt();
		this._openLeftTime = bytes.readInt();
		this._openTimer = egret.getTimer();
	}


	/** 获得开启剩余时间 */
	public getOpenLeftTime(): number {
		return this._openLeftTime - (egret.getTimer() - this._openTimer) / 1000;
	}

	/**获取当前队伍有没有人离线 */
	public getIsNoOnline(): string {
		let str: string = "";
		for (let member of this.tfMembers) {
			if (!member.isonline) {
				if (str == "")
					str += member.roleName;
				else
					str += "、" + member.roleName;
			}
		}
		return str;
	}

	/** 获取当前胜率*/
	public getWinRate(): string {
		let WinRate: number;
		WinRate = (this.curMouth.win / (this.curMouth.win + this.curMouth.fail + this.curMouth.ping)) * 100;
		return `${WinRate >> 0}%`
	}

	/**检测当前是否匹配中 */
	public checkIsMatching(): boolean {
		if (KfArenaSys.ins().macthState == 1) {
			UserTips.ins().showTips(`跨服竞技场匹配中暂不能操作`);
			return false;
		}
		return true;
	}

	/**检查副本当前是否可操作*/
	public checkFBOperat(checkTeam: boolean = false): boolean {
		if (checkTeam && this.collectCamp && this.collectCamp == this.myCampId) {
			UserTips.ins().showCenterTips(`当前有队友正在采集！`);
		}

		let startCD = (DateUtils.formatMiniDateTime(KfArenaSys.ins().startTime) - GameServer.serverTime) / DateUtils.MS_PER_SECOND >> 0;
		if (startCD > 0) {
			UserTips.ins().showTips(`|C:${ColorUtil.RED}&T:${startCD}秒后战场开始|`);
		}
		return startCD <= 0;
	}

	/** 当前有没有队伍*/
	public getIsJoinTeam(): boolean {
		return this.leaderID != 0;
	}

	public get isKFArena(): boolean {
		return GameMap.fbType == UserFb.FB_TYPE_KF_ARENA;
	}

	/**检测当前变更场景*/
	private changeScene(): void {
		if (this.isKFArena) {
			this.lastKFArena = true;
			//服务器更新数据会在之前，这里因为有判断场景内的处理，所以需要再次刷新
			this.updataModel();
		}
		else if (this.lastKFArena) {
			this.lastKFArena = false;
			this.flagHandle = 0;
			this.ownScore = 0;
			this.ownBattleRank = 0;
			ViewManager.ins().close(KfArenaFightWin);
			//服务器更新数据会在之前，这里因为有判断场景内的处理，所以需要再次刷新
			this.updataModel();
		}
	}

	/**刷新所有场景实体数据*/
	private updataModel(): void {
		let entityList = EntityManager.ins().getAllEntity();
		for (let i in entityList) {
			let entity = entityList[i];
			entity.updateModel();
		}
	}

	/**通过段位获取每日段位奖励 */
	public getDuanAwards(): RewardData[] {
		let data = GlobalConfig.CrossArenaBase.everyDayAward;
		for (let i in data) {
			if (data[i].metal == this.yesterdayDuan) {
				return data[i].award;
			}
		}
		return null;
	}

	/**获取当前段位 */
	public getDuanName(lv: number = 0): string {
		if (lv) {
			return GlobalConfig.CrossArenaBase.scoreMetalName[lv - 1];
		}
		return GlobalConfig.CrossArenaBase.scoreMetalName[this.duanLevel - 1];
	}

	/**通过名字获取ActorId*/
	public getActorIdByName(name: string): number {
		for (let data of this.dataList) {
			if (data.playerName == name)return data.actorid;
		}
		return 0;
	}

	public isOpen(): boolean {
		if(!this.isServerOpen)
			return false;
		let open: boolean = GlobalConfig.CrossArenaBase.openDay <= GameServer.serverOpenDay + 1 && UserZs.ins().lv >= GlobalConfig.CrossArenaBase.zhuanshengLevel;
		if (open) {
			//开启前倒计时5分钟内开启或者开启中
			if (this.isStartIng == 1 || this.isStartIng == 0 && this._openLeftTime > 0)
				return true;
		}
		return false;
	}
}
namespace GameSystem {
	export let  kfArenaSys = KfArenaSys.ins.bind(KfArenaSys);
}
