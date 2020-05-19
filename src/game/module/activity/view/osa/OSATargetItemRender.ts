/**
 * 活动1控件
 */
class OSATargetItemRenderer extends BaseItemRender {
	// item[0-2] 道具
	public none: eui.Label;
	public already: eui.Label;

	public num: eui.Label;//剩余份数
	public get: eui.Button;

	public bitNum: egret.DisplayObjectContainer;
	public level: eui.Group;
	public lvName: eui.Label;
	public zhuan: eui.Group;
	public zhuanLv: eui.Image;

	private isGet: boolean;//是否可领取
	private actId: number;
	private index: number;
	private lvName0: eui.Label;
	private redPoint: eui.Image;
	private target: eui.Label;
	private recharge: eui.Label;
	constructor() {
		super();
		this.skinName = 'OSATargetItem';
		this.init();
	}


	protected init(): void {
		this.addEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);


		// this.bitNum = BitmapNumber.ins().createNumPic(0, "attr",10);
		// this.bitNum.x += 10;
		// this.level.addChild(this.bitNum);

		this.isGet = true;
	}
	/**触摸事件 */
	public onClick(e: egret.Event) {
		switch (e.target) {
			case this.get:
				if (this.isGet) {
					Activity.ins().sendReward(this.actId, this.index);
				} else {
					let config: ActivityType1Config = GlobalConfig.ActivityType1Config[this.actId][this.index];
					let tipsLevel = 0;
					switch (config.showType) {
						case ShowType.LEVEL:
							if (Actor.level < config.level)
								tipsLevel = config.level - Actor.level;
							else if (UserZs.ins().lv < config.zslevel)
								tipsLevel = config.zslevel - UserZs.ins().lv;
							break;
						case ShowType.WING:
							if (WingsData.getWingAllLevel() < config.wingLv)
								tipsLevel = config.wingLv - WingsData.getWingAllLevel();
							break;
						case ShowType.ZHUZAO:
							if (Role.getAllForgeLevelByType(PackageID.Zhuling) < config.zzLv)
								tipsLevel = config.zzLv - Role.getAllForgeLevelByType(PackageID.Zhuling);
							break;
						case ShowType.LONGHUN:
							if (LongHunData.getLongHunAllLevel() < config.lhLv)
								tipsLevel = config.lhLv - LongHunData.getLongHunAllLevel();
							break;
						// case ShowType.SHENZHUANG:
						// 	if( Role.getAllZSLevel() < config.szLv )
						// 		tipsLevel = config.szLv - Role.getAllZSLevel();
						// 	break;
						case ShowType.BOOK:
							// let power = Book.ins().getBookPown();
							// power = Book.ins().getBookPowerNum(power);
							let power = Book.ins().getBookPowerNumEx();
							if (power < config.tjPower)
								tipsLevel = config.tjPower - power;
							break;
						case ShowType.HUANSHOU:
							let petpower = UserHuanShou.ins().getTotalPower();
							if (petpower < config.petPower)
								tipsLevel = config.petPower - petpower;
							break;
						case ShowType.MEIREN:
							let zlm = ZhanLingModel.ins();
							let zlpower = zlm.getTotalZhanLingPower();
							if (zlpower < config.zlPower)
								tipsLevel = config.zlPower - zlpower;
							break;
						case ShowType.FLYSWORD:
							let fs = FlySword.ins()
							let fspower = fs.getTotalCombatPower(0) + fs.getTotalCombatPower(1) + fs.getTotalCombatPower(2);
							if (fspower < config.fsPower)
								tipsLevel = config.fsPower - fspower;
							break;
						case ShowType.EQUIP:
							let point: number = UserBag.ins().getEquipsScoreByBodys();
							if (point < config.equipPower)
								tipsLevel = config.equipPower - point;
							break;
						case ShowType.XIAOFEI:
							let act: ActivityType1Data = Activity.ins().getActivityDataById(this.actId) as ActivityType1Data;
							if (act.hFTotalConsumption < config.consumeYuanbao)
								tipsLevel = config.consumeYuanbao - act.hFTotalConsumption;
							break;
						case ShowType.RING:
							let lvl = 0;
							let data = SpecialRing.ins().getSpecialRingDataById(SpecialRing.FIRE_RING_ID);
							if (data && data.level) lvl = data.level;
							if (lvl < config.huoyanRingLv) {
								tipsLevel = config.huoyanRingLv - lvl;
							}
							break;
						case ShowType.EXRING:
							let ringpower = SpecialRing.ins().getSpecailRingPower(SpecialRing.FIRE_RING_ID);
							if (ringpower < config.ringPower) {
								tipsLevel = config.ringPower - ringpower;
							}
						case ShowType.HEART:   //
							let heartPower = HeartMethod.ins().calHeartValue();
							if (heartPower < config.heartPower) {
								tipsLevel = config.heartPower - heartPower;
							}
							break;
					}
					if (!tipsLevel) {
						Activity.ins().sendReward(this.actId, this.index);
						return;
					}
					if (config.showType == ShowType.LEVEL && UserZs.ins().lv < config.zslevel)
						UserTips.ins().showTips(+tipsLevel + "转之后即可领取奖励");
					// else if( config.showType == ShowType.SHENZHUANG )
					// 	UserTips.ins().showTips("再升"+tipsLevel+"转即可抢取限量奖励");
					else if (config.showType == ShowType.BOOK)
						UserTips.ins().showTips("再升" + tipsLevel + "图鉴战力之后即领取奖励");
					else if (config.showType == ShowType.HUANSHOU)
						UserTips.ins().showTips("再升" + tipsLevel + "幻兽战力之后即领取奖励");
					else if (config.showType == ShowType.EQUIP)
						UserTips.ins().showTips("再升" + tipsLevel + "装备评分之后即领取奖励");
					else if (config.showType == ShowType.XIAOFEI)
						UserTips.ins().showTips("再消费" + tipsLevel + "之后即领取奖励");
					else
						UserTips.ins().showTips("再升" + tipsLevel + "级即可领取奖励");
				}

				break;
		}
	}

	protected dataChanged(): void {
		let config: ActivityType1Config = this.data;
		let data: ActivityType1Data = Activity.ins().getActivityDataById(config.Id) as ActivityType1Data;
		this.ActivityShowType(config);
		let role: Role = SubRoles.ins().getSubRoleByIndex(0);
		let idx: number = 0;
		for (let i = 0; i < 3; i++) {
			this["item" + i].visible = false;
		}
		for (let i = 0; i < config.rewards.length; i++) {
			let rd: RewardData = config.rewards[i];
			if (rd.job && rd.job != role.job) continue;
			this["item" + idx].visible = true;
			this["item" + idx].data = { type: rd.type, count: rd.count, id: rd.id };
			// if (this["item"+idx].getItemType() == 17)
			// 	this["item"+idx].showSpeicalDetail = false;
			// let cfg:ItemConfig = GlobalConfig.ItemConfig[rd.id];
			// if( cfg )
			// 	this["item"+idx].data = rd.id;
			// else{
			// 	this["item"+idx].data = {type:rd.type,count:rd.count,id:rd.id};
			// }
			idx++;
		}



		// if (config.zslevel > 0) {
		// 	// this.level.text = config.zslevel + "转";
		// 	// this.level.source = `level_${8 + config.zslevel}`;
		// } else {
		// 	// this.level.text = config.level + "级";
		// 	// this.level.source = `level_${config.level / 10}`;
		// }

		//控件按钮状态
		let btnType: number = data.getRewardStateById(config.index);
		let curget = data.rewardsSum[config.index];
		let sum = config.total ? (config.total - curget) : 1;
		sum = sum > 0 ? sum : 0;
		// this.redPoint.visible = this.getRedPoint(config);
		switch (btnType) {
			case Activity.NotReached:
				if (sum > 0) {
					this.currentState = "can";
				} else {
					this.currentState = "zero";
				}
				this.isGet = false;
				this.redPoint.visible = false;
				break;
			case Activity.CanGet:
				if (sum > 0) {
					this.currentState = "can";
				} else {
					this.currentState = "zero";
				}
				this.redPoint.visible = true;
				break;
			case Activity.Geted:
				this.currentState = "already";
				this.redPoint.visible = false;
				break;
		}
		this.get.touchEnabled = this.redPoint.visible;
		if (this.get.touchEnabled) {
			this.get.label = "领取";
			this.get.currentState = "up";
		} else {
			this.get.label = "未完成";
			this.get.currentState = "disabled";
		}

		if (config.total)
			this.num.text = "剩余" + sum + "份";
		else
			this.num.visible = false;
		this.actId = config.Id;
		this.index = config.index;
		// Activity.Geted
		// Activity.CanGet
		// Activity.NotReached
		if (config.showType == ShowType.XIAOFEI) {
			this.target.visible = this.recharge.visible = true;
			// this.target.text = `累计充值${config.consumeYuanbao}元宝`;
			this.target.visible = false;
			this.recharge.text = `${data.hFTotalConsumption}/${config.consumeYuanbao}`;
		} else {
			this.target.visible = this.recharge.visible = false;
		}




		// this.list.dataProvider = new eui.ArrayCollection(config.rewards);
		this.validateNow();
	}
	//红点
	private getRedPoint(config: ActivityType1Config) {
		switch (config.showType) {
			case ShowType.LEVEL://等级 / 转生达标
				let lv: number = config.level ? config.level : 0;
				let zslv: number = config.zslevel ? config.zslevel : 0;
				if (Actor.level >= lv && UserZs.ins().lv >= zslv)
					return true;
				break;
			case ShowType.LEVEL://翅膀
				if (WingsData.getWingAllLevel() >= config.wingLv)
					return true;
				break;
			case ShowType.ZHUZAO://铸造
				if (Role.getAllForgeLevelByType(PackageID.Zhuling) >= config.zzLv)
					return true;
				break;
			case ShowType.LONGHUN://天印
				if (LongHunData.getLongHunAllLevel() >= config.lhLv)
					return true;
				break;
			case ShowType.BOOK://图鉴达标
				// let power = Book.ins().getBookPown();
				// power = Book.ins().getBookPowerNum(power);
				let power = Book.ins().getBookPowerNumEx();
				if (power >= config.tjPower)
					return true;
				break;
			case ShowType.HUANSHOU:
				let petpower = UserHuanShou.ins().getTotalPower();
				if (petpower >= config.petPower)
					return true;
				break;
			case ShowType.MEIREN:
				let zlm = ZhanLingModel.ins();
				let zlpower = zlm.getTotalZhanLingPower();
				if (zlpower >= config.zlPower)
					return true;
				break;
			case ShowType.FLYSWORD:
				let fs = FlySword.ins()
				let fspower = fs.getTotalCombatPower(0) + fs.getTotalCombatPower(1) + fs.getTotalCombatPower(2);
				if (fspower >= config.fsPower)
					return true;
				break;
			case ShowType.EQUIP://装备达标
				let point: number = UserBag.ins().getEquipsScoreByBodys();
				if (point >= config.equipPower)
					return true;
				break;
			case ShowType.XIAOFEI://消费达标
				let act: ActivityType1Data = Activity.ins().getActivityDataById(this.actId) as ActivityType1Data;
				if (act.hFTotalConsumption >= config.consumeYuanbao) {
					return true;
				}
				break;
			case ShowType.RING://烈焰戒指等级
				let lvl = 0;
				let data = SpecialRing.ins().getSpecialRingDataById(SpecialRing.FIRE_RING_ID);
				if (data && data.level) lvl = data.level;
				return (lvl >= config.huoyanRingLv);
			case ShowType.EXRING://灵戒战力
				let exringpower = SpecialRing.ins().getSpecailRingPower(SpecialRing.FIRE_RING_ID)
				return (exringpower >= config.ringPower);
			case ShowType.HEART://心法等级
				let heartPower = HeartMethod.ins().calHeartValue();
				return (heartPower >= config.heartPower);
			default:
				return false;

		}

	}

	public destruct(): void {
		this.removeEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
	}
	private ActivityShowType(config: ActivityType1Config) {
		switch (config.showType) {
			case ShowType.LEVEL://等级
				this.lvName.text = "等级";
				if (!config.zslevel)
					this.lvName0.text = config.level + "";
				// 	BitmapNumber.ins().changeNum(this.bitNum,config.level,"attr",10);
				else {
					// 	this.bitNum.visible = false;
					// 	this.level.visible  = false;
					// 	this.zhuan.visible  = true;
					// 	this.zhuanLv.source = "attr"+config.zslevel+"_png";
					this.lvName0.text = config.zslevel + "转";
				}
				// if (config.Id == 15) {//转生达标 类型和0一样
				// 	this.lvName.text = "转生数";
				// 	this.lvName0.text = config.zslevel + "转";
				// }
				break;
			case ShowType.WING://翅膀
				this.lvName.text = "总等阶";
				// BitmapNumber.ins().changeNum(this.bitNum,config.wingLv,"attr",10);
				this.lvName0.text = config.wingLv + "";
				break;
			case ShowType.ZHUZAO://铸造
				this.lvName.text = "总等级";
				// BitmapNumber.ins().changeNum(this.bitNum,config.zzLv,"attr",10);
				this.lvName0.text = config.zzLv + "";
				break;
			case ShowType.LONGHUN://天印
				this.lvName.text = "总星数";
				// BitmapNumber.ins().changeNum(this.bitNum,config.lhLv,"attr",10);
				this.lvName0.text = config.lhLv + "";
				break;
			case ShowType.BOOK://图鉴达标
				this.lvName.text = "战力";
				// BitmapNumber.ins().changeNum(this.bitNum,config.szLv,"attr",10);
				this.lvName0.text = config.tjPower + "";
				break;
			case ShowType.HUANSHOU://幻兽达标
				this.lvName.text = "战力";
				this.lvName0.text = config.petPower + "";
				break;
			case ShowType.MEIREN://美人达标
				this.lvName.text = "战力";
				this.lvName0.text = config.zlPower + "";
				break;
			case ShowType.FLYSWORD://飞剑达标
				this.lvName.text = "战力";
				this.lvName0.text = config.fsPower + "";
				break;
			case ShowType.EQUIP://装备达标
				this.lvName.text = "评分";
				// BitmapNumber.ins().changeNum(this.bitNum,config.szLv,"attr",10);
				this.lvName0.text = config.equipPower + "";
				break;
			case ShowType.XIAOFEI://累消达标
				this.lvName.text = "消费";
				this.lvName0.text = config.consumeYuanbao + "";
				break;
			case ShowType.RING:
				this.lvName.text = "灵戒等级";
				let level = config.huoyanRingLv;
				let stage = SpecialRing.ins().getRingStair(level);
				let star = SpecialRing.ins().getRingStar(level);
				this.lvName0.text = stage + "阶" + star + "星";
				break;
			case ShowType.ZHANLING:
				this.lvName.text = "天仙等阶";
				let lv: number = config.zhanlingLv;
				this.lvName0.text = Math.ceil(lv / 10) + "阶" + (lv % 10 == 0 ? (lv ? 10 : 0) : lv % 10) + "星";
				break;
			case ShowType.EXRING:
				this.lvName.text = "战力";
				this.lvName0.text = config.ringPower + "";
			case ShowType.HEART:
				this.lvName.text = "天书战力";
				this.lvName0.text = config.heartPower + "";
				break;
		}
	}


}