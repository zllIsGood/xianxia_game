class ActivityType21Data extends ActivityBaseData {
	/**抽奖次数 */
	public cnt: number = 0;
	/**领取标志位 */
	public state: number = 0;
	public constructor(bytes: GameByteArray) {
		super(bytes);
		this.cnt = bytes.readInt();
		this.state = bytes.readInt();
	}

	private curGetIndex: number = 0;
	public update(bytes: GameByteArray): void {
		this.curGetIndex = bytes.readShort();
		this.cnt = bytes.readInt();
		this.state = bytes.readInt();
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

		return isTime;
	}

	private getClientTime(time: number): number {
		return Math.floor((DateUtils.formatMiniDateTime(time) - GameServer.serverTime) / 1000);
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

	public getNoGetAward(): number {
		let conf = GlobalConfig.ActivityType21Config[this.id];
		if (!conf) return 0;
		if (this.cnt == 0) return 0;
		for (let k in conf) {
			let state = this.isGetAward(+k);
			if (!state && this.cnt >= +k) return +k - 1;
		}
		return 0;
	}

	/**
	 * 是否领取了奖励
	 * @param  {number} index（配置1开始）
	 * @returns boolean
	 */
	public isGetAward(index: number): boolean {
		return (this.state != undefined && ((this.state >> index) & 1) == 1);
	}

	/**
	 * 是否能够领取奖励
	 * @param  {number} index
	 * @returns boolean
	 */
	public isCanGetAward(index: number): boolean {
		let confs = GlobalConfig.ActivityType21Config[this.id];
		return !this.isGetAward(index) && this.cnt >= confs[index].num;
	}

	public canReward(): boolean {
		let confs = GlobalConfig.ActivityType21Config[this.id];
		if (!confs) return false;
		for (let k in confs) {
			if (this.isCanGetAward(+k)) return true;
		}
		return false;
	}

	public getCntData(): ActivityType21Config[] {
		let confs = GlobalConfig.ActivityType21Config[this.id];
		let reArr = [];
		for (let k in confs) {
			let conf = confs[k];
			conf['state'] = this.isGetAward(+k);
			conf['cnt'] = this.cnt;
			conf['isCanGetAward'] = this.isCanGetAward(+k);
			reArr.push(conf);
		}
		return reArr;
	}
}