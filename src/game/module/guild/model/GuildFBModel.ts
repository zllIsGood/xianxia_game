/*仙盟副本*/
class GuildFBModel {
	public fbNum: number;//副本关数
	public sweep: number;//是否可以扫荡
	public sweepNum: number;//扫荡次数
	public tongguan: number;//全民通关次数奖励领取次数
	public zuwei: number;//助威次数
	public nextFb: number;//下一关通关人数

	public rankDatas: GuildFBRankInfo[];//仙盟副本排名

	public isMaxGK: number;//是否有昨日最高关卡 0-没有
	public maxName: string;//最高关卡玩家名
	public maxNum: number;//通关数
	public maxZhuwei: number;//助威人数
	public maxCareer: number;//职业
	public maxSex: number;//性别

	public fbgkNum: number;//关数
	public gkDatas: any[];//通关人数列表

	public rewardNum: number;//奖励进度
	public rewardRoleNum: number;//达标人数

	public bossGKNum: number;//boss的关数
	public bossTimer: number = 1;//当前波的结束时间

	public change: number;//是否需要请求一些数据更新

	public constructor() {
	}

	parserBaseInfo(bytes: GameByteArray): void {
		this.fbNum = bytes.readShort();
		this.sweep = bytes.readByte();
		this.sweepNum = bytes.readShort();
		this.tongguan = bytes.readByte();
		this.zuwei = bytes.readByte();
		this.nextFb = bytes.readByte();
	}

	parserRankInfo(bytes: GameByteArray): void {
		this.rankDatas = [];
		var len: number = bytes.readByte();
		for (var i: number = 0; i < len; i++) {
			var info: GuildFBRankInfo = new GuildFBRankInfo();
			info.rank = i + 1;
			info.name = bytes.readString();
			info.guanka = bytes.readShort();
			this.rankDatas.push(info);
		}
	}

	parserMaxGkInfo(bytes: GameByteArray): void {
		this.isMaxGK = bytes.readByte();
		if (this.isMaxGK != 0) {
			this.maxName = bytes.readString();
			this.maxCareer = bytes.readByte();
			this.maxSex = bytes.readByte();
			this.maxSex = this.maxCareer == JobConst.ZhanShi ? 0 : 1;
			this.maxNum = bytes.readShort();
			this.maxZhuwei = bytes.readByte();
		}
	}

	parserGkInfo(bytes: GameByteArray): void {
		this.fbgkNum = bytes.readShort();
		var len: number = bytes.readByte();
		this.gkDatas = [];
		for (var i: number = 0; i < len; i++) {
			this.gkDatas.push(bytes.readString());
		}
	}

	parserRewardInfo(bytes: GameByteArray): void {
		this.rewardNum = bytes.readShort();
		this.rewardRoleNum = bytes.readShort();
	}

	/**是否有按钮可点 */
	public hasbtn(): boolean {
		return (GameServer.serverOpenDay > 0 && ((this.sweep == 0 && this.fbNum > 0) || (this.tongguan == 0 && this.rewardNum > 0)));
	}

	get bossTimerEnd(): number {
		return this.bossTimer + egret.getTimer();
	}
}