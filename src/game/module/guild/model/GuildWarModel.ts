class GuildWarModel {

	public guildPoint: number = 0;
	public ownPoint: number = 0;
	public gongXun: number = 0;

	public rewardList: RewardData[];

	public creatGuildRankReward(rank: number, index: number = -1): RewardData[] {
		this.rewardList = [];
		let data: any = GlobalConfig.GuildBattleDistributionAward[rank];
		for (let i in data) {
			if( data[i].rewardFlag && !(this.rewardFlag == GuildFlag.hf) ){
				continue;
			}
			if ( Number(i) == (index+1)) {
				return data[i].awardShow;
			}
			let award: any = data[i].awardShow;
			for (let k in award) {
				this.checkIsHave(<RewardData>award[k]);
			}
		}
		return this.rewardList;
	}

	private configList: number[];

	public creatGuildRewardList(): number[] {
		if (this.configList) {
			return this.configList;
		}
		this.configList = [];
		let data: any = GlobalConfig.GuildBattleDistributionAward;
		for (let i in data) {
			if (this.configList.lastIndexOf(data[i][1].rank) == -1) {
				this.configList.push(data[i][1].rank);
			}
		}
		return this.configList;
	}

	private checkIsHave(data: RewardData): void {
		let isFound: boolean = false;
		let len: number = this.rewardList.length;
		for (let i: number = 0; i < len; i++) {
			let info: RewardData = this.rewardList[i];
			if (info.id == data.id && info.type == data.type) {
				isFound = true;
				this.rewardList[i].count += data.count;
			}
		}
		if (!isFound) {
			this.rewardList.push(data);
		}
	}

	/**城门是否被击杀 */
	public doorDie: boolean;

	/**领取第几天的奖励 */
	public rewardDay: number = 1;
	public canGetDay: boolean; //是否可领取每日奖励
	public getDayReward: boolean;//是否领取每日奖励

	/**
	 * 剩余的元宝数
	 * 不是帮主为0  没收到数据表示不可以发 也不可以领
	 */
	public remainYB: number = -1;
	/**
	 * 是否可以发红包
	 * 不是帮主为0
	 */
	public canSend: boolean;
	/**
	 * 是否可领取
	 */
	public canRod: boolean;
	/**
	 * 发出的元宝数
	 */
	public sendYbNum: number;
	/**最多红包数 */
	public maxRedNum: number;
	/**剩余红包数 */
	public remainRedNum: number;
	/**抢红包的列表*/
	public rebList: GuildRedRobInfo[];
	/**自己抢到的元宝数 */
	public robYbNum: number = 0;
	public lastGuildName: string;

	public getRedbagInfo(bytes: GameByteArray): void {
		this.remainYB = bytes.readInt();
		this.canSend = bytes.readBoolean();
		this.canRod = bytes.readBoolean();
		this.sendYbNum = bytes.readInt();
		this.maxRedNum = bytes.readInt();
		this.remainRedNum = bytes.readInt();
		let len: number = bytes.readInt();
		this.rebList = [];
		let info: GuildRedRobInfo;
		for (let i: number = 0; i < len; i++) {
			info = new GuildRedRobInfo();
			info.parse(bytes);
			if (Actor.actorID == info.acId)
				this.robYbNum = info.robNum;
			this.rebList.push(info);
		}
	}

	//判断是否有红包
	public isHaveRedBag(): boolean {
		return this.canSend || this.canRod;// || this.remainRedNum > 0; //已经抢过的不能再抢
	}

	public checkinAppoint(index: number = 0, up: boolean = false): boolean {
		if (!GuildWar.ins().getModel().isWatStart || GameMap.fubenID == 0 || Guild.ins().guildID == 0) {
			return false;
		}

		var data: any = GlobalConfig.GuildBattleLevel;//28001,28002
		for (var k in data) {
			if (data[k].fbId == GameMap.fubenID) {
				if (index == 0) {
					return true;
				}
				if (up && data[k].id >= index) {
					return true;
				}
				if (data[k].id == index) {
					return true;
				}
				return false;
			}
		}

		return false;
	}

	public guildRankList: RankGuildInfo[] = [];

	public decodeGuildRankInfo(bytes: GameByteArray): void {
		this.lastGuildName = bytes.readString();
		let yuan: number = bytes.readByte();
		let len: number = bytes.readInt();
		this.guildRankList = [];
		let info: RankGuildInfo;
		for (let i: number = 0; i < len; i++) {
			info = new RankGuildInfo();
			info.parse(bytes);
			this.guildRankList.push(info);
		}
		GuildWar.ins().postRankInfo();
	}

	public getNextMapName(next: number = 1): string {
		let cruId: number = GameMap.fubenID;
		let data: any = GlobalConfig.GuildBattleLevel;
		let index: number = 1;
		for (let k in data) {
			if( next == data[k].id ){
				index = next;
			}
			// if (cruId == data[k].fbId) {
			// 	if (next != 1) {
			// 		return data[k].name;
			// 	}
			// 	if (data[k].id < 4) {
			// 		index = data[k].id + 1;
			// 	} else {
			// 		index = data[k].id - 1;
			// 	}
			// }
		}
		return data[index].name;
	}

	/**进入下个场景需要的功勋 */
	public getIntoNextMapGongxun(): number {
		let cruId: number = GameMap.fubenID;
		let data: any = GlobalConfig.GuildBattleLevel;
		let index: number = 1;
		for (let k in data) {
			if (cruId == data[k].fbId) {
				if (data[k].id < 4) {
					index = data[k].id + 1;
				} else {
					return 0;
				}
			}
		}
		return data[index].feats;
	}

	/**当前场景的按钮描述*/
	public getMapLevelInfo(): GuildBattleLevel {
		let cruId: number = GameMap.fubenID;
		let data: any = GlobalConfig.GuildBattleLevel;
		let index: number = 1;
		for (let k in data) {
			if (cruId == data[k].fbId) {
				index = data[k].id
			}
		}
		return data[index];
	}

	public killName: string = "";
	public killGuild: string = "";

	/**天盟归属*/
	public cityOwn: string = "虚位以待";


	public myRankList: MyRankGuildInfo[] = [];

	public decodeMyGuildRankInfo(bytes: GameByteArray): void {
		let len: number = bytes.readInt();
		this.myRankList = [];
		let info: MyRankGuildInfo;
		for (let i: number = 0; i < len; i++) {
			info = new MyRankGuildInfo();
			info.parse(bytes);
			this.myRankList.push(info);
		}
		GuildWar.ins().postMyRankChange();
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
				UserTips.ins().showTips("|C:0xf3311e&T:" + showName + " 正在攻击你|");
			}
		} else {
			if (index != -1) {
				this.weixieList.splice(index, 1);
			}
		}
		GuildWar.ins().postWeixieChange(0);
	}

	//可攻击列表
	public canPlayList: number[] = [];

	public changecanPlayList(handel: number, add: boolean = true): void {
		if (Actor.handle == handel) {
			//过滤自己
			return;
		}
		let index: number = this.checkListElements(handel, this.canPlayList);
		if (add) {
			if (index == -1) {
				this.canPlayList.push(handel);
			}
		} else {
			if (index != -1) {
				this.canPlayList.splice(index, 1);
			}
		}
		GuildWar.ins().postCanplayChange();
	}

	public flagStatu: number = 0;//当前采集的状态
	public endTime: number = 0;//时间
	public flagName: string = '';//采集者的名字
	public flagAcId: number = 0;//采集者的id
	public flagGuild: string = "";//采集者的仙盟

	public decodeGulidWarResult(bytes: GameByteArray): void {
		ViewManager.ins().open(GuildWarResultWin, bytes.readString(), bytes.readInt(), bytes.readInt(), bytes.readInt(), bytes.readInt());
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

	private dataList: GuildBattlePersonalAward[];

	public getRewardByPoint(point: number): RewardData[] {
		let rewardList: RewardData[] = [];
		if (!this.dataList) {
			this.dataList = [];
			let data: any = GlobalConfig.GuildBattlePersonalAward;
			for (let str in data) {
				this.dataList.push(data[str]);
			}
		}
		let len: number = this.dataList.length;
		for (let i: number = 0; i < len; i++) {
			if (point >= this.dataList[i].integral) {
				rewardList = rewardList.concat(this.dataList[i].award);
			}
		}
		return rewardList;
	}

	public getMyPointReward(): GuildBattlePersonalAward {
		let data: any = GlobalConfig.GuildBattlePersonalAward;
		let info: GuildBattlePersonalAward;
		for (let str in data) {
			info = data[str];
			if (info.id == this.pointInfo.id) {
				return info;
			}
		}
		return null;
	}

	public getMaxReward(): GuildBattlePersonalAward {
		let data: any = GlobalConfig.GuildBattlePersonalAward;
		let info: GuildBattlePersonalAward;
		let maxEgral = 0;
		let maxInfo: GuildBattlePersonalAward;
		for (let str in data) {
			info = data[str];
			if (info.integral > maxEgral) {
				maxEgral = info.integral;
				maxInfo = info;
			}
		}
		return maxInfo;
	}

	//设置头像点击后的cd
	public canClick: boolean = true;
	private _clickTime: number;
	public set clickTime(value: number) {
		this.canClick = false;
		this._clickTime = value;
		TimerManager.ins().remove(this.endTimeChangeStatu, this);
		TimerManager.ins().doTimer(1000, this._clickTime, this.endTimeChangeStatu, this);
	}

	public get clickTime(): number {
		return this._clickTime;
	}

	private endTimeChangeStatu(): void {
		--this._clickTime;
		if (this._clickTime <= 0) {
			this.canClick = true;
			TimerManager.ins().remove(this.endTimeChangeStatu, this);
		}
	}

	//保存帮派战自己帮派的排名
	public guildWarRank: number;
	//是否可分配奖励
	public _canSendReward: boolean = false;

	//奖励分配的列表
	public rewardIndex: number = 0;
	public sendList: any = [];
	public sendNumList: any[] = [];

	//特殊奖励下发标识
	public rewardFlag: number = 0;
	public get canSendReward(): boolean {
		return Guild.ins().myOffice == GuildOffice.GUILD_BANGZHU && this._canSendReward;
	}

	public set canSendReward(b: boolean) {
		this._canSendReward = b;
	}

	public getCanSendNumByRank(index: number = -1): number {
		let data: any = GlobalConfig.GuildBattleDistributionAward[this.guildWarRank];
		let len: number = 0;
		for (let i in data) {
			//判定特殊标识
			if( data[i].rewardFlag && !(this.rewardFlag == GuildFlag.hf) ){
				continue;
			}
			if (i == (index + 1) + "") {
				return data[i].count;
			}
			++len;
		}
		return len;
	}

	public checkISSendAll(): boolean {
		let len: number = this.getCanSendNumByRank();
		for (let i: number = 0; i < len; i++) {
			let num: number = this.getCanSendNumByRank(i);
			if (!this.sendList[i]) {
				UserTips.ins().showTips("|C:0xf3311e&T:|请先选择需要分配奖励的成员");
				return false;
			}
			let count: number = 0;
			for (let k: number = 0; k < this.sendNumList[i].length; k++) {
				count += this.sendNumList[i][k];
			}
			if (num > count) {
				UserTips.ins().showTips("|C:0xf3311e&T:|请先选择需要分配奖励的成员");
				return false;
			}
			for (let k: number = 0; k < this.sendList[i].length; k++) {
				if (!Guild.ins().checkIsInGuild(this.sendList[i][k].roleID)) {
					UserTips.ins().showTips("|C:0xf3311e&T:|" + this.sendList[i][k].name + " 已退出仙盟");
					return false;
				}
			}
		}
		return true;
	}

	//获胜仙盟的信息
	public winGuildInfo: WinGuildInfo = new WinGuildInfo();

	public isWatStart: boolean;//是否开启天盟争霸
	public startTime: number;//开始的时间
	public _acEndTime: number;//活动结束的倒计时

	public set acEndTime(value: number) {
		this._acEndTime = value;
		if (this._acEndTime > 0) {
			TimerManager.ins().remove(this.reduceTime, this);
			TimerManager.ins().doTimer(1000, value, this.reduceTime, this);
		}
	}

	private reduceTime(): void {
		--this._acEndTime;
		if (this._acEndTime <= 0) {
			TimerManager.ins().remove(this.reduceTime, this);
		}
	}

	public get acEndTime(): number {
		return this._acEndTime
	}

	public setOpenDesc(): string {
		if (this.startTime == 0) {
			return "";
		}
		let date: Date = new Date(this.startTime * 1000);
		return (date.getMonth() + 1) + "月" + date.getDate() + "号(周" + this.guildWarNumDaXie[date.getDay()] + ")" + "20:00开启仙盟争霸";
	}

	private guildWarNumDaXie = [
		"日",
		"一",
		"二",
		"三",
		"四",
		"五",
		"六",
	]

	/** 获取复活 或者 切场景的cd
	 * type   1  切换场景的cd
	 *        2  复活的cd
	 */
	public getCdByType(type: number): number {
		if (GameMap.fubenID == 0) {
			return 0;
		}
		let data: any = GlobalConfig.GuildBattleLevel;
		for (let k in data) {
			if (data[k].fbId == GameMap.fubenID) {
				if (type == 1 || type == 3) {
					return data[k].switchSceneCd;
				}
			}
		}
		return 0;
	}

	public getIsShowGuildWarBtn(): number {
		if (this.startTime == 0 || GlobalConfig.GuildBattleConst.openLevel > Actor.level) {
			return 0;
		}
		let date: Date = new Date(this.startTime * 1000);
		let date2: Date = new Date(GameServer.serverTime);
		if ((date.getDate() == date2.getDate() && (date2.getHours() < 20 || (date2.getHours() == 20 && date2.getMinutes() <= 15))) || this.isWatStart) {
			return 1;
		}
		return 0;
	}

	public rankList: WarRankInfo[] = [];

	public rankListChange(bytes: GameByteArray): void {
		let len: number = bytes.readInt();
		this.rankList = [];
		let info: WarRankInfo
		for (let i: number = 0; i < len; i++) {
			info = new WarRankInfo();
			info.parse(bytes);
			this.rankList.push(info);
		}
		GuildWar.ins().postRankListChange();
	}

	//个人积分奖励数据
	public pointInfo: PointRewarddInfo;

	public decodePointRewardInfo(bytes: GameByteArray): void {
		if (!this.pointInfo) {
			this.pointInfo = new PointRewarddInfo();
		}
		this.pointInfo.parse(bytes);
		GuildWar.ins().postPointRewardChange();
	}

	//组合分配奖励的数据
	public getSelectDataByIndex(index: number): SelectInfoData[] {
		let dataList: SelectInfoData[] = [];
		let info: GuildMemberInfo[];
		let numInfo: any[];
		if (this.sendList && this.sendList[index] && this.sendList[index].length > 0) {
			info = this.sendList[index];
			numInfo = this.sendNumList[index];
			let data: SelectInfoData;
			for (let i: number = 0; i < info.length; i++) {
				data = new SelectInfoData();
				data.data = info[i];
				data.num = numInfo[i];
				dataList.push(data);
			}
		}
		return dataList;
	}

	public getMyPointRankReward(rank: number): RewardData[] {
		let data: any = GlobalConfig.GuildBattlePersonalRankAward;
		for (let str in data) {
			if (data[str].rank == rank) {
				return data[str].award;
			}
		}
		return [];
	}

	//城门死亡的倒计时
	public doEndDoorTime(time: number): void {
		this._doorEndtime = time;
		TimerManager.ins().remove(this.timeDo, this);
		TimerManager.ins().doTimer(1000, this._doorEndtime, this.timeDo, this);
	}

	private timeDo(): void {
		--this._doorEndtime;
		if (this._doorEndtime <= 0) {
			this._doorEndtime = 0;
			TimerManager.ins().remove(this.timeDo, this);
		}
	}

	private _doorEndtime: number = 0;
	public get doorEndtime(): number {
		return this._doorEndtime;
	}

	//正在攻击的目标handle
	public attHandle = 0;

	//组合帮战积分排行	
	public myGuildPointRank: SelectInfoData[] = [];

	public getMyGuildPointRank(): SelectInfoData[] {
		let guildList: GuildMemberInfo[] = Guild.ins().getGuildMembers(0);
		let len: number = guildList.length;
		let info: GuildMemberInfo;
		let pointInfo: SelectInfoData;
		this.myGuildPointRank = [];
		for (let i: number = 0; i < len; i++) {
			info = guildList[i];
			pointInfo = new SelectInfoData();
			pointInfo.data = info;
			pointInfo.num = this.getPointByAcId(info.roleID);
			this.myGuildPointRank.push(pointInfo);
		}
		this.myGuildPointRank.sort(this.sort);
		return this.myGuildPointRank;
	}

	private getPointByAcId(acId: number): number {
		let len: number = this.myRankList.length;
		for (let i: number = 0; i < len; i++) {
			if (this.myRankList[i].roleID == acId) {
				return this.myRankList[i].point;
			}
		}
		return 0;
	}

	private sort(a: SelectInfoData, b: SelectInfoData): number {
		let s1: number = a.num;
		let s2: number = b.num;
		if (s1 > s2)
			return -1;
		else if (s1 < s2)
			return 1;
		else
			return 0;
	}

	public guildHandleList: number[] = [];
	public guildNum: number = 0;

	public setMyGuildNum(handle: number, add: boolean = true): void {
		let index: number = this.checkListElements(handle, this.guildHandleList);
		if (add) {
			if (index == -1) {
				this.guildHandleList.push(handle);
			}
		} else {
			if (index > -1) {
				this.guildHandleList.splice(index, 1);
			}
		}
		this.guildNum = this.guildHandleList.length;
		GuildWar.ins().postGuildNumChange();
	}

	public clearGuildWarList(): void {
		if (this.checkinAppoint()) {
			this.weixieList = [];
			this.canPlayList = [];
			//切场景 清掉handel
			this.attHandle = 0;
			this.guildHandleList = [];
		}
	}
}

