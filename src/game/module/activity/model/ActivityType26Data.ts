/**
 * 活动26类的数据
 */

class ActivityType26Data extends ActivityBaseData {
	public curCheckPoint: number = 0;
	public giftData:number[];
	public list:any;

	constructor(bytes: GameByteArray) {
		super(bytes);
		this.curCheckPoint = 0;
	}
	
	/** 用于配置了limitTime的活动 */
	public  isSpecialOpen():boolean
	{
		let beganTime = Math.floor((DateUtils.formatMiniDateTime(this.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(this.endTime) - GameServer.serverTime) / 1000);
		let config:ActivityType26Config = GlobalConfig.ActivityType26Config[this.id][1];
		var hours:number = Number(config.limitTime[0]);
		var minutes:number = Number(config.limitTime[1]);

		if (beganTime + hours * 3600 + minutes * 60 < 0 && endedTime > 0) {
			return true;
		}

		return false;
	}

	public isOpenActivity(): boolean {
		let beganTime = Math.floor((DateUtils.formatMiniDateTime(this.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(this.endTime) - GameServer.serverTime) / 1000);

		if (beganTime < 0 && endedTime > 0) {
			return true;
		}

		return false;
	}

	//获取剩余时间(秒)
	public getLeftTime() {
		if(this.endTime) {
			let end_time = DateUtils.formatMiniDateTime(this.endTime)/1000;
			let leftTime = Math.floor((end_time - GameServer.serverTime)/1000);
			if(leftTime < 0) {
				leftTime = 0;
			}
			return leftTime;
		}
		let actConfig = GlobalConfig.ActivityConfig[this.id];
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
			let farTime = Math.floor((GameServer.serverTime - DateUtils.formatMiniDateTime(GameServer._serverHeZeroTime))/1000/3600/24);
			day = farTime - time;//距离指定合服活动起始天数
		}

		let curDate = new Date(GameServer.serverTime);
		let leftDay = endDay-day;
		if (leftDay <= 0) return 0;

		let endDate = new Date(GameServer.serverTime);
		endDate.setDate(curDate.getDate()+leftDay);
		endDate.setHours(0,0,0,0);
		return Math.floor((endDate.getTime() - GameServer.serverTime)/1000)
	}

	/** 距离限制开始的时间值 */
	public getSpecialOpenLeftTime() {
		let beganTime = Math.floor((DateUtils.formatMiniDateTime(this.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(this.endTime) - GameServer.serverTime) / 1000);
		let config:ActivityType26Config = GlobalConfig.ActivityType26Config[this.id][1];
		var hours:number = Number(config.limitTime[0]);
		var minutes:number = Number(config.limitTime[1]);
		beganTime += hours * 3600 + minutes * 60;
		if (beganTime < 0 && endedTime > 0)
			return beganTime;

		return 0;
	}

	//用于飞剑奇缘活动，登录时显示红点，进入飞剑活动界面后去掉红点
	public canReward(): boolean {
		return Activity.ins().yymsRed && this.isOpenActivity() && !this.isAllPass();
	}

	public isAllPass(): boolean {
		let confs = GlobalConfig.ActivityType26Config[this.id];
		return Object.keys(confs).length == this.curCheckPoint;
	}
}

class GiftData {
	public index: number = 0;
	public count: number = 0;
}

