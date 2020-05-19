/**
 * 日常副本数据
 */
class FbModel {

	public fbID: number;

	/** 已挑战次数 */
	public useCount: number;
	/** vip购买次数 */
	public vipBuyCount: number;
	/** vip昨日保留次数 */
	public vipHoldCount: number;
	/**是否已通关*/
	public isPass:boolean;

	parser(bytes: GameByteArray) {
		this.fbID = bytes.readInt();
		this.useCount = bytes.readShort();
		this.vipBuyCount = bytes.readShort();
		this.vipHoldCount = bytes.readShort();
		this.isPass = bytes.readBoolean();
	}

	public getCount(): number {
		if (Assert(!isNaN(this.fbID), "fbid is undefined")) {
			return 0;
		}

		let config = GlobalConfig.DailyFubenConfig[this.fbID];
		if (Assert(config, "DailyFubenConfig is null")) {
			return 0;
		}

		if (config.zsLevel > 0) {
			if (UserZs.ins().lv < config.zsLevel)
				return 0;
		}
		else {
			if (Actor.level < config.levelLimit)
				return 0;
		}
		return config.freeCount + this.vipBuyCount + this.vipHoldCount - this.useCount;
	}

	public getPlayCount(): number {
		if (Assert(!isNaN(this.fbID), "fbid is undefined")) {
			return 0;
		}

		let config = GlobalConfig.DailyFubenConfig[this.fbID];
		if (Assert(config, "DailyFubenConfig is null")) {
			return 0;
		}
		return config.freeCount + this.vipBuyCount + this.vipHoldCount - this.useCount;
	}

	/**
	 * 获取下次vip显示
	 * return -1表示已全部用完
	 */
	public getNextVip(): number {
		if (Assert(!isNaN(this.fbID), "fbid is undefined")) {
			return -1;
		}

		let config = GlobalConfig.DailyFubenConfig[this.fbID];
		if (Assert(config, "DailyFubenConfig is null")) {
			return -1;
		}

		for (let i in config.vipBuyCount) {
			if (this.useCount - config.freeCount - config.vipBuyCount[i] < 0)
				return parseInt(i);
		}
		return -1;
	}

	/**
	 * 获取当前剩余的重置次数
	 */
	public getResetCount(): number {
		let vip: number = UserVip.ins().lv;
		let config: DailyFubenConfig = GlobalConfig.DailyFubenConfig[this.fbID];
		return config.vipBuyCount[vip] - (this.useCount - config.freeCount);
	}
}