class GuildRedRobInfo {
	public robNum: number;
	public robName: string;
	public acId: number;

	public parse(bytes: GameByteArray): void {
		this.robNum = bytes.readInt();
		this.robName = bytes.readString();
		this.acId = bytes.readInt();
	}
}

class RankGuildInfo {
	public guildPoint: number;
	public guildName: string;
	public ownName: string;

	public parse(bytes: GameByteArray): void {
		this.guildName = bytes.readString();
		this.ownName = bytes.readString();
		this.guildPoint = bytes.readInt();
	}
}

class MyRankGuildInfo {
	public myName: string;
	public mapName: string;
	public point: number;
	public attr: number;
	public office: number;
	public job: number;
	public sex: number;
	public roleID: number;

	public parse(bytes: GameByteArray): void {
		this.roleID = bytes.readInt();
		this.myName = bytes.readString();
		this.mapName = bytes.readString();
		this.point = bytes.readInt();
		this.attr = bytes.readInt();
		this.office = bytes.readInt();
		this.job = bytes.readInt();
		this.sex = bytes.readInt();
		this.sex = this.job == JobConst.ZhanShi ? 0 : 1;
	}
}

/**获胜帮会的信息 */
class WinGuildInfo {
	public guildId: number = 0;
	public guildName: string = "";
	public guildOwnName: string = "";
	public guildOwnId: number = 0;
	public guildOwnJob: number = 0;
	public guildOwnSex: number = 0;
	public clothID: number = 0;
	public wapenId: number = 0;
	public wingOpen: number = 0;
	public winId: number = 0;

