/** 活动类型22数据 */
class ActivityType22Data extends ActivityBaseData {

	public static FIRST_OPEN_SHOP: boolean = true;
	private _rewardInfo: number = 0;

	private _hiScore: number;

	private _achieveInfo: { times: number, isGot: boolean }[];

	constructor(bytes: GameByteArray, id: number, startTime: number, endTime: number) {
		super(bytes);
		this.id = id;
		this.startTime = startTime;
		this.endTime = endTime;
		this.update(bytes);
	}

	public update(bytes: GameByteArray): void {
		this._rewardInfo = bytes.readInt();
		let len: number = bytes.readShort();
		this._achieveInfo = [];
		this._achieveInfo.length = Object.keys(GlobalConfig.ActivityType22_2Config[this.id]).length;
		let i: number;
		for (i = 0; i < len; i++)
			this._achieveInfo[bytes.readShort() - 1] = {times: bytes.readInt(), isGot: bytes.readBoolean()};

		len = this._achieveInfo.length;
		let conf: ActivityType22_2Config;
		this._hiScore = 0;
		let curDay: number = this.getCurDay();
		for (i = 0; i < len; i++) {
			if (!this._achieveInfo[i])
				this._achieveInfo[i] = {times: 0, isGot: false};

			conf = GlobalConfig.ActivityType22_2Config[this.id][i + 1];
			if (!conf.day || curDay >= conf.day)
				this._hiScore += (Math.floor(this._achieveInfo[i].times / conf.target)) * conf.score;
			//this._hiScore += (Math.min(this._achieveInfo[i].times, conf.dayLimit)) * conf.score;
		}
	}

	/** 奖励信息按位读取 1为已领取，0为未领取 可领取状态由前端自己控制 */
	public get rewardInfo(): number {
		return this._rewardInfo;
	}

	/** 当前嗨积分 */
	public get hiScore(): number {
		return this._hiScore;
	}

	/** 完成次数 */
	public get achieveInfo(): { times: number, isGot: boolean }[] {
		return this._achieveInfo;
	}

	public canReward(): boolean {
		return this.checkRedPoint();

	}

	public isOpenActivity(): boolean {
		let beganTime = Math.floor((DateUtils.formatMiniDateTime(this.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(this.endTime) - GameServer.serverTime) / 1000);
		if (beganTime < 0 && endedTime > 0)
			return true;

		return false;
	}

	//判断红点
	public checkRedPoint(): boolean {

		let cfg: ActivityConfig = GlobalConfig.ActivityConfig[this.id];
		if (cfg.pageStyle == ActivityPageStyle.HAPPYSEVENDAY || cfg.pageStyle == ActivityPageStyle.SPRINGEIGHTDAY || cfg.pageStyle == ActivityPageStyle.VERSIONCELE) {
			let len: number = Object.keys(GlobalConfig.ActivityType22_2Config[this.id]).length;
			let conf: ActivityType22_2Config;
			let achieve: { times: number, isGot: boolean };
			let curDay: number = this.getCurDay();
			for (let i: number = 1; i <= len; i++) {
				conf = GlobalConfig.ActivityType22_2Config[this.id][i];
				achieve = this.achieveInfo[conf.index - 1];
				if (curDay >= conf.day && !achieve.isGot && achieve.times >= conf.dayLimit)
					return true;
			}
		}
		else {
			if (this.checkPhaseAward())
				return true;
		}

		//版本庆典活动特殊 有达标活动 也有阶段奖励 还有活动类型22商店红点
		// if (cfg.pageStyle == ActivityPageStyle.VERSIONCELE) {
		// 	if (ActivityType22Data.FIRST_OPEN_SHOP)
		// 		return true;

		// 	if (this.checkPhaseAward())
		// 		return true;

		// 	let id = 0;
		// 	for (let k in Activity.ins().activityData) {
		// 		let ac: ActivityBaseData = Activity.ins().activityData[k];
		// 		if (!ac) continue;
		// 		if (ac.pageStyle == ActivityPageStyle.VERSIONCELE && ac.type == ActivityDataFactory.ACTIVITY_TYPE_22 && Activity.ins().getActivityDataById(+k).isOpenActivity() && !Activity.ins().getActivityDataById(+k).getHide()) {
		// 			id = ac.id;
		// 			if ((ac as ActivityType22Data).refreshFree)
		// 				return true;

		// 			break;
		// 		}
		// 	}
		// }

		return false;
	}

	private checkPhaseAward(): boolean {
		let len: number = Object.keys(GlobalConfig.ActivityType22_1Config[this.id]).length;
		for (let i: number = 1; i <= len; i++) {
			if ((this._rewardInfo >> i & 1) <= 0 && this._hiScore >= GlobalConfig.ActivityType22_1Config[this.id][i].score) //可领取
				return true;
		}

		return false;
	}

	public getRemainTime(): string {
		let beganTime = Math.floor((DateUtils.formatMiniDateTime(this.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(this.endTime) - GameServer.serverTime) / 1000);
		let desc: string;
		if (beganTime >= 0) {
			desc = "活动未开启";
		} else if (endedTime <= 0) {
			desc = "活动已结束";
		} else {
			desc = DateUtils.getFormatBySecond(endedTime, DateUtils.TIME_FORMAT_5, 3)
		}
		return desc;
	}

	/** 当前第几天活动 */
	public getCurDay(): number {
		let beganTime = Math.floor((DateUtils.formatMiniDateTime(this.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(this.endTime) - GameServer.serverTime) / 1000);
		let desc: string;
		if (beganTime >= 0)
			return 0;
		else if (endedTime <= 0)
			return 0;
		else
			return Math.ceil(Math.abs(beganTime) / (24 * 3600));
	}
}