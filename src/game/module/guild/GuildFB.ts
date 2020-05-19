/**
 * 仙盟副本数据
 */
class GuildFB extends BaseSystem {

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
	private _gkDatas: any[];//通关人数列表

	public rewardNum: number;//奖励进度
	public rewardRoleNum: number;//达标人数

	public bossGKNum: number;//boss的关数
	public bossTimer: number = 1;//当前波的结束时间

	public change: number;//是否需要请求一些数据更新

	public constructor() {
		super();

		this.sysId = PackageID.GuildFB;
		this.regNetMsg(1, this.doGuildFBInfo);
		this.regNetMsg(2, this.doGuildFBRankInfo);
		this.regNetMsg(3, this.doGuildFBMaxGKInfo);
		this.regNetMsg(4, this.doGuildFBGKInfo);
		this.regNetMsg(5, this.doGuildFBChangeInfo);
		this.regNetMsg(6, this.doGuildFBRewardInfo);
		this.regNetMsg(7, this.postGuildFBBossInfo);
		this.regNetMsg(8, this.postGuildFBBossTimerEndInfo);
		this.regNetMsg(9, this.postGuildFBSweepEnd);
	}

	public static ins(): GuildFB {
		return super.ins() as GuildFB;
	}

	/**通关人数列表 */
	public getGkDatas(index: number = -1): any {
		return index == -1 ? this._gkDatas : this._gkDatas[index];
	}

	/** 仙盟副本信息 */
	private doGuildFBInfo(bytes: GameByteArray): void {
		this.fbNum = bytes.readShort();
		this.sweep = bytes.readByte();
		this.sweepNum = bytes.readShort();
		this.tongguan = bytes.readByte();
		this.zuwei = bytes.readByte();
		this.nextFb = bytes.readByte();
		this.postGuildFubenInfo();
	}

	public postGuildFubenInfo() {

	}

	/** 仙盟副本排名 */
	private doGuildFBRankInfo(bytes: GameByteArray): void {
		this.rankDatas = [];
		let len: number = bytes.readByte();
		for (let i: number = 0; i < len; i++) {
			let info: GuildFBRankInfo = new GuildFBRankInfo();
			info.rank = i + 1;
			info.name = bytes.readString();
			info.guanka = bytes.readShort();
			this.rankDatas.push(info);
		}
		this.postGuildFubenInfo();
	}

	/** 仙盟副本昨日最高关卡 */
	private doGuildFBMaxGKInfo(bytes: GameByteArray): void {
		this.isMaxGK = bytes.readByte();
		if (this.isMaxGK != 0) {
			this.maxName = bytes.readString();
			this.maxCareer = bytes.readByte();
			this.maxSex = bytes.readByte();
			this.maxSex = this.maxCareer == JobConst.ZhanShi ? 0 : 1;
			this.maxNum = bytes.readShort();
			this.maxZhuwei = bytes.readByte();
		}
		this.postGuildFubenInfo();
	}

	/** 仙盟副本关卡通关人数 */
	private doGuildFBGKInfo(bytes: GameByteArray): void {
		this.fbgkNum = bytes.readShort();
		let len: number = bytes.readByte();
		this._gkDatas = [];
		for (let i: number = 0; i < len; i++) {
			this._gkDatas.push(bytes.readString());
		}
		this.postGuildFubenInfo();
		this.postGuildFubenRoleInfo();
	}

	public postGuildFubenRoleInfo() {

	}

	/**仙盟信息变更 */
	private doGuildFBChangeInfo(bytes: GameByteArray): void {
		this.change = bytes.readByte();//变更信息 1-排名有变更 2-昨日最高通关有变化
		if (ViewManager.ins().getView(GuildActivityWin) && ViewManager.ins().getView(GuildActivityWin).isShow()) {
			if (this.change == 1) {
				this.sendGuildFBRankInfo();
			} else if (this.change == 2) {
				this.sendGuildFBMaxGKInfo();
			}
			this.change = 0;
		}
	}

	/**仙盟信息奖励进度 */
	private doGuildFBRewardInfo(bytes: GameByteArray): void {
		this.rewardNum = bytes.readShort();
		this.rewardRoleNum = bytes.readShort();
		this.postGuildFubenInfo();
	}

	/**下一波怪3秒到达 */
	public postGuildFBBossInfo(bytes: GameByteArray): void {
		this.bossGKNum = bytes.readShort();
	}

	/**当前波结束时间 */
	public postGuildFBBossTimerEndInfo(bytes: GameByteArray): void {
		this.bossGKNum = bytes.readShort();
		this.bossTimer = DateUtils.formatMiniDateTime(bytes.readInt());
	}

	/**扫荡结束 */
	public postGuildFBSweepEnd(bytes: GameByteArray): void {
	}

	/**请求仙盟副本排名信息 */
	public sendGuildFBRankInfo(): void {
		this.sendBaseProto(2);
	}

	/**请求仙盟副本昨日最高通关 */
	public sendGuildFBMaxGKInfo(): void {
		this.sendBaseProto(3);
	}

	/**请求仙盟副本关卡人员信息 */
	public sendGuildFBGKRoleInfo(num: number): void {
		let bytes: GameByteArray = this.getBytes(4);
		bytes.writeShort(num);
		this.sendToServer(bytes);
	}

	/**请求挑战仙盟副本 */
	public sendGuildFBChallange(): void {
		this.sendBaseProto(5);
	}

	/**请求扫荡仙盟副本 */
	public sendGuildFBSweep(): void {
		this.sendBaseProto(6);
	}

	/**请求仙盟副本助威 */
	public sendGuildFBZhuwei(): void {
		this.sendBaseProto(7);
	}

	/**请求仙盟副本通关奖励 */
	public sendGuildFBReward(): void {
		this.sendBaseProto(8);
	}

	/**是否有按钮可点 */
	public hasbtn(): boolean {
		return (GameServer.serverOpenDay > 0 && ((this.sweep == 0 && this.fbNum > 0) || (this.tongguan == 0 && this.rewardNum > 0)));
	}

	get bossTimerEnd(): number {
		return this.bossTimer + egret.getTimer();
	}
}

namespace GameSystem {
	export let  guildfb = GuildFB.ins.bind(GuildFB);
}