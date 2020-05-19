class ActivityType20Data extends ActivityBaseData {
	/**当前关卡数 */
	public curCheckPoint: number = 0;
	public constructor(bytes: GameByteArray) {
		super(bytes);
		this.curCheckPoint = bytes.readInt();
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

	/**
	 * 获取当前页数据
	 * @param  {number} page
	 * @returns Act20Data
	 */
	public getCurPageData(page: number): ActivityType20Config[] {
		let confs = GlobalConfig.ActivityType20Config[this.id];
		let reArr = [];
		for (let k in confs) {
			if (page == 1) {
				if (+k <= 5) reArr.push(confs[k]);
			} else if (page == 2) {
				if (+k > 5) reArr.push(confs[k]);
			}
		}
		return reArr;
	}

	public isAllPass(): boolean {
		let confs = GlobalConfig.ActivityType20Config[this.id];
		return Object.keys(confs).length == this.curCheckPoint;
	}

	//是否显示活动图标
	public getHide(): boolean {
		this.isHide = this.isAllPass();
		return this.isHide;
	}

	//用于飞剑奇缘活动，登录时显示红点，进入飞剑活动界面后去掉红点
	public canReward(): boolean {
		return Activity.ins().feijianHappyHoursRed && this.isOpenActivity() && !this.isAllPass();
	}

}