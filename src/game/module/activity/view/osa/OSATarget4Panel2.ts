class OSATarget4Panel2 extends BaseView {

	public activityID: number;

	public actTime: eui.Label;
	private actDesc: eui.Label;

	private reward0: eui.List;//第一名奖励
	private reward1: eui.List;//第二名
	private reward2: eui.List;//第三名
	private reward3: eui.List;//4~20

	private name0: eui.Label;//第一名 名字
	private attrValue0: eui.Label;//几转几级
	private name1: eui.Label;//第二名 名字
	private attrValue1: eui.Label;//几转几级
	private name2: eui.Label;//第三名 名字
	private attrValue2: eui.Label;//几转几级

	private name21: eui.Label;//4-20名

	private myAttrValue: eui.Label;//我的排名
	private myRanking: eui.Label;//我所在排名区间
	private seek: eui.Button;//查看排行榜

	private rankList: eui.List;//排行榜
	private attr: eui.Label;//我的XXX描述
	private model: RankModel;
	private title: eui.Image;
	private titleName: eui.Image;
	private _time: number = 0;
	private titleEffGroup: eui.Group;
	private titleEffNameMc: MovieClip;
	private redPoint:eui.Image;
	constructor() {
		super();
		this.skinName = "OSARankSkin";
	}

	protected childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}

	public init() {
		this.reward0.itemRenderer = ItemBase;
		this.reward1.itemRenderer = ItemBase;
		this.reward2.itemRenderer = ItemBase;
		this.reward3.itemRenderer = ItemBase;
		// this.rankList.itemRenderer = OSATargetItemRender4;
		// this.updateData();
		if (!this.titleEffNameMc)
			this.titleEffNameMc = new MovieClip;
		if (!this.titleEffNameMc.parent)
			this.titleEffGroup.addChild(this.titleEffNameMc);
		this.titleEffNameMc.x = this.titleEffGroup.x;
		this.titleEffNameMc.y = this.titleEffGroup.y;

	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.seek, this.onTap);
		TimerManager.ins().doTimer(1000, 0, this.setTime, this);
		if (param) {
			this.model = param[0];
		}
		// this.rankList.visible = false;
		this.observe(Activity.ins().postGetDaBiaoInfo, this.updateData);
		let cfg: ActivityType4Config = GlobalConfig.ActivityType4Config[this.activityID][1];
		if (cfg && cfg.rankType == RankDataType.TYPE_HF_XIAOFEI)
			Activity.ins().sendDabiaoInfo(this.activityID);
		else
			this.updateData();

		this.redPoint.visible = RoleMgr.ins().isFirst;
	}

	private setTime() {
		if (this._time > 0) {
			this._time -= 1;
			this.actTime.text = DateUtils.getFormatBySecond(this._time, DateUtils.TIME_FORMAT_5, 3);
		}
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.seek, this.onTap);
		TimerManager.ins().removeAll(this);
		this.removeObserve();
	}


	private fitCond(rankdata: any, config: ActivityType4Config) {
		if (!rankdata) return false;
		let bFit = false;
		bFit = rankdata.value >= config.condValue;
		return bFit;
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.seek:
				Activity.ins().postActivityIsSeek();
				this.redPoint.visible = RoleMgr.ins().isFirst;
				let rankType: number = GlobalConfig.ActivityType4Config[this.activityID][0].rankType;
				let rankDataList: any[]
				let len: number
				if (!this.model) {
					rankDataList = Activity.ins().rankInfoList;
				} else {
					rankDataList = this.model.getDataList();
				}
				len = Math.min(rankDataList.length, 20);
				let arr = [];
				let activityData: ActivityType4Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType4Data;
				let costCurIndex: { idx: number } = { idx: 1 };//排名记录
				let curIndex = 1;
				for (let i = 1; i <= 20; i++) {
					let rankdata = rankDataList[curIndex - 1];
					if (!rankdata)
						break;

					let cfg = GlobalConfig.ActivityType4Config[this.activityID][i];
					if (!cfg)
						break;
					if (rankType == RankDataType.TYPE_HF_XIAOFEI) {
						//合服消费榜，只展示满足配置条件的玩家消费数据
						let rank: number = activityData.getCostRank(rankdata, costCurIndex);
						if (rank > 0) {
							arr.push({ rankData: rankDataList[i - 1], activityID: this.activityID, rank: rank });
							curIndex = curIndex + 1;
						}
					}else if (this.fitCond(rankdata, cfg)) {
						//其他排行榜
						arr.push({ rankData: rankDataList[curIndex - 1], activityID: this.activityID, pos: i });
						curIndex = curIndex + 1;
					}
					
				}
				// this.rankList.visible = true;
				// this.rankList.dataProvider = new eui.ArrayCollection(arr);
				ViewManager.ins().open(OSARankTipsWin, arr, rankType);
				break;
		}
	}

	private setMyRank() {

		//排行榜外 自己计算属性
		this.myAttrValue.text = "空";
		let rankType: number = GlobalConfig.ActivityType4Config[this.activityID][0].rankType;
		if (rankType == RankDataType.TYPE_HF_XIAOFEI) {
			if (Activity.ins().myPaiming == null || Activity.ins().myPaiming == 0) {
				this.myRanking.text = "20名以后";
			} else {
				// this.myRanking.text = Activity.ins().myPaiming + "";
				let activityData: ActivityType4Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType4Data;
				if (activityData.myPaiming)
					this.myRanking.text = activityData.myPaiming + "";
				else
					this.myRanking.text = "20名以后";
			}
		} else {
			this.myRanking.text = "20名以后";
		}
		switch (rankType) {
			case RankDataType.TYPE_BAOSHI://铸总等级造榜
				this.myAttrValue.text = Role.getAllForgeLevelByType(PackageID.Zhuling) + "";
				break;
			case RankDataType.TYPE_LONGHUN://天印总等级榜
				this.myAttrValue.text = LongHunData.getLongHunAllLevel() + "";
				break;
			case RankDataType.TYPE_WING://翅膀总等级榜
				this.myAttrValue.text = WingsData.getWingAllLevel() + "";
				break;
			case RankDataType.TYPE_BOOK://图鉴总战力
				// let power = Book.ins().getBookPown();
				// power = Book.ins().getBookPowerNum(power);
				let power = Book.ins().getBookPowerNumEx();
				this.myAttrValue.text = power + "";
				break;
			case RankDataType.TYPE_ZS://转生榜
				this.myAttrValue.text = UserZs.ins().lv + "";
				break;
			case RankDataType.TYPE_SCORE://装备总评分
				this.myAttrValue.text = UserBag.ins().getEquipsScoreByBodys() + "";
				break;
			case RankDataType.TYPE_HF_XIAOFEI:// 
				this.myAttrValue.text = Activity.ins().myDabiaoInfo ? Activity.ins().myDabiaoInfo : 0;
				break;
			case RankDataType.TYPE_HEART_POWER://心法战力
				console.warn(HeartMethod.ins().calHeartValue())
				this.myAttrValue.text = "" + HeartMethod.ins().calHeartValue();
				break;
		}
	}

	public updateData() {
		let rankType: number = GlobalConfig.ActivityType4Config[this.activityID][0].rankType;
		if (rankType == RankDataType.TYPE_HF_XIAOFEI)
			this.currentState = "hefu";
		else
			this.currentState = "kaifu";
		this.validateNow();

		let actcfg: ActivityConfig = GlobalConfig.ActivityConfig[this.activityID];
		let config: ActivityType4Config[] = GlobalConfig.ActivityType4Config[this.activityID];
		let rankDataList: any[];
		if (!this.model) {
			rankDataList = Activity.ins().rankInfoList;
		} else {
			rankDataList = this.model.getDataList();
		}
		if (!rankDataList) {
			// UserTips.ins().showTips(`排行榜${config[0].rankType}类型异常`);
			return;
		}

		let activityData: ActivityType4Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType4Data;
		let beganTime = Math.floor((DateUtils.formatMiniDateTime(activityData.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(activityData.endTime) - GameServer.serverTime) / 1000);
		if (beganTime >= 0) {
			this.actTime.text = "活动未开启";
		} else if (endedTime <= 0) {
			this.actTime.text = "活动已结束";
		} else {
			this._time = endedTime;
			if (this._time < 0) this._time = 0;
			this.actTime.text = DateUtils.getFormatBySecond(endedTime, DateUtils.TIME_FORMAT_5, 3);
		}

		this.actDesc.text = actcfg.desc;


		//获取第四名后的上榜条件描述
		let fourthCfg: ActivityType4Config = GlobalConfig.ActivityType4Config[this.activityID][4];
		if (fourthCfg) {
			this.name21.visible = true;
			this.name21.text = fourthCfg.condValue + this.getRankDescByType(rankType) + " 可上榜";
		} else {
			this.name21.visible = false;
		}

		// this.pos = bytes.readShort();//排名
		// this.id = bytes.readInt();//角色id
		// this.player = bytes.readString();//角色名
		// this.level = bytes.readShort();//等级
		// this.zslevel = bytes.readShort();//转生等级
		// this.viplevel = bytes.readShort();//vip等级
		// this.monthCard = bytes.readShort();//月卡
		// this.value = bytes.readInt();//对应排行属性值


		if (rankType == RankDataType.TYPE_HF_XIAOFEI) {
			this.costRank(rankDataList, config);
		} else {
			this.normalRank(rankDataList, config);
		}


		let btnCfg: ActivityBtnConfig = GlobalConfig.ActivityBtnConfig[this.activityID];
		if (btnCfg) {
			this.title.source = btnCfg.title;
		}
		//各榜描述
		switch (rankType) {
			case RankDataType.TYPE_BAOSHI://铸总等级造榜
				this.attr.text = "我的魔晶总等级：";
				break;
			case RankDataType.TYPE_LONGHUN://天印总等级榜
				this.attr.text = "我的龙印总等级：";
				break;
			case RankDataType.TYPE_WING://翅膀总等级榜
				this.attr.text = "我的翅膀总等阶：";
				break;
			case RankDataType.TYPE_BOOK://图鉴总战力
				this.attr.text = "我的图鉴总战力：";
				break;
			case RankDataType.TYPE_MEIREN://美人总战力
				this.attr.text = "我的天仙总战力：";
				break;
			case RankDataType.TYPE_HEART_POWER://心法总战力
				this.attr.text = "我的天书总战力：";
				break;
			case RankDataType.TYPE_HUANSHOU_POWER://幻兽总战力
				this.attr.text = "我的宠物总战力：";
				break;
			case RankDataType.TYPE_FLYSWORD_POWER://飞剑总战力
				this.attr.text = "我的飞剑总战力：";
				break;
			case RankDataType.TYPE_EXRING_POWER://灵戒战力
				this.attr.text = "我的灵戒总战力";
				break;
			case RankDataType.TYPE_ZS://转生榜
				this.attr.text = "我的总转生：";
				break;
			case RankDataType.TYPE_SCORE://
				this.attr.text = "我的装备总评分：";
				break;
			case RankDataType.TYPE_HF_XIAOFEI:
				this.attr.text = "我的消费：";
				break;
		}

		if (GlobalConfig.ActivityType4Config[this.activityID][0].titleEffName) {
			let ref = GlobalConfig.ActivityType4Config[this.activityID][0].titleEffName;
			this.titleEffNameMc.playFile(RES_DIR_EFF + ref, -1);
		} else {
			this.titleName.source = GlobalConfig.ActivityType4Config[this.activityID][0].titleName;
		}

	}


	/**
	*计算满足限制条件的排名
	*/
	private calMyRankByCondition(rankDataList: any[], config: ActivityType4Config[]): number {
		if (this.model) {
			if (this.model.selfPos) {
				if (this.model.selfPos <= 20) {
					let rankIndex = 1;
					for (let i = 1; i <= 20; i++ ) {
						let rankdata = rankDataList[rankIndex - 1];
						let cfg: ActivityType4Config = config[i];
						if (!rankdata)
							return 0;
						if (!cfg)
							return 0;
						if (rankdata.value >= cfg.condValue) {
							if (this.model.selfPos == rankIndex) {
								return i;
							}
							rankIndex = rankIndex + 1;
						}
					}
				}
			}
		}
		
		return 0;
	}


	/**
	*按排行榜类型获取上榜条件描述
	*/
	private getRankDescByType(rankType: number) {
		let descStr = "";
		switch(rankType) {
			case RankDataType.TYPE_BAOSHI:
			case RankDataType.TYPE_LONGHUN:
				descStr = "级";
				break;
			case RankDataType.TYPE_BOOK:
			case RankDataType.TYPE_MEIREN:
			case RankDataType.TYPE_HUANSHOU_POWER:
			case RankDataType.TYPE_FLYSWORD_POWER:
			case RankDataType.TYPE_EXRING_POWER:
				descStr = "";
				break;
			case RankDataType.TYPE_ZS:
				descStr = "转";
				break;
			case RankDataType.TYPE_WING:
				descStr = "阶";
				break;
			default:
				descStr = "";
				break;
		}
		return descStr;
	}



	/**消费榜*/
	private costRank(rankDataList: any[], config: ActivityType4Config[]) {
		/**初始化显示*/
		for (let z = 0; z < 4; z++) {
			if (this[`name${z}`])
				this[`name${z}`].visible = false;
			if (this[`name${z}1`])
				this[`name${z}1`].visible = false;

			let idx = z + 1;
			if (z == 2)
				idx = 4;
			else if (z == 3)
				idx = 6;
			let cfg: ActivityType4Config = config[idx];
			this[`reward${z}`].dataProvider = new eui.ArrayCollection(cfg.rewards);

			if (this[`attrValue${z}`]) {
				this[`attrValue${z}`].visible = true;
				this[`attrValue${z}`].text = `要求：${cfg.condValue}`;
			}
		}
		/**实际数据*/
		let curIndex: { idx: number } = { idx: 1 };//排名记录
		let activityData: ActivityType4Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType4Data;
		for (let k in rankDataList) {
			let rankdata = rankDataList[k];
			let i: number = activityData.getCostRank(rankdata, curIndex);//获取实际排名
			let cfg: ActivityType4Config = config[i];
			if (!i || !cfg || i > 5) continue;//此排名没上榜 往后的玩家也不会上 因为列表是有序的
			if (i == 1) {
				if (rankdata) {
					this[`name0`].visible = true;
					this[`attrValue0`].visible = this[`name0`].visible;
					if (!this.model) {//没有model
						this[`name0`].text = rankdata.name;
						this[`attrValue0`].text = "消费：" + rankdata.numType;
					} else {
						this[`name0`].text = rankdata.player;
						this[`attrValue0`].text = rankdata.value;
					}
				}
			} else {
				let nlabel = "";
				if (i == 2) {//2~3
					nlabel = "name1";
				} else if (i == 3) {
					nlabel = "name11";
					this[`attrValue1`].visible = false;
				} else if (i == 4) {//4~5
					nlabel = "name2";
				} else if (i == 5) {
					nlabel = "name21";
					this[`attrValue2`].visible = false;
				} else {
					continue;
				}
				cfg = config[i];
				let selfname = this[nlabel];
				selfname.visible = true;
				if (!this.model) {//没有model
					selfname.text = rankdata.name;
				} else {
					selfname.text = rankdata.player;
				}
			}
		}

		let cfg: ActivityType4Config = config[6];
		this[`reward3`].dataProvider = new eui.ArrayCollection(cfg.rewards);


		// for( let i = 0;i < 4;i++ ){
		// 	this[`reward${i}`].validateNow();
		// 	for( let j = 0;j < this[`reward${i}`].numElements;j++ ){
		// 		let item: ItemBase = this[`reward${i}`].getVirtualElementAt(j) as ItemBase;
		// 		if (item.getItemType() == 17)
		// 			item.showSpeicalDetail = false;
		// 	}
		// }

		if (this.model) {
			//有奖励就发回来的属性
			if (this.model.selfPos) {
				if (this.model.selfPos <= 20)
					this.myRanking.text = this.model.selfPos + "";
				else
					this.myRanking.text = "20名以后";
				if (rankDataList[this.model.selfPos - 1]) {
					this.myAttrValue.text = rankDataList[this.model.selfPos - 1].value;
				} else {
					this.setMyRank();
				}

			} else {
				this.setMyRank();
			}
		}
		else {
			this.setMyRank();
		}
	}
	/**通用榜*/
	private normalRank(rankDataList: any[], config: ActivityType4Config[]) {
		//todo:删除旧达标代码,达标活动现在用活动类型1
		let rank_index = 1;
		for (let i = 1; i <= 3; i++) {
			let cfg: ActivityType4Config = config[i];
			let rankdata = rankDataList[rank_index - 1];
			let bFitCond = false;
			if (rankdata) {
				this[`name${i - 1}`].visible = true;
				this[`attrValue${i - 1}`].visible = this[`name${i - 1}`].visible;
				if (!this.model) {//没有model
					this[`name${i - 1}`].text = rankdata.name; 
					// this[`attrValue${i-1}`].text = rankdata.zslevel + "转" + rankdata.level + "级";
					this[`attrValue${i - 1}`].text = "消费：" + rankdata.numType;
					bFitCond = rankdata.numType >= cfg.condValue;
				} else {
					this[`name${i - 1}`].text = rankdata.player;
					// this[`attrValue${i-1}`].text = rankdata.zslevel + "转" + rankdata.level + "级";
					this[`attrValue${i - 1}`].text = rankdata.value;
					bFitCond = rankdata.value >= cfg.condValue;
				}
				if (bFitCond){
					rank_index = rank_index + 1;
				}
			}

			if (!bFitCond) {
				let descStr = this.getRankDescByType(cfg.rankType);
				this[`name${i - 1}`].text = cfg.condValue + descStr + " 可上榜";
				this[`name${i - 1}`].visible = true;
				this[`attrValue${i - 1}`].visible = false;//this[`name${i - 1}`].visible;
			}

			this[`reward${i - 1}`].dataProvider = new eui.ArrayCollection(cfg.rewards);
		}

		let cfg: ActivityType4Config = config[4];
		this[`reward3`].dataProvider = new eui.ArrayCollection(cfg.rewards);

		if (this.model) {
			//有奖励就发回来的属性
			if (this.model.selfPos) {
				if (this.model.selfPos <= 20) {
					let myrank = this.calMyRankByCondition(rankDataList, config)
					if (myrank > 0) {
						this.myRanking.text = myrank + "";
					}
					else {
						this.myRanking.text = "20名以后";
					}
				} else {
					this.myRanking.text = "20名以后";
				}
				if (rankDataList[this.model.selfPos - 1]) {
					this.myAttrValue.text = rankDataList[this.model.selfPos - 1].value;
				} else {
					this.setMyRank();
				}

			} else {
				this.setMyRank();
			}
		}
		else {
			this.setMyRank();
		}
	}


}