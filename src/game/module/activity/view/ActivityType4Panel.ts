/**
 *
 * @author hepeiye
 *
 */
class ActivityType4Panel extends ActivityPanel {
	private list: eui.List;
    private date: eui.Label;
    private desc: eui.Label;
    public label_DabiaoTarget: eui.Label;
    public list1: eui.List;
    public dabiao: ActivityType4Config;
    public dabiaoImg: eui.Image;
    public getReward: eui.Button;
    public rankName: eui.Label;
    public rankDesc: eui.Label;

    public label_nname1: eui.Label;
    public label_value1: eui.Label;
    public img_title1: eui.Image;
    public list_item1: eui.List;
    public list_item2: eui.List;
    public label_nname2: eui.Label;
    public label_value2: eui.Label;
    public list_item3: eui.List;
    public label_nname3: eui.Label;
    public label_value3: eui.Label;
    public list_item4: eui.List;
    public label_nname4: eui.Label;
    public label_value4: eui.Label;

    public btn_showRank: eui.Button;
    public btn_showRank0: eui.Button;
    public group_Rank: eui.Group;
    public imgTitle: eui.Image;

	private listData: eui.ArrayCollection;
	constructor() {
		super();
		this.skinName = "ActRaceSkin";
		this.list.itemRenderer = ActivityType4ItemRenderer;
		this.list1.itemRenderer = ItemBase;
	}

	protected childrenCreated(): void {
		super.childrenCreated();

		this.init();
    }
    
    public init() {
        this.listData = new eui.ArrayCollection;
        this.list.dataProvider = this.listData;
    }

	public open(...param: any[]): void {
		this.updateData();
        this.addTouchEvent(this.getReward, this.onClick);
        if (this.btn_showRank) {
            this.addTouchEvent(this.btn_showRank, this.onClick);
        }
        if (this.btn_showRank0) {
            this.addTouchEvent(this.btn_showRank0, this.onClick);
        }
        // this.observe(MessagerEvent.ACTIVITY4_IS_GET_AWARDS, this.refushBtnStatu);
        if (this.group_Rank) {
            this.group_Rank.visible = false;
        }
        if (this.btn_showRank && this.group_Rank) {
            this.btn_showRank.label = this.group_Rank.visible ? "查看奖励" : "查看排行";
        }
	}

	public close(...param: any[]): void {
		debug.log("close");
        this.removeTouchEvent(this.getReward, this.onClick);
        if (this.btn_showRank) {
            this.removeTouchEvent(this.btn_showRank, this.onClick);
        }
        if (this.btn_showRank0) {
            this.removeTouchEvent(this.btn_showRank0, this.onClick);
        }
        this.removeObserve();
	}


