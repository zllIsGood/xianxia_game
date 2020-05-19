/**
 * 活动1类的数据
 */

class ActivityType1Data extends ActivityBaseData {
	public record: number;
	public rewardsSum: number[] = [];//单个活动Id对应的剩余份数(按index顺序)
	public hFTotalConsumption: number = 0;//累计消费
	public isHide: boolean;
	constructor(bytes: GameByteArray) {
		super(bytes);
		this.readReawards(bytes);
	}

	public update(bytes: GameByteArray): void {
		super.update(bytes);
		// this.readReawards(bytes);
		let rewardID = bytes.readShort();
		this.record = bytes.readInt();
	}
	public readReawards(bytes: GameByteArray) {
		this.record = bytes.readInt();
		this.hFTotalConsumption = bytes.readInt();
		let len = bytes.readShort();//剩余分数数组长度
		for (let i = 1; i <= len; i++) {
			//获取每一行奖励的已领份数
			this.rewardsSum[i] = bytes.readShort();
		}
	}
	public canReward(): boolean {
		return this.checkRedPoint();
		// let configs: ActivityType1Config[] = GlobalConfig.ActivityType1Config[this.id];
		// let records = this.record;
		//
		// for (let k in configs) {
		// 	let record = Math.floor(records / Math.pow(2, (configs[k].index))) % 2;
		// 	switch (configs[k].showType){
		// 		case ShowType.LEVEL:
		// 			if (Actor.level < configs[k].level || UserZs.ins().lv < configs[k].zslevel )
		// 				return false;
		// 			break;
		// 		case ShowType.WING:
		// 			if( WingsData.getWingAllLevel() < configs[k].wingLv )
		// 				return false;
		// 			break;
		// 		case ShowType.ZHUZAO:
		// 			if( Role.getAllForgeLevelByType(PackageID.Gem) < configs[k].zzLv )
		// 				return false;
		// 			break;
		// 		case ShowType.LONGHUN:
		// 			if( LongHunData.getLongHunAllLevel() < configs[k].lhLv )
		// 				return false;
		// 			break;
		// 		case ShowType.SHENZHUANG:
		// 			if( Role.getAllZSLevel() < configs[k].szLv )
		// 				return false;
		// 			break;
		// 	}
		//
		// 	if (record == 0) {  //未领取
		// 		return true;
		// 	}
		//
		// }

		// return false;
	}

