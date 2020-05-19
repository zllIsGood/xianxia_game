class ActivityType24Data extends ActivityBaseData {
	private count: number = 0;
	private activityData = {};
	private config: ActivityConfig;

	public constructor(bytes: GameByteArray, id: number) {
		super(bytes);
		this.id = id;
		this.config = GlobalConfig.ActivityConfig[this.id];
		this.pageStyle = this.config.pageStyle;
		this.update(bytes);
	}

	public update(bytes: GameByteArray): void {
		
	}

	public isOpenActivity(): boolean {
		let beganTime = Math.floor((DateUtils.formatMiniDateTime(this.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(this.endTime) - GameServer.serverTime) / 1000);
		
		return beganTime < 0 && endedTime > 0;
	}

	//获取剩余时间(秒)
	public getLeftTime() {
		if(this.endTime) {
			let end_time = this.endTime + DateUtils.SECOND_2010 + 20;
			let leftTime = end_time - Math.floor(GameServer.serverTime/1000);
			if(leftTime < 0) {
				leftTime = 0;
			}
			return leftTime;
		}
		let actConfig = GlobalConfig.ActivityConfig[this.id];
		let type23Config:ActivityType23Config[] = GlobalConfig.ActivityType23Config[this.id];
		let day = 0;//活动已开始天数
		let endDay:number = 0;//结束时间
		if (actConfig.timeType == 0) {//开服时间
			let time = +(actConfig.startTime.split("-")[0]);
			endDay = +(actConfig.endTime.split("-")[0]) - time;
			day = GameServer.serverOpenDay - time;
		} else if (actConfig.timeType == 1) {//活动时间
			let time = GameServer.serverTime;
			let openTime = (new Date(actConfig.startTime)).getTime();
			let endTime = (new Date(actConfig.endTime)).getTime();
			day = Math.floor((time - openTime)/1000/3600/24);
			endDay = Math.round((endTime - openTime)/1000/3600/24);
		} else if (actConfig.timeType == 2) {//合服时间
			let time = +(actConfig.startTime.split("-")[0]);
			endDay = +(actConfig.endTime.split("-")[0]) - time;//合服活动期间天数
			//至今距离合服时间天数
			let farTime = Math.floor((GameServer.serverTime - (GameServer._serverHeZeroTime * 1000 + DateUtils.SECOND_2010 * 1000))/1000/3600/24);
			day = farTime - time;//距离指定合服活动起始天数
		}

		let curDate = new Date(GameServer.serverTime);
		let leftDay = endDay-day;
		if (leftDay <= 0) return 0;

		let endDate = new Date(GameServer.serverTime);
		endDate.setDate(curDate.getDate()+leftDay);
		endDate.setHours(0,0,0,0);
		return Math.floor((endDate.getTime() - GameServer.serverTime)/1000) + 20;
	}
}