	public updateData() {
        let activityData: ActivityType4Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType4Data;
        let beganTime = Math.floor((DateUtils.formatMiniDateTime(activityData.startTime) - GameServer.serverTime) / 1000);
        let endedTime = Math.floor((DateUtils.formatMiniDateTime(activityData.endTime) - GameServer.serverTime) / 1000);
        if (beganTime >= 0) {
            this.date.text = "活动未开启";
        } else if (endedTime <= 0) {
            this.date.text = "活动已结束";
        } else {
            let day: number = Math.floor(endedTime / (3600 * 24));
            let hour: number = Math.floor((endedTime % (3600 * 24)) / 3600);
            let minu: number = Math.floor((endedTime % 3600) / 60);
            this.date.text = day + "天" + hour + "小时" + minu + "分";
        }
        this.desc.text = GlobalConfig.ActivityConfig[this.activityID].desc;

        let listData: ActivityType4Config[] = this.getDataList(activityData.id);
        this.listData.replaceAll(listData);

        let rewards: RewardData[] = this.getCurRewards();
        this.list1.dataProvider = new eui.ArrayCollection(rewards);

        this.refushBtnStatu();

        for (let i = 0; i < 4; i++) {
            let actConfig: ActivityType4Config = listData[i];
            let rankData: DabiaoData = Activity.ins().getrankInfoListByIndex[i];
            let idx: number = i + 1;

            let list_item: eui.List = this["list_item" + idx];
            let label_nname: eui.Label = this["label_nname" + idx];
            let label_value: eui.Label = this["label_value" + idx];

            let sName: string = "暂无";
            let sValue: string = "";

            if (rankData) {
                sName = rankData.name;
                switch (actConfig.rankType) {
                    case RankDataType.TYPE_LEVEL://等级
                        if (rankData.zsLevel > 0) {
                            sValue = rankData.zsLevel + "转" + rankData.level + "级";
                        } else {
                            sValue = rankData.level + "级";
                        }
                        break;
                    case RankDataType.TYPE_POWER://战力
                        sValue = CommonUtils.overLength(rankData.numType);
                        break;
                    case RankDataType.TYPE_WING://翅膀
                        sValue = CommonUtils.overLength(rankData.numType);
                        break;
                    case RankDataType.TYPE_JOB_ZS://战士
                        sValue = CommonUtils.overLength(rankData.numType);
                        break;
                    case RankDataType.TYPE_JOB_FS://法师
                        sValue = CommonUtils.overLength(rankData.numType);
                        break;
                    case RankDataType.TYPE_JOB_DS://术士
                        sValue = CommonUtils.overLength(rankData.numType);
                        break;
                    case RankDataType.TYPE_BAOSHI://宝石
                        sValue = rankData.numType + "级";
                        break;
                    case RankDataType.TYPE_ZHANLING://天仙
                        sValue = rankData.numType[0] + "阶" + rankData.numType[1] + "星";
                        break;
                    case RankDataType.TYPE_LONGHUN://龙印
                        sValue = rankData.numType + "级";
                        break;
                    case RankDataType.TYPE_XIAOFEI://消费
                        sValue = rankData.numType + '元宝';
                        break;
                }
            }

            if (list_item) {
                list_item.itemRenderer = ItemBase;
                list_item.dataProvider = new eui.ArrayCollection(actConfig.rewards);
            }

            if (label_nname) {
                label_nname.text = sName;
            }

            if (label_value) {
                label_value.text = sValue;
            }
		}
	}

