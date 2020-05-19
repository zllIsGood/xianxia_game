/**
 * 成长基金
 */
class ActivityType19Data extends ActivityBaseData {
	/** 是否购买 */
	public isBuy: boolean = false;
	/** 领取标示-按位取 >>index &1 */
	public receiveIndex: number = 0;
	/** 数据列表 */
	public dataList: GrowthFundData[] = [];

	public constructor(bytes: GameByteArray) {
		super(bytes);
	}

	public update(bytes: GameByteArray): void {
		this.dataList = [];
		this.isBuy = bytes.readShort() == 1;
		this.receiveIndex = bytes.readInt();

		let config = GlobalConfig.ActivityType19Config[this.id];

		if (!config)
			return;

		let len: number = Object.keys(config).length;
		for (let i: number = 1; i < len; i++) {
			let data = new GrowthFundData();
			data.activityID = this.id;
			data.index = i;
			data.isReceive = (this.receiveIndex >> i & 1) > 0;
			this.dataList.push(data);
		}

		this.dataList.sort(this.sortDatas);
	}

	public canReward(): boolean {
		return this.checkRedPoint();
	}

	public getHide(): boolean {
		if (this.isHide) return this.isHide;
		//全部已领取则隐藏
		this.isHide = !this.isOpenActivity();
		return this.isHide;
	}

	private isAllReceive(): boolean {
		for (let data of this.dataList) {
			if (!data.isReceive) {
				return false;
			}
		}
		return true;
	}

	public isOpenActivity(): boolean {
		let isTime: boolean = false;

		if (this.startTime && this.endTime) {
			let beganTime = this.getClientTime(this.startTime);
			let endedTime = this.getClientTime(this.endTime);
			isTime = beganTime < 0 && endedTime > 0;
		}
		else {
			isTime = this.getLeftTime() > 0;
		}

		return isTime || (this.isBuy && !this.isAllReceive());
	}

	public getRemainTime(): string {
		let desc: string;
		if (this.startTime && this.endTime) {
			let beganTime = this.getClientTime(this.startTime);
			let endedTime = this.getClientTime(this.endTime);
			if (beganTime >= 0) {
				desc = "活动未开启";
			} else if (endedTime <= 0) {
				desc = "活动已结束";
			} else {
				desc = DateUtils.getFormatBySecond(endedTime, DateUtils.TIME_FORMAT_5, 3);
			}
		} else {
			desc = DateUtils.getFormatBySecond(this.getLeftTime(), DateUtils.TIME_FORMAT_5, 3);
		}
		return desc;
	}

	//获取剩余时间(秒)
	public getLeftTime() {
		if (this.endTime) {
			let end_time = DateUtils.formatMiniDateTime(this.endTime) / 1000;
			let leftTime = Math.floor((end_time - GameServer.serverTime) / 1000);
			if (leftTime < 0) {
				leftTime = 0;
			}
			return leftTime;
		}
		let actConfig = GlobalConfig.ActivityConfig[this.id];
		let day = 0;//活动已开始天数
		let endDay: number = 0;//结束时间
		if (actConfig.timeType == 0) {//开服时间
			let time = +(actConfig.startTime.split("-")[0]);
			endDay = +(actConfig.endTime.split("-")[0]) - time;
			day = GameServer.serverOpenDay - time;
		} else if (actConfig.timeType == 1) {//活动时间
			let time = GameServer.serverTime;
			let openTime = (new Date(actConfig.startTime)).getTime();
			let endTime = (new Date(actConfig.endTime)).getTime();
			day = Math.floor((time - openTime) / 1000 / 3600 / 24);
			endDay = Math.round((endTime - openTime) / 1000 / 3600 / 24);
		} else if (actConfig.timeType == 2) {//合服时间
			let time = +(actConfig.startTime.split("-")[0]);
			endDay = +(actConfig.endTime.split("-")[0]) - time;//合服活动期间天数
			//至今距离合服时间天数
			let farTime = Math.floor((GameServer.serverTime - DateUtils.formatMiniDateTime(GameServer._serverHeZeroTime)) / 1000 / 3600 / 24);
			day = farTime - time;//距离指定合服活动起始天数
		}

		let curDate = new Date(GameServer.serverTime);
		let leftDay = endDay - day;
		if (leftDay <= 0) return 0;

		let endDate = new Date(GameServer.serverTime);
		endDate.setDate(curDate.getDate() + leftDay);
		endDate.setHours(0, 0, 0, 0);
		return Math.floor((endDate.getTime() - GameServer.serverTime) / 1000)
	}

	private getClientTime(time: number): number {
		return Math.floor((DateUtils.formatMiniDateTime(time) - GameServer.serverTime) / 1000);
	}

	public checkRedPoint(): boolean {
		return Activity.ins().getType19RedPoint(this.id);
	}

	/**
	 * 获取是否有可领取奖励
	 * @returns boolean
	 */
	public getIsCanReceive(): boolean {
		for (let data of this.dataList) {
			if (data.getIsCanReceive()) {
				return true;
			}
		}
		return false;
	}

	/**
	 * 根据索引获取指定数据是否可领取奖励
	 * @param  {number} index
	 * @returns boolean
	 */
	public getIsCanReceiveByIndex(index: number): boolean {
		return (this.receiveIndex >> index & 1) > 0 && this.isBuy;
	}

	/**
	 * 是否可购买基金
	 * @returns boolean
	 */
	public getIsCanBuy(): boolean {
		let config = GlobalConfig.ActivityType19Config[this.id][0];
		if (!config)
			return false;

		return Actor.yb >= config.yb && UserVip.ins().lv >= config.vip && !this.isBuy;
	}

	private sortDatas(a: GrowthFundData, b: GrowthFundData): number {
		let num = Algorithm.sortAsc(a.isReceive, b.isReceive);
		if (num == 0) {
			num = Algorithm.sortAsc(a.getConfig().level, b.getConfig().level);
		}
		return num;
	}

}

class GrowthFundData {
	public activityID: number = 0;
	public index: number = 0;
	public isReceive: boolean = false;

	public getConfig(): ActivityType19Config {
		return GlobalConfig.ActivityType19Config[this.activityID][this.index];
	}

	private getActivityData(): ActivityType19Data {
		return Activity.ins().activityData[this.activityID] as ActivityType19Data;
	}

	/**
	 * 是否满足等级
	 * @returns boolean
	 */
	public getIsLevel(): boolean {
		return this.getConfig() ? Actor.totalLevel >= this.getConfig().level : false;
	}

	/**
	 * 是否已购买
	 * @returns boolean
	 */
	public getIsBuy(): boolean {
		return this.getActivityData() ? this.getActivityData().isBuy : false;
	}

	/**
	 * 是否可领取
	 * @returns boolean
	 */
	public getIsCanReceive(): boolean {
		return this.getIsLevel() && !this.isReceive;
	}
}