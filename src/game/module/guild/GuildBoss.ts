class GuildBoss extends BaseSystem {
	constructor() {
		super();

		this.sysId = PackageID.GuildBoss;
		this.regNetMsg(1, this.doGuildBossInfo);
		this.regNetMsg(2, this.doRewardRecord);
		this.regNetMsg(3, this.doGuildBossDetailInfo);
		this.regNetMsg(4, this.doGuildChallengeBack);
		this.regNetMsg(5, this.doGuildRankInfo);
	}

	public static ins(): GuildBoss {
		return super.ins() as GuildBoss;
	}

	public leftTimes: number = 0;
	//奖励数据
	public passRecord: number[];
	//当天是否可挑战BOSS  0否 , 1是
	public canChallenge: number = 0;
	//是否击杀 0否 , 1是
	public isKilled: number = 0;

	public guildBossReward: RewardData[];

	public passId: number = 0;

	public challengeTime: number = 0;

	public bossHP: number = 0;

	public otherGuildId: number = 0;

	public otherGuildName: string = "";

	public otherGuildBossHp: number = 0;

	public winnerId: number = 0;

	public guildRankDic: any = [];

	public guildPersonRankDic: any = [];

	/**
	 * 玩家数据同步
	 * 46-1
	 */
	public doGuildBossInfo(bytes: GameByteArray): void {
		this.leftTimes = bytes.readInt();
		let count: number = bytes.readUnsignedByte();
		this.passRecord = [];
		for (let i: number = 0; i < count; i++) {
			// let state: number = bytes.readByte();
			this.passRecord[bytes.readByte()] = bytes.readByte()
		}
		// this.passRecord = bytes.readInt();
		this.canChallenge = bytes.readByte();
		this.postGuildBossInfoChange();
	}

	/**
	 * BOSS结果奖励
	 * 46-2
	 */
	public doRewardRecord(bytes: GameByteArray): void {
		this.isKilled = bytes.readByte();
		let count: number = bytes.readInt();
		let rewards = [];
		for (let i: number = 0; i < count; i++) {
			let item = new RewardData();
			item.parser(bytes);
			rewards.push(item);
		}

		TimerManager.ins().doTimer(800, 1, () => {
			// ViewManager.ins().open(ResultWin, 1, rewards, "获得奖励如下：");
			ResultManager.ins().create(GameMap.fbType,1, rewards, "获得奖励如下：");
		}, this);
	}

	/**
	 * BOSS详细信息
	 * 46-3
	 */
	public doGuildBossDetailInfo(bytes: GameByteArray): void {
		this.passId = bytes.readInt();
		let time: number = bytes.readInt();
		this.challengeTime = GameServer.serverTime + time * 1000;
		this.bossHP = bytes.readInt();
		this.otherGuildId = bytes.readInt();
		this.otherGuildName = bytes.readString();
		this.otherGuildBossHp = bytes.readInt();
		this.winnerId = bytes.readInt();

		this.postGuildBossDetailChange();
	}

	public guildBossState: number = 0;
	/**
	 * BOSS挑战返回
	 * 0.进入副本成功1.活动不开2.没有仙盟3.挑战次数不足4.已经通关所有boss5.正在有人挑战6.当前挑战关卡没配置7.服务器创建副本(配置)失败8.服务器创建怪物(配置)失败
	 * 46-4
	 */
	public doGuildChallengeBack(bytes: GameByteArray): void {
		this.guildBossState = bytes.readInt();

		if (this.guildBossState == 0) {
			this.leftTimes --;
			this.postChallengeSuccess();
		} else if (this.guildBossState == 5) {
			this.sendGetBossInfo();
		}
	}

	/**
	 * 关卡排名
	 * 46-5
	 */
	public doGuildRankInfo(bytes: GameByteArray): void {
		let id: number = bytes.readInt();
		let count: number = bytes.readByte();
		this.guildRankDic[id] = [];
		this.guildPersonRankDic[id] = [];
		for (let i: number = 0; i < count; i++) {
			let obj: guildBossRankData = new guildBossRankData();
			obj.name = bytes.readString();
			obj.damage = bytes.readInt();
			obj.rank = i + 1;
			this.guildRankDic[id].push(obj);
		}
		count = bytes.readInt();
		for (let i: number = 0; i < count; i++) {
			let obj: guildBossRankData = new guildBossRankData();
			obj.name = bytes.readString();
			obj.damage = bytes.readInt();
			obj.devote = bytes.readInt();
			obj.rank = i + 1;
			this.guildPersonRankDic[id].push(obj);
		}
		this.postGuildBossRankInfoChange();
	}


	/**
	 * 请求挑战BOSS
	 * 46-1
	 */
	public sendChallengeBoss(): void {
		this.sendBaseProto(1)
	}

	/**
	 * 请求领取通关奖励
	 * 46-2
	 */
	public sendGetBossReward(id: number): void {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeInt(id)
		this.sendToServer(bytes);
	}

	/**
	 * 请求获取仙盟副本详细信息
	 * 46-3
	 */
	public sendGetBossInfo(): void {
		this.sendBaseProto(3)
	}

	/**
	 * 请求获取仙盟副本排行信息
	 * 46-5
	 */
	public sendGetBossRankInfo(id: number): void {
		let bytes: GameByteArray = this.getBytes(5);
		bytes.writeInt(id)
		this.sendToServer(bytes);
	}

	public getBossRewardState(): boolean {
		for (let k in GuildBoss.ins().passRecord) {
			if (GuildBoss.ins().passRecord[k] == 1) {
				return true;
			}
		}
		return false;
	}

	public getBossChallenge(): boolean {
		if ( !this.isOpen() ) return false;
		if (GuildBoss.ins().leftTimes <= 0) return false;
		for (let k in GuildBoss.ins().passRecord) {
			if (GuildBoss.ins().passRecord[k] == 0) {
				return true;
			}
		}
		return false;
	}
	public isOpen(){
		return new Date(GameServer.serverTime).getDay() != GlobalConfig.GuildBossConfig.notOpenDayOfWeek;
	}


	/**派发boss数据更新 */
	public postGuildBossInfoChange(): any {

	}

	/**派发boss详细信息更新 */
	public postGuildBossDetailChange(): any {

	}

	/**派发boss挑战成功 */
	public postChallengeSuccess(): any {

	}

	/**派发boss数据更新 */
	public postGuildBossRankInfoChange(): any {

	}
}

/**
 * 
 */
class guildBossRankData {
	public name: string = "";
	public damage: number = 0;
	public rank: number = 0;
	public devote: number = 0;
}

namespace GameSystem {
	export let  guildboss = GuildBoss.ins.bind(GuildBoss);
}