/**
 * 活动2类的数据
 */

class ActivityType2Data extends ActivityBaseData {
	public static LimitLevel:number = 50;//红点提示特殊限制等级
	public buyData: number[];

	/** 全服购买次数 */
	public serverBuyData:number[];

	public sumRMB: number;
	constructor(bytes: GameByteArray) {
		super(bytes);
		this.buyData = [];
		this.serverBuyData = [];
		this.initBuyData(bytes);
	}

	public update(bytes: GameByteArray): void {
		super.update(bytes);
		let id: number = bytes.readShort();
		let count: number = bytes.readInt();
		this.buyData[id] = count;//礼包已购买次数
		this.serverBuyData[id] = bytes.readInt(); //全服已购买次数
	}

	public initBuyData(bytes: GameByteArray){
		let count: number = bytes.readShort();
		for (let i: number = 1; i <= count; i++)//每一个礼包已购买次数
		{
			this.buyData[i] = bytes.readShort();
			this.serverBuyData[i] = bytes.readShort(); //全服购买次数
		}
		this.sumRMB = bytes.readInt();
	}

	public canReward(): boolean {
		// return this.isOpenActivity() && Activity.ins().getisCanBuyXianGou(this.id + "");
		//是否首冲
		// let rch:RechargeData = Recharge.ins().getRechargeData(0);
		// if( !rch.num ){
		// 	return false;
		// }
		//特殊需求 50级以前不要红点
		if( Actor.level < ActivityType2Data.LimitLevel )
			return false;

		//其中一个礼包达到可领取条件
		let activityData: ActivityType2Data;
		if (Activity.ins().doubleElevenIDs.indexOf(this.id) != -1)
			activityData = Activity.ins().getDoubleElevenDataByID(this.id) as ActivityType2Data;
		else
			activityData = Activity.ins().getActivityDataById(this.id) as ActivityType2Data;

		let config:ActivityType2Config[] = GlobalConfig.ActivityType2Config[this.id];
		var serverBuy:boolean = false; //全服限制
		for( let i in config ){
			let cfd:ActivityType2Config = config[i];
			let isBuy:boolean = activityData.buyData[cfd.index] >= cfd.count?true:false;
			serverBuy = this.serverBuyData[cfd.index] >= cfd.scount ? true : false;
			if ( !isBuy && activityData.sumRMB >= cfd.needRecharge && Actor.yb >= cfd.price && UserVip.ins().lv >= cfd.vip && !serverBuy) {

				return true;
			}
		}

		return false;
	}

	/** 用于配置了limitTime的活动 */
	public  isSpecialOpen():boolean
	{
		let beganTime = Math.floor((DateUtils.formatMiniDateTime(this.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(this.endTime) - GameServer.serverTime) / 1000);
		let config:ActivityType2Config = GlobalConfig.ActivityType2Config[this.id][1];
		var hours:number = Number(config.limitTime[0]);
		var minutes:number = Number(config.limitTime[1]);

		if (beganTime + hours * 3600 + minutes * 60 < 0 && endedTime > 0) {
			return true;
		}

		return false;
	}

	/** 获得假库存触发次数 */
	public getSpecialStrikeTimes():number
	{
		let config:ActivityType2Config = GlobalConfig.ActivityType2Config[this.id][1];
		var hours:number = Number(config.limitTime[0]);
		var minutes:number = Number(config.limitTime[1]);
		var times:number = (GameServer.serverTime - DateUtils.formatMiniDateTime(this.startTime) - hours * 3600000 - minutes * 60000) / 1000 / 240;

		return times > 0 ? times : 0;
	}

	public isOpenActivity(): boolean {

		// if( this.timeType == ActivityDataFactory.TimeType_Fixed ){
		// 	let aconfig:ActivityConfig = GlobalConfig.ActivityConfig[this.id];
		// 	if( aconfig ){
		// 		let startTime = (new Date(aconfig.startTime)).getTime();
		// 		let endTime = (new Date(aconfig.endTime)).getTime();
		// 		if( GameServer.serverTime > startTime && GameServer.serverTime < endTime ){
		// 			return true;
		// 		}
		// 	}
		// }else{
			let beganTime = Math.floor((DateUtils.formatMiniDateTime(this.startTime) - GameServer.serverTime) / 1000);
			let endedTime = Math.floor((DateUtils.formatMiniDateTime(this.endTime) - GameServer.serverTime) / 1000);

			if (beganTime < 0 && endedTime > 0) {
				return true;
			}
		// }


		return false;
	}
	//是否显示活动图标
	public getHide():boolean{
		if( this.isHide )
			return this.isHide;
		let config:ActivityType2Config[] = GlobalConfig.ActivityType2Config[this.id];
		for (let i: number = 1; i < this.buyData.length; i++){//每一个礼包已购买次数
			let cfd:ActivityType2Config = config[i];
			if( this.buyData[i] < cfd.count ){
				this.isHide = false;
				return this.isHide;
			}
		}
		this.isHide = true;
		return this.isHide;

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
		let config:ActivityType2Config = GlobalConfig.ActivityType2Config[this.id][1];
		var hours:number = Number(config.limitTime[0]);
		var minutes:number = Number(config.limitTime[1]);
		beganTime += hours * 3600 + minutes * 60;
		if (beganTime < 0 && endedTime > 0)
			return beganTime;

		return 0;
	}
}

