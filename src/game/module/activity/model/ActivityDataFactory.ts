/**
 * 活动数据工厂类
 */

class ActivityDataFactory {
	public static TimeType_Normal = 0;//普通开服时间
	public static TimeType_Fixed = 1;//固定开服时间
	public static TimeType_Total = 2;//合服开服时间

	public static ACTIVITY_TYPE_1: number = 1;
	public static ACTIVITY_TYPE_2: number = 2;
	public static ACTIVITY_TYPE_3: number = 3;
	public static ACTIVITY_TYPE_4: number = 4;
	public static ACTIVITY_TYPE_5: number = 5;
	public static ACTIVITY_TYPE_6: number = 6;
	public static ACTIVITY_TYPE_7: number = 7;
	public static ACTIVITY_TYPE_8: number = 8;
	public static ACTIVITY_TYPE_9: number = 9;
	public static ACTIVITY_TYPE_10: number = 10;
	public static ACTIVITY_TYPE_17: number = 17;
	public static ACTIVITY_TYPE_18: number = 18;
	public static ACTIVITY_TYPE_19: number = 19;
	public static ACTIVITY_TYPE_20: number = 20;
	public static ACTIVITY_TYPE_21: number = 21;
	public static ACTIVITY_TYPE_22: number = 22;
	public static ACTIVITY_TYPE_23: number = 23;
	public static ACTIVITY_TYPE_24: number = 24;
	public static ACTIVITY_TYPE_25: number = 25;
	public static ACTIVITY_TYPE_26: number = 26;
	public static ACTIVITY_TYPE_27: number = 27;
	public static ACTIVITY_TYPE_28: number = 28;