	public isOpenActivity(): boolean {
		let beganTime = Math.floor((DateUtils.formatMiniDateTime(this.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(this.endTime) - GameServer.serverTime) / 1000);

		if (beganTime < 0 && endedTime > 0) {
			return true;
		}

		// return true;
	}

	getRewardStateById(index: number): number {
		let config: ActivityType1Config = GlobalConfig.ActivityType1Config[this.id][index];

		switch (config.showType) {
			case ShowType.LEVEL:
				if (Actor.level < config.level || UserZs.ins().lv < config.zslevel)
					return Activity.NotReached;
				break;
			case ShowType.WING:
				if (WingsData.getWingAllLevel() < config.wingLv)
					return Activity.NotReached;
				break;
			case ShowType.ZHUZAO:
				if (Role.getAllForgeLevelByType(PackageID.Zhuling) < config.zzLv)
					return Activity.NotReached;
				break;
			case ShowType.LONGHUN:
				if (LongHunData.getLongHunAllLevel() < config.lhLv)
					return Activity.NotReached;
				break;
			case ShowType.BOOK:
				// let power = Book.ins().getBookPown();
				// power = Book.ins().getBookPowerNum(power);
				let power = Book.ins().getBookPowerNumEx();
				if (power < config.tjPower)
					return Activity.NotReached;
				break;
			case ShowType.FLYSWORD:
				let fs = FlySword.ins()
				let fspower = fs.getTotalCombatPower(0) + fs.getTotalCombatPower(1) + fs.getTotalCombatPower(2);
				if (fspower < config.fsPower)
					return Activity.NotReached;
				break;
			case ShowType.HUANSHOU:
				let petpower = UserHuanShou.ins().getTotalPower();
				if (petpower < config.petPower)
					return Activity.NotReached;
				break;
			case ShowType.MEIREN:
				let zlm = ZhanLingModel.ins();
				let zlpower = zlm.getTotalZhanLingPower();
				if (zlpower < config.zlPower)
					return Activity.NotReached;
				break;

			case ShowType.EQUIP:
				if (UserBag.ins().getEquipsScoreByBodys() < config.equipPower)
					return Activity.NotReached;
				break;
			case ShowType.XIAOFEI:
				let data: ActivityType1Data = Activity.ins().getActivityDataById(config.Id) as ActivityType1Data;
				if (data.hFTotalConsumption < config.consumeYuanbao) {
					return Activity.NotReached;
				}
				break;
			case ShowType.RING:
				let lvl = 0;
				let ringData = SpecialRing.ins().getSpecialRingDataById(SpecialRing.FIRE_RING_ID);
				if (ringData && ringData.level) lvl = ringData.level;
				if (lvl < config.huoyanRingLv) {
					return Activity.NotReached;
				}
				break;
			case ShowType.ZHANLING:
				if (ZhanLingModel.ins().getZhanLingDataByLevel(0) < config.zhanlingLv)
					return Activity.NotReached;
				break;
			case ShowType.EXRING:
				let fireringPower = SpecialRing.ins().getSpecailRingPower(SpecialRing.FIRE_RING_ID)
				if (fireringPower < config.ringPower)
					return Activity.NotReached;
			case ShowType.HEART:
				let heartPower = HeartMethod.ins().calHeartValue();
				if (heartPower < config.heartPower)
					return Activity.NotReached;
				break;
		}


		let record = Math.floor(this.record / Math.pow(2, (config.index))) % 2;
		return record ? Activity.Geted : Activity.CanGet;

		// if (Actor.level >= config.level && UserZs.ins().lv >= config.zslevel) {
		// 	let record = Math.floor(this.record / Math.pow(2, (config.index))) % 2;
		//
		// 	return record ? Activity.Geted : Activity.CanGet;
		// }
		// return Activity.NotReached;
	}
	//判断红点
	public checkRedPoint(): boolean {
		let tmplist: ActivityType1Config[] = GlobalConfig.ActivityType1Config[this.id];
		for (let k in tmplist) {
			let config: ActivityType1Config = tmplist[k];
			let btnType: number = this.getRewardStateById(config.index);
			let curget = this.rewardsSum[config.index];
			let sum = config.total ? (config.total - curget) : 1;
			switch (btnType) {
				case Activity.NotReached:
					break;
				case Activity.CanGet:
					if (sum > 0)
						return true;
					break;
				case Activity.Geted:

					break;
			}
		}

		return false;
	}
	//是否显示活动图标
	public getHide(): boolean {
		if (this.isHide)
			return this.isHide;
		let rec: number = this.record >> 1;
		let tmplist: ActivityType1Config[] = GlobalConfig.ActivityType1Config[this.id];
		let tlist: string[] = Object.keys(tmplist);
		if (rec >= Math.pow(2, tlist.length) - 1) {
			this.isHide = true;
			return this.isHide;
			// let aWin:ActivityWin = ViewManager.ins().getView(ActivityWin) as ActivityWin;
			// for( let i=0;i<aWin.activityPanelList.length;i++ ){
			// 	if( aWin.activityPanelList[i].activityID == this.id ){
			// 		aWin.viewStack.removeChild(aWin.activityPanelList[i]);
			// 		aWin.activityPanelList.slice(i,1);
			// 		this.isHide = true;
			// 		break;
			// 	}
			// }
		}
		this.isHide = false;
		return this.isHide;

	}
}
enum ShowType {
	LEVEL = 0,
	WING = 1,
	ZHUZAO = 2,
	LONGHUN = 3,
	BOOK = 5,//神装改成图鉴
	EQUIP = 6,
	RING = 7,
	ZHANLING = 9,//战灵
	HUANSHOU = 10,//幻兽
	MEIREN = 11,//美人 战灵换皮
	FLYSWORD = 12,//飞剑
	EXRING = 13,//灵戒
	HEART = 14,//心法
	XIAOFEI = 100,//合服消费
}
