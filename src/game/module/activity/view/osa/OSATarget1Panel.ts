/**
 *
 * @author hepeiye
 *
 */
class OSATarget1Panel extends ActivityPanel {

	private listData: eui.ArrayCollection;
	private actTime0: eui.Label;
	private actInfo0: eui.Label;
	private content: eui.List;
	private title: eui.Image;
	private _time: number = 0;
	private attr: eui.Label;
	private myAttrValue: eui.Label;
	constructor() {
		super();
		this.skinName = "OSATarget1";
		this.content.itemRenderer = OSATargetItemRenderer;

	}
	protected childrenCreated(): void {
		super.childrenCreated();
	}

	public open(...param: any[]): void {
		this.listData = new eui.ArrayCollection;
		this.content.dataProvider = this.listData;
		this.updateData();
		this.observe(Activity.ins().postRewardResult, this.GetCallBack);
		TimerManager.ins().removeAll(this);
		TimerManager.ins().doTimer(1000, 0, this.setTime, this);
		this.updateData();
	}
	private setTime() {
		if (this._time > 0) {
			this._time -= 1;
			this.actTime0.text = DateUtils.getFormatBySecond(this._time, DateUtils.TIME_FORMAT_5, 3);
		}
	}
	public close(...param: any[]): void {
		this.removeObserve();
		TimerManager.ins().removeAll(this);
	}
	private GetCallBack(activityID: number) {
		if (this.activityID != activityID) return;
		if (!Activity.ins().isSuccee) {
			if (!UserBag.ins().getSurplusCount()) {
				UserTips.ins().showTips("背包已满");
			} else {
				UserTips.ins().showTips("领取失败");
				let activityData: ActivityType1Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType1Data;
				Activity.ins().sendChangePage(activityData.id);
			}
		}

		Activity.ins().isSuccee = false;
		this.updateData();
	}