	public refushBtnStatu(): void {
		//主动请求达标数据，防止达标领取红点不及时出现,其他活动有刷新红点需要也可在此循环里实现
        for (var k in Activity.ins().activityData) {
            var _data: ActivityBaseData = Activity.ins().activityData[k];
            if (_data && _data.type == 4 && _data.isOpenActivity()) {
                // App.ControllerManager.applyFunc(ControllerConst.Activity, ActivityFunc.SEND_DABIAO_INFO, _data.id);
				Activity.ins().sendDabiaoInfo( _data.id);
            }
        }
        
        var model: Activity = Activity.ins();
        var rewardStatus: number = this.getCurStatus();
        var curValue: number = this.getCurValue();
        switch (rewardStatus) {
            case 0:
                this.dabiaoImg.visible = false;
                this.getReward.visible = false;
                this.rankName.visible = true;
                this.rankDesc.visible = true;
                this.rankName.text = Actor.myName;
                break;
            case 1:
                this.rankName.visible = false;
                this.rankDesc.visible = false;
                this.dabiaoImg.visible = false;
                this.getReward.visible = true;
                break;
            case 2:
                this.rankName.visible = false;
                this.rankDesc.visible = false;
                this.dabiaoImg.visible = true;
                this.getReward.visible = false;
                break;
            default: debug.log("达标活动领奖状态不存在:" + rewardStatus);
        }


        switch (this.dabiao.rankType) {
            case RankDataType.TYPE_LEVEL://等级
                if (UserZs.ins().lv > 0) {
                    this.rankDesc.text = UserZs.ins().lv + "转" + Actor.level + "级";
                } else {
                    this.rankDesc.text = Actor.level + "级";
                }
                var zs: number = Math.floor(curValue / 1000);
                var lv: number = curValue % 1000;
                if (this.label_DabiaoTarget) this.label_DabiaoTarget.text = "达到等级\n" + (zs ? zs + "转" : "") + (lv + "级");
                break;
            case RankDataType.TYPE_POWER://战力
            case RankDataType.TYPE_WING://翅膀
            case RankDataType.TYPE_HEART_POWER://天书
            case RankDataType.TYPE_JOB_ZS://战士
            case RankDataType.TYPE_JOB_FS://法师
            case RankDataType.TYPE_JOB_DS://术士
                this.rankDesc.text = CommonUtils.overLength(Activity.ins().myDabiaoInfo);
                if (this.label_DabiaoTarget) this.label_DabiaoTarget.text = "达到战力\n" + curValue;
                break;
            case RankDataType.TYPE_BAOSHI://宝石
                this.rankDesc.text = Activity.ins().myDabiaoInfo + "级";
                if (this.label_DabiaoTarget) this.label_DabiaoTarget.text = "达到等级\n" + curValue;
                break;
            case RankDataType.TYPE_ZHANLING://天仙
                var tgZj: number = Math.floor(curValue / 1000);
                var tgZx: number = curValue % 1000;
                var myZj: number = Activity.ins().myDabiaoInfo[0];
                var myZx: number = Activity.ins().myDabiaoInfo[1];
                this.rankDesc.text = myZj + "阶" + myZx + "星";
                if (this.label_DabiaoTarget) this.label_DabiaoTarget.text = "达到星阶\n" + (tgZj ? tgZj + "阶" : "") + (tgZx + "星");;
                break;
            case RankDataType.TYPE_LONGHUN://龙印
                this.rankDesc.text = Activity.ins().myDabiaoInfo + "级";
                if (this.label_DabiaoTarget) this.label_DabiaoTarget.text = "达到等级\n" + curValue;
                break;
            case RankDataType.TYPE_XIAOFEI://消费
                this.rankDesc.text = Activity.ins().myDabiaoInfo + "元宝";
                if (this.label_DabiaoTarget) this.label_DabiaoTarget.text = "消费\n" + curValue + "元宝";
                break;

        }
	}

	private getDataList(id: number): ActivityType4Config[] {
		let config: any = GlobalConfig['ActivityType4Panel'][id];
		let list: ActivityType4Config[] = [];
		for (let k in config) {
			if (config[k].ranking == 0)
				this.dabiao = config[k];
			else
				list.push(config[k]);
		}
		return list;
	}

	private onClick(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.getReward:
				//  ControllerManager.ins().applyFunc(ControllerConst.Activity, ActivityFunc.SEND_DABIAO_REWARD, this.activityID);
				Activity.ins().sendGetDabiaoReward(this.activityID);
				break;
			case this.btn_showRank:
            case this.btn_showRank0:
                if (this.group_Rank) {
                    this.group_Rank.visible = !this.group_Rank.visible;
                    if (this.btn_showRank) {
                        this.btn_showRank.label = this.group_Rank.visible ? "查看奖励" : "查看排行";
                    }
                }
                break;
		}
	}

	public getCurValue(): number {
        var rtn: number = 0;
        // var idx: number = Math.min(Activity.ins().indexCurrDabiao, this.dabiao.value.length - 1);
        // var sunmit: Activity4configSunmit = this.dabiao.value[idx];
        // if (sunmit) {
        //     rtn = sunmit.value;
        // }
        return rtn;
    }

    public getCurRewards(): RewardData[] {
        var rtn: RewardData[] = [];
        // var idx: number = Math.min(Activity.ins().indexCurrDabiao, this.dabiao.value.length - 1);
        // var sunmit: Activity4configSunmit = this.dabiao.value[idx];
        // if (sunmit) {
        //     rtn = sunmit.rewards;
        // }
        return rtn;
    }

	/**0：不足 显示自身参数 1：满足 显示领取按钮 2：全部完成 */
    public getCurStatus(): number {
        var rtn: number = 0;
        // var model: Activity = Activity.ins();
        // if (Activity.ins().indexCurrDabiao >= this.dabiao.value.length) {
        //     rtn = 2;
        // } else if (model.isDaBiao) {
        //     rtn = 1
        // }
        return rtn;
    }
}
