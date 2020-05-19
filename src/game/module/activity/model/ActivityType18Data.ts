/**
 * 首充团购
 */
class ActivityType18Data extends ActivityBaseData {
	/** 已充值金额 */
	public rechargeCount: number = 0;
	/** 充值人数 */
	public rechargeUserCount: number = 0;
	/** 档位数量 */
	public stateCount: number = 0;
	/** 数据列表 */
	public dataList: FirstChargeGroupData[][] = [];

	public constructor(bytes: GameByteArray) {
		super(bytes);
	}

	public update(bytes: GameByteArray): void {
		this.rechargeCount = bytes.readInt();
		this.rechargeUserCount = bytes.readInt();

		this.dataList = [];

		let stateNum: number = 3;
		this.stateCount = bytes.readShort();

		for (let i: number = 1; i <= this.stateCount; i++) {
			let state: number = 0;
			let stateInt: number = bytes.readInt();
			let list: FirstChargeGroupData[] = [];

			for (let j: number = 1; j <= stateNum; j++) {
				state = stateInt >> j & 1;
				let data = new FirstChargeGroupData();
				data.activityID = this.id;
				data.id = i;
				data.index = j;
				data.isReceive = state > 0;
				list.push(data);
			}

			this.dataList.push(list);
		}
	}

	public canReward(): boolean {
		return this.checkRedPoint();
	}

	public isOpenActivity(): boolean {
		let beganTime = this.getClientTime(this.startTime);
		let endedTime = this.getClientTime(this.endTime);

		return beganTime < 0 && endedTime > 0;
	}

	public checkRedPoint(): boolean {
		return Activity.ins().getType18RedPoint(this.id);
	}

	public getRemainTime(): string {
		let beganTime = this.getClientTime(this.startTime);
		let endedTime = this.getClientTime(this.endTime);
		let desc: string;
		if (beganTime >= 0) {
			desc = "活动未开启";
		} else if (endedTime <= 0) {
			desc = "活动已结束";
		} else {
			desc = DateUtils.getFormatBySecond(endedTime, DateUtils.TIME_FORMAT_5, 3);
		}
		return desc;
	}

	private getClientTime(time: number): number {
		return Math.floor((DateUtils.formatMiniDateTime(time) - GameServer.serverTime) / 1000);
	}

	/**
	 * 是否有可领取奖励
	 * @returns boolean
	 */
	public getIsCanReceive(): boolean {
		for (let list of this.dataList) {
			for (let data of list) {
				if (data.getIsCanReceive()) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * 指定档位是否有可领取奖励
	 * @param  {number} index
	 * @returns boolean
	 */
	public getIsCanReceiveByIndex(index: number): boolean {
		if (index >= this.dataList.length)
			return false;

		let dataList = this.dataList[index];
		for (let data of dataList) {
			if (data.getIsCanReceive()) {
				return true;
			}
		}
		return false;
	}
}

class FirstChargeGroupData {
	/** 活动id */
	public activityID: number = 0;
	/** 档位 */
	public id: number = 0;
	/** 第几位奖励 */
	public index: number = 1;
	/** 是否已领 */
	public isReceive: boolean = false;

	public getIsCanReceive(): boolean {
		let config = this.getConfig();
		if (!config)
			return false;

		return this.getRechargeUserCount() >= this.getConfig().rechargecount && !this.isReceive && this.isRechage();
	}

	/**
	 * 是否达到充值
	 * @returns boolean
	 */
	public isRechage(): boolean {
		let config = this.getConfig();
		if (!config)
			return false;

		let rechage: number = this.getRechargeCount();

		switch (this.index) {
			case 1:
				return true;
			case 2:
				return rechage > 0;
			case 3:
				return rechage >= config.recharge;
			default:
				return false;
		}
	}

	public getConfig(): ActivityType18Config {
		return GlobalConfig.ActivityType18Config[this.activityID][this.id];
	}

	/**
	 * 获取充值人数
	 * @returns number
	 */
	public getRechargeUserCount(): number {
		return (Activity.ins().activityData[this.activityID] as ActivityType18Data).rechargeUserCount;
	}

	/**
	 * 获取充值金额
	 * @returns number
	 */
	public getRechargeCount(): number {
		return (Activity.ins().activityData[this.activityID] as ActivityType18Data).rechargeCount;
	}

}