	public parse(bytes: GameByteArray): void {
		this.guildId = bytes.readInt();
		this.guildName = bytes.readString();
		this.guildOwnName = bytes.readString();
		this.guildOwnId = bytes.readInt();
		this.guildOwnJob = bytes.readByte();
		this.guildOwnSex = bytes.readByte();
		this.guildOwnSex = this.guildOwnJob == JobConst.ZhanShi ? 0 : 1;
		this.clothID = bytes.readInt();
		this.wapenId = bytes.readInt();
		this.wingOpen = bytes.readInt();
		this.winId = bytes.readInt();
	}
}

/**获胜帮会的信息 */
class WarRankInfo {
	public point: number;
	public name: string;

	public parse(bytes: GameByteArray): void {
		this.name = bytes.readString();
		this.point = bytes.readInt();
	}
}

/**积分奖励领取信息 */
class PointRewarddInfo {
	public isCan: boolean;
	public id: number;
	public point: number;

	public parse(bytes: GameByteArray): void {
		this.isCan = bytes.readBoolean();
		this.id = bytes.readInt();
		this.point = bytes.readInt();
	}
}
enum GuildFlag{
	act = 0,
	hf  = 1,
	kf  = 2
}

class SelectInfoData {
	public data: GuildMemberInfo;
	public num: number;
}