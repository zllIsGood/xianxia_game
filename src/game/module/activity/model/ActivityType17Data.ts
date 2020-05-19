/**
 * 零元礼包
 */
class ActivityType17Data extends ActivityBaseData {
	/** 数据列表 */
	public giftBagDatas: ZeroElementData[] = [];

	constructor(bytes: GameByteArray) {
		super(bytes);
	}

	public update(bytes: GameByteArray): void {
		this.giftBagDatas = [];

		let len: number = bytes.readShort();

		for (let i: number = 0; i < len; i++) {
			let data: ZeroElementData = new ZeroElementData();
			data.id = this.id;
			data.index = i + 1;
			data.parser(bytes);
			this.giftBagDatas.push(data);
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
		return Activity.ins().getType17RedPoint(this.id);
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

	public getIsCanReceived(): boolean {
		for (let data of this.giftBagDatas) {
			if (data.getIsCanReceived()) {
				return true;
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
		if (index >= this.giftBagDatas.length)
			return false;

		for (let data of this.giftBagDatas) {
			if (data.index - 1 == index) {
				return data.getIsCanReceived();
			}
		}
		return false;
	}

	public getConfig(index: number): ActivityType17Config {
		return GlobalConfig.ActivityType17Config[this.id][index];
	}

}

class ZeroElementData {
	public id: number = 0;
	public index: number = 0;
	public state: ZeroElementStateType = 0;
	public time: number = 0;

	public parser(bytes: GameByteArray): void {
		this.state = bytes.readShort();
		this.time = bytes.readInt();
	}

	public getRechargeIndex(): number {
		return 1000 + this.index;
	}

	public getBtnState(): ZeroElementBtnStateType {
		if (!this.isLevel())
			return ZeroElementBtnStateType.NotLevel;
		else if (this.getIsCanReceived())
			return ZeroElementBtnStateType.CanReceived;
		else if (!this.isRecharge())
			return ZeroElementBtnStateType.Buy;
		else
			return ZeroElementBtnStateType.Received;
	}

	public getConfig(): ActivityType17Config {
		return GlobalConfig.ActivityType17Config[this.id][this.index];
	}

	public isOpen(): boolean {
		return true;
	}

	public isRecharge(): boolean {
		return this.getConfig() ? (this.time != 0 || this.getConfig().recharge == 0) : false;
	}

	public getIsCanReceived(): boolean {
		return this.state == ZeroElementStateType.NotReceived && this.isRecharge() && this.isOpen() && this.isLevel();
	}

	public getIsVip(): boolean {
		return this.getConfig ? UserVip.ins().lv >= this.getConfig().vip : false;
	}

	public isLevel(): boolean {
		return this.getConfig() ? Actor.totalLevel >= this.getConfig().level : false;
	}

	public isCanBuy(): boolean {
		return this.getConfig() ? Actor.yb >= this.getConfig().recharge : false;
	}
}

enum ZeroElementBtnStateType {
	/** 等级未达到 */
	NotLevel,
	/** 可领取 */
	CanReceived,
	/** 购买 */
	Buy,
	/** 已领取 */
	Received
}

/**
 * 零元礼包状态类型
 */
enum ZeroElementStateType {
	/** 未领取 */
	NotReceived,
	/** 领取完第一次返利 */
	OneReturn,
	/** 领取完第二次返利 */
	SecondReturn
}