	public updateData() {
		let activityData: ActivityType1Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType1Data;
		let beganTime = Math.floor((DateUtils.formatMiniDateTime(activityData.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(activityData.endTime) - GameServer.serverTime) / 1000);
		if (beganTime >= 0) {
			this.actTime0.text = "活动未开启";
		} else if (endedTime <= 0) {
			this.actTime0.text = "活动已结束";
		} else {
			this._time = endedTime;
			if (this._time < 0) this._time = 0;
			this.actTime0.text = DateUtils.getFormatBySecond(endedTime, DateUtils.TIME_FORMAT_5, 3)
		}
		this.actInfo0.text = GlobalConfig.ActivityConfig[this.activityID].desc;

		let tmplist: ActivityType1Config[] = GlobalConfig.ActivityType1Config[activityData.id];
		let listData: ActivityType1Config[] = [];//由于表解析出来不是一个数组而是对象 这里需要做转换
		for (let k in tmplist) {
			listData.push(tmplist[k]);
		}
		listData = listData.slice();

		let listDataSort: ActivityType1Config[] = [];
		let listDataSortTotal: ActivityType1Config[] = [];
		for (let i = 0; i < listData.length; i++) {
			let state = activityData.getRewardStateById(listData[i].index);
			if (state == Activity.Geted) {//已领取放尾
				listDataSortTotal.push(listData[i]);
			} else {
				listDataSort.push(listData[i]);
			}
		}

		if (listData[0].showType == ShowType.LEVEL) {
			let listDataZsLevel: ActivityType1Config[] = [];
			let listDataLevel: ActivityType1Config[] = [];
			//未领取排序
			listDataLevel = this.sortLevelList(listDataSort);
			//已领取排序
			listDataZsLevel = this.sortLevelList(listDataSortTotal);
			//整合
			listData = listDataLevel.concat(listDataZsLevel);
			this.listData.replaceAll(listData);
		} else {
			listDataSort.sort(this.sortFunc);
			listDataSortTotal.sort(this.sortFunc);
			listData = listDataSort.concat(listDataSortTotal);
			this.listData.replaceAll(listData);
		}
		let aBtn: ActivityBtnConfig = Activity.ins().getbtnInfo(this.activityID.toString());
		this.title.source = aBtn.title;

		// let listDataSort: ActivityType1Config[] = [];
		// let listDataSortTotal: ActivityType1Config[] = [];
		// for( let i = 0;i<listData.length;i++ ){
		// 	let activityData: ActivityType1Data = Activity.ins().getActivityDataById(listData[i].Id) as ActivityType1Data;
		// 	if( activityData.rewardsSum[listData[i].index] >= listData[i].total )
		// 		listDataSortTotal.push(listData[i]);
		// 	else
		// 		listDataSort.push(listData[i]);
		// }
		// listData.sort(this.sortFunc);
		//this.listData.replaceAll(listData);
		this.setDesc(activityData);
	}
	private setDesc(activityData: ActivityType1Data) {
		let config: ActivityType1Config = GlobalConfig.ActivityType1Config[activityData.id][1];
		let myAttr: string = "";
		let val: string = "";
		switch (config.showType) {
			case ShowType.LEVEL:
				myAttr = "我的等级:";
				if (config.zslevel)
					val += UserZs.ins().lv + "转";
				if (config.level)
					val += Actor.level + "级";
				break;
			case ShowType.WING:
				myAttr = "我的翅膀等阶:";
				val = WingsData.getWingAllLevel() + "";
				break;
			case ShowType.ZHUZAO:
				myAttr = "我的魔晶等级:";
				val = Role.getAllForgeLevelByType(PackageID.Zhuling) + "";
				break;
			case ShowType.LONGHUN:
				myAttr = "我的龙印等级:";
				val = LongHunData.getLongHunAllLevel() + "";
				break;
			case ShowType.BOOK:
				// let power = Book.ins().getBookPown();
				// power = Book.ins().getBookPowerNum(power);
				let power = Book.ins().getBookPowerNumEx();
				myAttr = "我的图鉴战力:";
				val = power + "";
				break;
			case ShowType.EQUIP:
				myAttr = "我的装备评分:";
				val = UserBag.ins().getEquipsScoreByBodys() + "";
				break;
			case ShowType.XIAOFEI:
				myAttr = "我的消费:";
				// val = UserBag.ins().getEquipsScoreByRolesOfBody() + "";
				val = activityData.hFTotalConsumption + "";//合服期间消费的元宝
				break;
			case ShowType.RING:
				myAttr = "我的烈焰戒指等级:";
				let data = SpecialRing.ins().getSpecialRingDataById(SpecialRing.FIRE_RING_ID);
				let stage = SpecialRing.ins().getRingStair(data.level);
				let star = SpecialRing.ins().getRingStar(data.level);
				val = stage + "阶" + star + "星";
				break;
			case ShowType.ZHANLING:
				myAttr = `我的天仙等阶:`;
				let lv: number = ZhanLingModel.ins().getZhanLingDataByLevel(0);
				val = Math.ceil(lv / 10) + "阶" + (lv % 10 == 0 ? (lv ? 10 : 0) : lv % 10) + "星";
				break;
			case ShowType.EXRING:
				myAttr = `我的灵戒战力:`;
				let ringpower = SpecialRing.ins().getSpecailRingPower(SpecialRing.FIRE_RING_ID);
				val = ringpower + "";
				break;
			// case ShowType.MEIREN:
			// 	myAttr = `我的天仙战力:`;
			// 	let zlpower = ZhanLingModel.ins().getTotalZhanLingPower();
			// 	val = zlpower + "";
			// 	break;
			case ShowType.HEART:
				myAttr = `我的天书战力:`;
				let xinfapower = HeartMethod.ins().calHeartValue();
				val = xinfapower + "";
				break;
		}
		this.attr.text = myAttr;
		this.myAttrValue.text = val;
	}
	private sortLevelList(datalist: ActivityType1Config[]): ActivityType1Config[] {
		let listDataSort: ActivityType1Config[] = [];
		let lhead = [];
		let ltotal = [];
		for (let i = 0; i < datalist.length; i++) {
			if (datalist[i].zslevel)//转生排在等级后
				ltotal.push(datalist[i]);
			else
				lhead.push(datalist[i]);
		}
		lhead.sort(this.sortFunc);
		ltotal.sort(this.sortFunc);
		listDataSort = lhead.concat(ltotal);
		return listDataSort;
	}

	private sortFunc(aConfig: ActivityType1Config, bConfig: ActivityType1Config): number {

		let activityData: ActivityType1Data = Activity.ins().getActivityDataById(aConfig.Id) as ActivityType1Data;

		let aState: number = activityData.getRewardStateById(aConfig.index);
		let bState: number = activityData.getRewardStateById(bConfig.index);

		// if (aState < bState)
		// 	return -1;
		// if (aState > bState)
		// 	return 1;


		if (aConfig.showType == ShowType.LEVEL) {

			if (aConfig.zslevel < bConfig.zslevel)
				return -1;
			if (aConfig.zslevel > bConfig.zslevel)
				return 1;

			if (aConfig.level < bConfig.level)
				return -1;
			if (aConfig.level > bConfig.level)
				return 1;
		}

		if (aConfig.showType == ShowType.WING) {
			if (aConfig.wingLv < bConfig.wingLv)
				return -1;
			if (aConfig.wingLv > bConfig.wingLv)
				return 1;
		}

		if (aConfig.showType == ShowType.ZHUZAO) {
			if (aConfig.zzLv < bConfig.zzLv)
				return -1;
			if (aConfig.zzLv > bConfig.zzLv)
				return 1;
		}

		if (aConfig.showType == ShowType.LONGHUN) {
			if (aConfig.lhLv < bConfig.lhLv)
				return -1;
			if (aConfig.lhLv > bConfig.lhLv)
				return 1;
		}

		if (aConfig.showType == ShowType.BOOK) {
			if (aConfig.tjPower < bConfig.tjPower)
				return -1;
			if (aConfig.tjPower > bConfig.tjPower)
				return 1;
		}

		if (aConfig.showType == ShowType.EQUIP) {
			if (aConfig.equipPower < bConfig.equipPower)
				return -1;
			if (aConfig.equipPower > bConfig.equipPower)
				return 1;
		}



		if (aConfig.showType == ShowType.ZHANLING) {
			if (aConfig.zhanlingLv < bConfig.zhanlingLv)
				return -1;
			if (aConfig.zhanlingLv > bConfig.zhanlingLv)
				return 1;
		}



		if (aConfig.showType == ShowType.MEIREN) {
			if (aConfig.zlPower < bConfig.zlPower)
				return -1;
			if (aConfig.zlPower > bConfig.zlPower)
				return 1;
		}

		if (aConfig.showType == ShowType.EXRING) {
			if (aConfig.ringPower < bConfig.ringPower)
				return -1;
			if (aConfig.ringPower > bConfig.ringPower)
				return 1;
		}

		if (aConfig.showType == ShowType.HEART) {
			if (aConfig.heartPower < bConfig.heartPower)
				return -1;
			if (aConfig.heartPower > bConfig.heartPower)
				return 1;
		}

		if (aConfig.showType == ShowType.XIAOFEI) {
			if (aConfig.consumeYuanbao < bConfig.consumeYuanbao)
				return -1;
			if (aConfig.consumeYuanbao > bConfig.consumeYuanbao)
				return 1;
		}
		return 0;
	}

}