	static create(bytes: GameByteArray): ActivityBaseData {
		let id = bytes.readInt();

		let startTime = bytes.readInt();
		let endTime = bytes.readInt();
		let type = bytes.readShort();
		let len = bytes.readInt();
		// console.log(`id:${id}, startTime:${startTime}, endTime:${endTime}, type:${type}, len:${len}`);
		let data: ActivityBaseData;
		switch (type) {
			case ActivityDataFactory.ACTIVITY_TYPE_1:
				data = new ActivityType1Data(bytes);
				break;
			case ActivityDataFactory.ACTIVITY_TYPE_2:
				data = new ActivityType2Data(bytes);
				break;
			case ActivityDataFactory.ACTIVITY_TYPE_3:
				data = new ActivityType3Data(bytes);
				break;
			case ActivityDataFactory.ACTIVITY_TYPE_4:
				data = new ActivityType4Data(bytes);
				break;
			case ActivityDataFactory.ACTIVITY_TYPE_5://合服7天累计登录
			    data = Activity.ins().getActivityDataById(id);
			    if (!data)
				    data = new ActivityType5Data(bytes);
			    else
				   (data as ActivityType5Data).updateRecord(bytes);
				break;
			case ActivityDataFactory.ACTIVITY_TYPE_6:
				data = new ActivityType6Data(bytes);
				break;
			case ActivityDataFactory.ACTIVITY_TYPE_7:
				data = new ActivityType7Data(bytes);
				break;
			case ActivityDataFactory.ACTIVITY_TYPE_8:
				data = new ActivityType8Data(bytes);
				break;
			case ActivityDataFactory.ACTIVITY_TYPE_9:
				data = new ActivityType9Data(bytes);
				break;
			case ActivityDataFactory.ACTIVITY_TYPE_10:
				data = new ActivityType10Data(bytes);
				break;
			case ActivityDataFactory.ACTIVITY_TYPE_17:
				data = new ActivityType17Data(bytes);
				break;
			case ActivityDataFactory.ACTIVITY_TYPE_18:
				data = new ActivityType18Data(bytes);
				break;
			case ActivityDataFactory.ACTIVITY_TYPE_19:
				data = new ActivityType19Data(bytes);
				break;
			case ActivityDataFactory.ACTIVITY_TYPE_20:
				data = new ActivityType20Data(bytes);
				break;
			case ActivityDataFactory.ACTIVITY_TYPE_21:
				data = new ActivityType21Data(bytes);
				break;
			case ActivityDataFactory.ACTIVITY_TYPE_22:
				data = new ActivityType22Data(bytes, id, startTime, endTime);
				break;
			case ActivityDataFactory.ACTIVITY_TYPE_23:
				data = new ActivityType23Data(bytes, id);
				break;
			case ActivityDataFactory.ACTIVITY_TYPE_24:
				data = new ActivityType24Data(bytes, id);
				break;
			case ActivityDataFactory.ACTIVITY_TYPE_25:
				data = new ActivityType25Data(bytes, id);
				break;
			case ActivityDataFactory.ACTIVITY_TYPE_26:
				data = new ActivityType26Data(bytes);
				break;
			case ActivityDataFactory.ACTIVITY_TYPE_27:
				data = new ActivityType27Data(bytes);
				break;
			case ActivityDataFactory.ACTIVITY_TYPE_28:
				data = new ActivityType28Data(bytes);
				break;
			default: {
				debug.log("错误活动类型:" + type);
				for (var i: number = 0; i < len; i++) {
					bytes.readByte();
				}
				return null;
			}
		}
		if (!data)
			return null;
		data.id = id;
		data.startTime = startTime;
		data.endTime = endTime;
		data.type = type;
		let cfg: ActivityConfig = GlobalConfig.ActivityConfig[id];
		if (cfg) {
			data.timeType = cfg.timeType;
			data.pageStyle = cfg.pageStyle || 0;
		}


		//只有type为3的需要主动请求数据
		// if (data.type == ActivityDataFactory.ACTIVITY_TYPE_3 && data.isOpenActivity()) {
		// 	Activity.ins().sendLianxuReward(id);
		// }
		return data;
	}
	static createEx(): void {
		let data: ActivityBaseData;
		let actConfig: ActivityBtnConfig[] = GlobalConfig.ActivityBtnConfig;
		//开服时间
		let serverZeroTime = DateUtils.formatMiniDateTime(GameServer._serverZeroTime);
		//合服时间
		let serverHeZeroTime = DateUtils.formatMiniDateTime(GameServer._serverHeZeroTime);
		for (let k in actConfig) {
			let cfg: ActivityBtnConfig = actConfig[k];
			if (cfg.id > 10000) {
				data = new ActivityType0Data(null);
				data.id = cfg.id;
				data.type = cfg.type;
				data.timeType = cfg.timeType;
				//除了10001工会战广告活动，其他特殊活动进返利页

				if (cfg.id == 10005 || cfg.id == 10006 || cfg.id == 10007) {
					data.pageStyle = ActivityPageStyle.HEFU;
				} else if (cfg.id != 10011){
					data.pageStyle = cfg.id == 10001 ? ActivityPageStyle.KAIFU : ActivityPageStyle.KAIFUFANLI;
				} else {
					data.pageStyle = ActivityPageStyle.FESTIVAL;
				}

				if (cfg.relyOn) {
					//直接拿依赖活动id的时间来给静页活动
					data.relyOn = cfg.relyOn;
					for (let i = 0; i < cfg.relyOn.length; i++) {
						if (Activity.ins().activityData[cfg.relyOn[i]]) {
							data.startTime = DateUtils.formatMiniDateTime(Activity.ins().activityData[cfg.relyOn[i]].startTime);
							data.endTime = DateUtils.formatMiniDateTime(Activity.ins().activityData[cfg.relyOn[i]].endTime);
							break;
						}
					}
				}

				else if (cfg.timeType == ActivityDataFactory.TimeType_Normal) {//开服时间
					let arr = cfg.startTime.split("-");
					let openDay = +arr[0];
					let openTime = arr[1].split(":");

					let startDate = new Date(serverZeroTime);
					startDate.setDate(startDate.getDate() + openDay);
					startDate.setHours(+openTime[0], +openTime[1], 0, 0);
					data.startTime = startDate.getTime();

					if (cfg.endTime) {
						arr = cfg.endTime.split("-");
						let endDay = +arr[0];
						let endTime = arr[1].split(":");

						let endDate = new Date(serverZeroTime);
						endDate.setDate(endDate.getDate() + endDay);
						endDate.setHours(+endTime[0], +endTime[1], 0, 0);
						data.endTime = endDate.getTime();
					} else {
						data.endTime = GameServer.serverTime + 30 * 24 * 60 * 60 * 1000;//加30天
					}
				} else if (cfg.timeType == ActivityDataFactory.TimeType_Fixed) {//活动时间
					data.startTime = (new Date(cfg.startTime)).getTime();
					data.endTime = (new Date(cfg.startTime)).getTime();
				} else if (cfg.timeType == ActivityDataFactory.TimeType_Total) {//合服活动时间
					switch (cfg.id) {
						case ActivityBtnType.HEFU_XUNBAO://合服寻宝
							data.startTime = serverHeZeroTime;//开服那天起
							data.endTime = serverHeZeroTime + GlobalConfig.TreasureHuntConfig.hefuDay * 24 * 60 * 60 * 1000;
							break;
						case ActivityBtnType.HEFU_BOSS:
						case ActivityBtnType.HEFU_JZLC:
							data.startTime = serverHeZeroTime;//开服那天起
							data.endTime = serverHeZeroTime + DateUtils.DAYS_PER_WEEK * DateUtils.SECOND_PER_DAY * 1000;
							break;
					}
				} else {
					data.startTime = serverZeroTime;//开服那天起
					data.endTime = GameServer.serverTime + 30 * 24 * 60 * 60 * 1000;//加30天
				}
				let endedTime = Math.floor((data.endTime - GameServer.serverTime) / 1000);
				if (endedTime > 0) {
					Activity.ins().activityData[cfg.id] = data;
				}
				else {
					//三英雄
					if (cfg.id == ActivityBtnType.THREE_HEROES) {
						if (ThreeHeroes.ins().showIcon3DaysLater)
							Activity.ins().activityData[cfg.id] = data;
					}

				}
			}
		}
	}
}
/**
 * 活动显示页类型
 * 活动表如果不配pageStyle字段 就默认按照timeType来区分显示在合服活动或者开服活动
 * */
enum ActivityPageStyle {
	KAIFU,
	THANKS,//2017年的感恩节(如果发现当年感恩节适合可以重用)
	FESTIVAL,
	HAPPYSEVENDAY = 4,//七天乐
	XIAONIAN = 12, //红包活动
	SPRINGFESTIVAL = 20, //春节活动
	SPRINGEIGHTDAY = 13, //春节8天乐活动
	VERSIONCELE = 17, //版本庆典
	KAIFUFANLI = 99,//开服返利
	KAIFUTEHUI = 100, //开服特惠
	ZHANLING = 9, //天仙活动
	HEFU = 50, // 合服
}