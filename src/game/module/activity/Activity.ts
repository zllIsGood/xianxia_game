/**
 * 活动数据
 */
class Activity extends BaseSystem {
    /** 未达成 */
    public static NotReached: number = 0;
    /** 可领取 */
    public static CanGet: number = 1;
    /** 已领取 */
    public static Geted: number = 2;

    /** 未击杀boss组 */
    public static NOKILL: number = 0;
    /** 已击杀boss组 */
    public static KILL: number = 1;
    /**活动数据 */
    public activityData: Map<ActivityBaseData> = {};

    /** 双十一活动数据 */
    public doubleElevenData: Map<ActivityBaseData> = {};

    /** 双十一活动ID */
    public doubleElevenIDs: Array<number> = [130, 150, 151, 152, 153, 156];

    /** 双十一特殊活动（有特殊时间限制） */
    public doubleElevenSpecialIDs: Array<number> = [150, 151, 152, 153];

    public doubleTwelveData: Map<ActivityBaseData> = {};

    public doubleTwelveIDAry: number[] = [221, 222, 223, 224];

    public doubleTwelveRechargeData: Map<ActivityBaseData> = {};

    public doubleTwelveRechargeIDAry: number[] = [225, 226, 227];

    /** 飞剑奇缘活动ID */
    public feijianHappyHoursID: number[] = [33];
    public feijianHappyHoursRed: boolean = false;

    /** 一元秒杀活动ID */
    public yymsID: number[] = [2010,2011,2012,2013,2014];
    public yymsRed: boolean = false;

    /**合服登录活动 */
    public hfLoginID: number = 157;
    public geLoginID: number = 210;
    //打开过的面板列表 根据活动id存的
    public palyEffList: boolean[] = [];

    //开启的达标活动的信息  0--当前达标榜的排名  1--这个
    /**当前 排行是否达标 */
    public isDaBiao: boolean;
    public isGetAward: boolean;
    public myDabiaoInfo: any;
    public myPaiming: any;
    public rankInfoList: DabiaoData[] = [];
    /** 登录天数*/
    public dayNum: number;
    /** 登录奖励是否已领*/
    public isAwards: number;
    /**当前达标奖励档位 前端从0开始*/
    public indexCurrDabiao: number = 0;

    public nextDayState: number = 0;
    /**类型5活动的累计登陆数据 需要优化到5里边 由于5号消息和原有2号7号消息流程冲突 服务器需要时间修改 这里暂时这样*/
    public LoginDayList: number[] = [];
    /**需要定时器检测的活动id*/
	private _actTimeSecond1: number[];//1秒检测列表

    public constructor() {
        super();

        this.sysId = PackageID.Activity;
        this.regNetMsg(1, this.doActivityData);
        this.regNetMsg(2, this.postRewardResult);
        this.regNetMsg(3, this.doDaBiaoInfo);
        this.regNetMsg(4, this.postIsGetAwards);
        this.regNetMsg(5, this.doRewardStatu);
        this.regNetMsg(6, this.postEnvelopeData);
        this.regNetMsg(7, this.postChangePage);
        this.regNetMsg(8, this.postRedEnvelopeData);
        this.regNetMsg(11, this.doSevenDayData);
        this.regNetMsg(12, this.doChangeSevenDayData);
        // this.regNetMsg(13, this.doLianxuData);

        this.regNetMsg(21, this.doNextDayLoginData);
        this.regNetMsg(20, this.doNextDayLoginReward);
        this.regNetMsg(22, this.postZeroElement);
        this.regNetMsg(24, this.postFirstChargeGroup);
        this.regNetMsg(26, this.postFundInfo);
        this.regNetMsg(31, this.postYYMSInfo);
    }

    public static ins(): Activity {
        return super.ins() as Activity;
    }

    protected initZero() {
        //0点重新请求活动数据
        if (this.activityData) {
            for (let id in this.activityData) {
                let activityId = +id;
                if (activityId < 10000) {
                    let config = GlobalConfig.ActivityConfig[id];
                    if (config) {
                        this.sendChangePage(activityId);
                        // if (config.activityType == 3) {
                        // }
                    }
                }
            }
        }
    }

    /** 获取活动数据 */
    public getActivityDataById(id: number): ActivityBaseData {
        return this.activityData[id];
    }

    /**  获得双十一活动数据*/
    public getDoubleElevenDataByID(id: number): ActivityBaseData {
        return this.doubleElevenData[id];
    }

    /** 获取打开过的面板列表 根据活动id存的 */
    public getPalyEffListById(id: number): boolean {
        return this.palyEffList[id];
    }

    /** 设置打开过的面板列表 根据活动id存的 */
    public setPalyEffListById(id: number, value: boolean): void {
        this.palyEffList[id] = value;
    }

    public getrankInfoListByIndex(index: number): DabiaoData {
        return this.rankInfoList[index];
    }

    /**
     * 初始化活动信息
     * 25-1
     * @param bytes
     */
    private doActivityData(bytes: GameByteArray): void {
        
        this.activityData = {};
        let count: number = bytes.readShort();
        for (let i = 0; i < count; i++) {
            let activityData: ActivityBaseData = ActivityDataFactory.create(bytes);
            if (activityData) {
                let id = activityData.id;
                if (this.doubleElevenIDs.indexOf(id) != -1) {
                    this.doubleElevenData[id] = activityData;
                }
                else if (this.doubleTwelveIDAry.indexOf(id) != -1) {
                    this.doubleTwelveData[id] = activityData;
                }
                else if (this.doubleTwelveRechargeIDAry.indexOf(id) != -1) {
                    this.doubleTwelveRechargeData[id] = activityData;
                }
                else {
                    this.activityData[id] = activityData;
                    this.sendOtherInfo(activityData.type, id);
                }

                if (this.feijianHappyHoursID.indexOf(id) != -1) {
                    //登录时，飞剑奇缘有红点
                    this.feijianHappyHoursRed = true;
                }

                if (this.yymsID.indexOf(id) != -1) {
                    //登录时，一元秒杀有红点
                    this.yymsRed = true;
                }
            }
        }

        let fundConfigKeys = Object.keys(GlobalConfig.ActivityType19Config);
        if (fundConfigKeys.length > 0) {
            let isFund: boolean = false;
            let id: number = Number(fundConfigKeys[0]);
            for (let key in this.activityData) {
                let data = this.activityData[key];
                if (data && data.id == id) {
                    isFund = true;
                    break;
                }
            }
            if (!isFund) {
                let activityData = new ActivityType19Data(null);
                let fundConfig = GlobalConfig.ActivityConfig[id];
                if (fundConfig) {
                    activityData.id = fundConfig.Id
                    this.activityData[id] = activityData;
                    this.sendFundInfo(id);
                }
            }
        }

        this.postActivityIsGetAwards();
        ActivityDataFactory.createEx();
        this.checkSpecials();
        // console.warn("下发红包协议1",this.activityData)
    }

    private checkSpecials(): void {
        TimerManager.ins().removeAll(this);
        this.postSpecials();

        var data: ActivityType2Data;
        for (var key in this.doubleElevenData) {
            if (this.doubleElevenSpecialIDs.indexOf(Number(key)) != -1) {
                data = this.doubleElevenData[key] as ActivityType2Data;
                if (!data.isSpecialOpen() && data.getSpecialOpenLeftTime()) {
                    TimerManager.ins().doTimer(data.getSpecialOpenLeftTime() * 1000, 1, this.checkSpecials, this);
                    return;
                }
            }
        }

    }

    /** 特殊活动变更 */
    public postSpecials(): void {

    }

    /**派发活动信息初始化 */
    public postActivityIsGetAwards(): void {

    }

    /**派发活动信息初始化给金蛋活动 */
    public postActivityIsGetAwards1(): void {
        this.is_send = false;
    }

    public postHuntResult(...params): any[] {
		return params;
	}

    /**冲榜排行红点更新 */
    public postActivityIsSeek(): void {
        RoleMgr.ins().isFirst = false;
    }

    /**
     * 领取结果
     * 25-2
     * @param bytes
     */
    public isSuccee = false;

    public postRewardResult(bytes: GameByteArray): number {
        this.isSuccee = bytes.readBoolean();
        let activityID = bytes.readInt();
        if (this.doubleElevenIDs.indexOf(activityID) != -1) {
            this.getDoubleElevenDataByID(activityID).update(bytes);
        }
        else if (this.doubleTwelveRechargeIDAry.indexOf(activityID) != -1) {
            this.doubleTwelveRechargeData[activityID].update(bytes);
        } else if (this.doubleTwelveIDAry.indexOf(activityID) != -1) {
            this.doubleTwelveData[activityID].update(bytes);
        }
        else {
            this.getActivityDataById(activityID).update(bytes);
        }
        this.postActivityPanel(activityID);
        this.postActivityIsGetAwards();

        return activityID;
    }

    /**派发更新单个活动界面,(目前是开赴活动) */
    public postActivityPanel(activityId: number): number {
        return activityId;
    }

    /**
     * 请求领取活动奖励
     * 25-2
     * actID  活动ID rewardID 奖励ID
     * 【注意】类型9活动
     * 发送顺序: 活动id 请求类型(0/1or2)
     * 第三个参数:非类型2
     * 请求类型0: 累计次数奖励
     * 请求类型1or2: 不需要参数 但会分单抽和多抽 单抽会需要再请求这条消息返回确切奖励(因为第一次是转盘转动中 返回index)  多抽则不需要
     * 类型2
     * 请求类型  0表示购买礼包, 非0表示领取额外奖励的索引
     */
    private is_send:boolean = false;
    public sendReward(actID: number, rewardID: number, param1?: any, param2 ?: any): void {
        let bytes: GameByteArray = this.getBytes(2);
        let cfg: ActivityConfig = GlobalConfig.ActivityConfig[actID];
        if (cfg && cfg.activityType == ActivityDataFactory.ACTIVITY_TYPE_9) {
            if (rewardID) {
                //请求类型1or2
                bytes.writeInt(actID);
                bytes.writeShort(rewardID);
            } else {
                //请求类型0
                bytes.writeInt(actID);
                bytes.writeShort(rewardID);
                bytes.writeByte(param1);
            }
        }
        else if (cfg && cfg.activityType == ActivityDataFactory.ACTIVITY_TYPE_22) {
            bytes.writeInt(actID);
            bytes.writeShort(rewardID);
            bytes.writeShort(param1);
        }
        else if (cfg && cfg.activityType == ActivityDataFactory.ACTIVITY_TYPE_25) {
			if (param1 == EnvelopeType.SEND) {
				bytes.writeInt(actID);
				bytes.writeShort(rewardID);
				bytes.writeShort(param1);
				if (param2)
					bytes.writeString(param2);
			} else if (param1 == EnvelopeType.GET) {
				bytes.writeInt(actID);
				bytes.writeUnsignedShort(rewardID);//红包id
				bytes.writeShort(param1);
            }
        }
        else if (cfg && cfg.activityType == ActivityDataFactory.ACTIVITY_TYPE_2) {
            bytes.writeInt(actID);
            bytes.writeShort(rewardID);
            let p1 = param1 ? param1 : 0;
            bytes.writeShort(p1);
        }
        else {
            bytes.writeInt(actID);
            bytes.writeShort(rewardID);
        }
        this.sendToServer(bytes);
        this.is_send = true;
    }

    // /*
    //  *连续充值数下推
    //  * 25-13
    //  * @param bytes
    //  */
    // private doLianxuData(bytes: GameByteArray): void {
    // 	let activityId: number = bytes.readInt();
    // 	(<ActivityType3Data>this.getActivityDataById(activityId)).updateData(bytes);
    // 	this.postActivityIsGetAwards();
    // }

    /*请求连续充值活动奖励*/
    public sendLianxuReward(actId: number): void {
        let bytes: GameByteArray = this.getBytes(13);
        bytes.writeInt(actId);
        this.sendToServer(bytes);
    }

    /*
     * 合服累计登录
     * 25-5
     * @param bytes
     */
    public doRewardStatu(bytes: GameByteArray): void {
        let activityId: number = bytes.readInt();
        let data: ActivityBaseData = this.getActivityDataById(activityId);
        if (data) {

            (<ActivityType5Data>data).updateData(bytes);
            this.LoginDayList[activityId] = (<ActivityType5Data>data).logTime;

            this.postActivityIsGetAwards();
        }
    }

    /*
     * 切换活动页面下发
     * 25-7
     * @param bytes
     */
    public postChangePage(bytes: GameByteArray): number {
        // 单份活动数据
        let activityData: ActivityBaseData = ActivityDataFactory.create(bytes);
        if (activityData) {
            let activityID: number = activityData.id;
            if (this.doubleElevenIDs.indexOf(activityID) != -1) {
                this.doubleElevenData[activityID] = activityData;
            }
            else if (this.doubleTwelveRechargeIDAry.indexOf(activityID) != -1) {
                this.doubleTwelveRechargeData[activityID] = activityData;
            }
            else if (this.doubleTwelveIDAry.indexOf(activityID) != -1) {
                this.doubleTwelveData[activityID] = activityData;
            }
            else {
                this.activityData[activityID] = activityData;
                this.sendOtherInfo(activityData.type, activityID);
            }
        }

        this.postActivityIsGetAwards();
        if (this.is_send)  this.postActivityIsGetAwards1()

        return activityData.id;
    }

    private sendOtherInfo(type: number, id: number): void {
        //零元活动
        if (type == ActivityDataFactory.ACTIVITY_TYPE_17) {
            this.sendZeroElementInfo(id);
        }
        else if (type == ActivityDataFactory.ACTIVITY_TYPE_18) {
            this.sendFirstChargeGroupInfo(id);
        }
        else if (type == ActivityDataFactory.ACTIVITY_TYPE_19) {
            this.sendFundInfo(id);
        }
    }

    /*
     * 切换活动页面发送
     * 25-7
     * @param bytes
     */
    public sendChangePage(actId: number): void {
        let bytes: GameByteArray = this.getBytes(7);
        bytes.writeInt(actId);
        this.sendToServer(bytes);
    }

    private doDaBiaoInfo(bytes: GameByteArray): void {
        this.dabiaoDecode(bytes);
        this.postGetDaBiaoInfo();
    }

    public postGetDaBiaoInfo(): void {

    }

    /**
	 * 请求红包数据
	 * 25-6
	 * @param id 活动id
	 * @param eid 红包id
	 * */
	public sendEnvelopeData(id: number, eid: number) {
		let bytes: GameByteArray = this.getBytes(6);
		bytes.writeInt(id);
        bytes.writeUnsignedShort(eid);
        // console.warn("活动id:"+id,"红包id:"+eid)
		this.sendToServer(bytes);
	}

    /**
	 * 返回红包数据
	 * 25-6
	 * */
	public postEnvelopeData(bytes: GameByteArray): void {
        // console.warn("下发红包信息")
		let id = bytes.readInt();
		let isSuccess = bytes.readByte();
		if (isSuccess) {
			let eId = bytes.readUnsignedShort();
			let job = bytes.readShort();
			let sex = bytes.readShort();
			let index = bytes.readShort();
			let serverId = bytes.readInt();
			let name = bytes.readString();
			let desc = bytes.readString();
			let eld: EnvelopeData = new EnvelopeData()
			eld.id = id;
			eld.eId = eId;
			eld.job = job;
			eld.sex = sex;
			eld.index = index;
			eld.serverId = serverId;
			eld.name = name;
			eld.desc = desc;

			this.postEnvelopeDataCall(eld);
			return;
		}
		this.postEnvelopeDataCall(null);
	}

	public postEnvelopeDataCall(eld: EnvelopeData) {
		return eld;
	}

    /*
     * 次日登录
     * 25-21
     * @param bytes
     */
    private doNextDayLoginData(bytes: GameByteArray): void {
        this.nextDayState = bytes.readShort();
        debug.log(this.nextDayState);
    }

    /*
     * 次日登陆领取
     * 25-20
     * @param bytes
     */
    private doNextDayLoginReward(bytes: GameByteArray): void {
        let state: number = bytes.readShort();
        if (state) {
            this.nextDayState = 2;
            UserTips.ins().showTips(StringUtils.addColor("领取奖励成功", 0xf3311e));
        }
    }

    /*发送次日登陆领取*/
    public sendNextDayReward(): void {
        let bytes: GameByteArray = this.getBytes(20);
        this.sendToServer(bytes);
    }


    /*请求达标信息*/
    public sendDabiaoInfo(dabiao: number): void {
        let bytes: GameByteArray = this.getBytes(3);
        bytes.writeInt(dabiao);
        this.sendToServer(bytes);
    }

    /*领取达标奖励*/
    public sendGetDabiaoReward(dabiao: number): void {
        let bytes: GameByteArray = this.getBytes(4);
        bytes.writeInt(dabiao);
        this.sendToServer(bytes);
    }

    /**收到达标活动状态 */
    private postIsGetAwards(bytes: GameByteArray): void {
        this.isGetAward = bytes.readBoolean();
    }


    /**
     * 发送领取七天登录奖励
     * @param day
     */
    public sendGetSevenDayAwards(day: number): void {
        let bytes: GameByteArray = this.getBytes(12);
        bytes.writeShort(day);
        this.sendToServer(bytes);
    }

    public doSevenDayData(bytes: GameByteArray): void {
        this.dayNum = bytes.readShort();
        this.isAwards = bytes.readInt();
        this.postSevendayIsAwards();
    }

    public doChangeSevenDayData(bytes: GameByteArray): void {
        let flag: boolean = bytes.readBoolean();
        if (flag) {
            let changeDay: number = bytes.readShort();
            this.isAwards = bytes.readInt();
            this.postSevendayAwardCallback();
        } else {
            UserTips.ins().showTips("|C:0xf3311e&T:背包已满，请清理背包|");
        }
        this.postSevendayIsAwards();
    }

    /**七天登录领取回调 */
    public postSevendayAwardCallback(): void {

    }

    /** 七天登录系统是否有奖励领取 */
    public postSevendayIsAwards(): void {

    }

    /** 次日登陆信息更新 */
    public postNextDayInfo(): void {

    }

    /**
     * 获取七天登录状态
     */
    public getSevenDayStast(): boolean {

        let day: number = DateUtils.DAYS_PER_WEEK;
        if (this.dayNum > 14)
            day = 14;
        else
            day = this.dayNum;
        for (let i: number = 1; i <= day; i++) {
            let config: LoginRewardsConfig = GlobalConfig.LoginRewardsConfig[i];
            if (config) {
                if (this.dayNum >= config.day) {
                    if ((this.isAwards >> config.day & 1) == 0)
                        return true;
                }
            }
        }
        return false;
    }

    public getSevenDayLogIsVisible(): boolean {
        return ((this.isAwards >> 14 & 1) == 0);
    }

    public getbtnInfo(str: string | number): ActivityBtnConfig {
        let config: ActivityBtnConfig[] = GlobalConfig.ActivityBtnConfig;
        if (config[str]) {
            return config[str];
        }
        return null;
    }

    /**
     * 是否显示红点（通过活动按钮信息）
     * @param  {ActivityBtnConfig} abc 活动按钮信息
     * @returns boolean
     */
    public isShowRedPointByBtnInfo(abc: ActivityBtnConfig): boolean {
        var result: boolean = false;
        result = this.checkAcCanGet(abc.id + "");
        return result;
    }

    //检查指定活动的id 是否可以领取奖励
    public checkAcCanGet(index: string): boolean {
        if (this.doubleElevenIDs.indexOf(Number(index)) != -1) {
            if (this.doubleElevenSpecialIDs.indexOf(Number(index)) != -1) {
                var specialData: ActivityType2Data;
                var len: number = this.doubleElevenSpecialIDs.length;
                for (var i: number = 0; i < len; i++) {
                    specialData = this.doubleElevenData[this.doubleElevenSpecialIDs[i]] as ActivityType2Data;
                    if (specialData.isSpecialOpen() && specialData.canReward())
                        return true;
                }
            }
            else {
                var doubleData: ActivityBaseData = this.doubleElevenData[Number(index)];
                if (doubleData.isOpenActivity() && doubleData.canReward())
                    return true;
            }

            return false;
        }

        if (this.doubleTwelveIDAry.indexOf(Number(index)) != -1) {
            for (let i in this.doubleTwelveData) {
                if (i == index && this.doubleTwelveData[i].isOpenActivity() && this.doubleTwelveData[i].type == 9) {
                    for (let j = 0; j < 3; j++) {
                        if (Activity.ins().isGetRollReward(this.doubleTwelveData[i].id, j)) return true;
                    }
                }
                return false;
            }
        }

        //飞剑奇缘活动，登录时显示红点，进入飞剑活动界面后去掉红点
        if (this.feijianHappyHoursID.indexOf(Number(index)) != -1) {
            let data: ActivityType20Data = this.activityData[index] as ActivityType20Data;
            if ( !this.feijianHappyHoursRed )
                return false;
            else
                return data && data.isOpenActivity() && !data.isAllPass();
        }

        //一元秒杀活动，登录时显示红点，进入一元秒杀界面后去掉红点
        if (this.yymsID.indexOf(Number(index)) != -1) {
            let data: ActivityType26Data = this.activityData[index] as ActivityType26Data;
            if ( !this.yymsRed )
                return false;
            else
                return data && data.isOpenActivity() && !data.isAllPass();
        }

        let data: Map<ActivityBaseData> = this.activityData;
		for (let k in data) {
			if (k == index && data[k].isOpenActivity() && data[k].canReward() && data[k].specialState()) {
				return true;
			}
		}
		return false;
    }

    //检查累计充值 是否可以领取奖励
    public checkOtherCharge2CanGet(): boolean {
        let rechargeData: RechargeData = Recharge.ins().getRechargeData(1);
        let config: ChongZhi2Config[] = GlobalConfig.ChongZhi2Config[((rechargeData.day / 7) >= 1) ? 2 : 1][rechargeData.day % 7];
        for (let k in config) {
            if (((rechargeData.isAwards >> config[k].index) & 1) == 0 && rechargeData.num >= config[k].pay) {
                return true;
            }
        }
        return false;
    }

    public dabiaoDecode(bytes: GameByteArray): void {
        this.isDaBiao = bytes.readBoolean();
        this.indexCurrDabiao = Math.max(bytes.readInt() - 1, 0);//服务器从1开始，前端为了方便取值，自-1,最小为0
        let rankType: number = bytes.readShort();
        if (rankType == RankDataType.TYPE_LEVEL) {
            bytes.readInt();
            bytes.readInt();
        } else if (rankType == RankDataType.TYPE_BAOSHI) {
            this.myDabiaoInfo = bytes.readInt();
        } else if (rankType == RankDataType.TYPE_ZHANLING) {
            let zj: number = bytes.readInt();
            let zx: number = bytes.readInt();
            this.myDabiaoInfo = [zj, zx]
        } else if (rankType == RankDataType.TYPE_LONGHUN) {
            this.myDabiaoInfo = bytes.readInt();
        } else if (rankType == RankDataType.TYPE_XIAOFEI) {
            this.myDabiaoInfo = bytes.readInt();
        } else if (rankType == RankDataType.TYPE_HF_XIAOFEI) {
            this.myDabiaoInfo = bytes.readInt();
            this.myPaiming = bytes.readInt();
        }
        else if (rankType == RankDataType.TYPE_ZHANLING) {
            let zj: number = bytes.readInt();
            let zx: number = bytes.readInt();
            this.myDabiaoInfo = [zj, zx]
        }
        else {
            this.myDabiaoInfo = bytes.readDouble();
        }
        let len: number = bytes.readShort();
        let data: DabiaoData;
        this.rankInfoList = [];
        for (let i: number = 0; i < len; i++) {
            if (!this.rankInfoList[i]) {
                this.rankInfoList.push(new DabiaoData());
            }
            data = this.rankInfoList[i];
            data.prase(bytes, rankType);
        }
    }

    //活动类型3
    public getisCangetDabiao3(id: number): boolean {
        let activityData: ActivityType3Data = Activity.ins().getActivityDataById(id) as ActivityType3Data;
        if (activityData.canOnlyReward) {
            activityData.canOnlyReward();
            return activityData.btn1 || activityData.btn2;
        } else {
            return this.checkAcCanGet(id + "");
        }
    }

    /**返回指定ID活动内是否有任意限购道具满足购买条件 */
    public getisCanBuyXianGou(actId: string): boolean {
        let rtn: boolean = false;
        let configList: ActivityType2Config[] = GlobalConfig.ActivityType2Config[actId];
        if (configList) {
            for (let i = 0; i < configList.length; i++) {
                rtn = this.getisCanBuyXianGouItem(actId, i);
                if (rtn) break;
            }
        }
        return rtn;
    }

    /**返回指定ID活动内指定index活动是否满足购买条件*/
    public getisCanBuyXianGouItem(actId: string, itemId: number): boolean {
        let rtn: boolean = false;
        let activityData: ActivityType2Data = Activity.ins().activityData[actId] as ActivityType2Data;
        let configList: ActivityType2Config[] = GlobalConfig.ActivityType2Config[actId];
        if (activityData && configList) {
            let config: ActivityType2Config = configList[itemId];

            let buyData: number = activityData.buyData[itemId] || 0;
            if (config && buyData) {
                let myMoney = (config.currencyType == 1 ? Actor.gold : Actor.yb);
                let a: boolean = (config.currencyType == 1);
                let b: boolean = (parseInt(myMoney + "") >= config.price);
                let c: boolean = (config.count - buyData > 0);
                rtn = a && b && c;
            }
        }
        return rtn;
    }

    /** 双十一是否有奖励可以领取 */
    public isDoubleElevenCanGet(): boolean {
        let data: Map<ActivityBaseData> = this.doubleElevenData;
        for (let k in data) {
            if ((data[k] as ActivityType2Data).isSpecialOpen() && data[k].canReward()) {
                return true;
            }
        }

        return false;
    }

    /**
	 * 下发红包数据
	 * 25-8
	 * */
    public HongData:ActivityType25Data;
	public postRedEnvelopeData(bytes: GameByteArray) {
		let id = bytes.readInt();
		if (this.activityData[id] && this.activityData[id] instanceof ActivityType25Data) {
            if (!this.HongData){
                this.HongData = this.activityData[id] as ActivityType25Data;
            }
			let control = bytes.readShort();
			let len = bytes.readShort();
			if (control == 1) {
				if (len) {//新增的红包必定是最新时间 客户端不作每次获得红包都排序  红包多了会耗性能
					let reld: RedEnvelope = new RedEnvelope();
					reld.id = bytes.readUnsignedShort();
					reld.timer = bytes.readInt();
					this.HongData.envelopeData.push(reld);//最新的红包放最后
                }
			}
			else {//发放所有红包要清本地红包数据
				let arr = [];
				for (let i = 0; i < len; i++) {
					let reld: RedEnvelope = new RedEnvelope();
					reld.id = bytes.readUnsignedShort();
					reld.timer = bytes.readInt();
					arr.push(reld);
				}
                this.HongData.envelopeData = arr;
			}

        }
	}

    /**
     * 判定是否在合服寻宝期间
     * @param 活动Id
     * */
    public IsHefuXunBaoTimer() {
        if (!GameServer._serverHeZeroTime)
            return false;//没合服

        let startTime = DateUtils.formatMiniDateTime(GameServer._serverHeZeroTime);//合服0点那天起
        let endTime = startTime + GlobalConfig.TreasureHuntConfig.hefuDay * 24 * 60 * 60 * 1000;
        let curTime = GameServer.serverTime;
        if (curTime >= startTime && curTime <= endTime) {
            return true;
        }
        return false;
    }

    /**
     * 判断某个积分页签下是否有可兑换
     * @param 页签转数
     **/
    public IsBossScoreTitle(id: number, title: number) {
        let actconfig: ActivityType7Config[] = GlobalConfig.ActivityType7Config[id];
        let actdata: ActivityType7Data = Activity.ins().getActivityDataById(id) as ActivityType7Data;
        for (let k in actconfig) {
            let cfg: ActivityType7Config = actconfig[k];
            if (cfg.title == title) {
                if (this.getIsBuy(cfg) && actdata.bossScore >= cfg.score) {
                    return true;
                }
            }
        }
        return false;
    }

    public getIsBuy(config: ActivityType7Config) {
        if (config) {
            let activityData: ActivityType7Data = Activity.ins().getActivityDataById(config.Id) as ActivityType7Data;
            if (config.count && activityData.personalRewardsSum[config.index] >= config.count) {
                return false;
            }
            if (config.scount && activityData.worldRewardsSum[config.index] >= config.scount) {
                return false;
            }
            return true;
        }

    }

    public getType7RedPoint(activityID: number) {
        let itemData: ItemData
        let config: ActivityType7Config[] = GlobalConfig.ActivityType7Config[activityID];
        let actdata: ActivityType7Data = Activity.ins().getActivityDataById(activityID) as ActivityType7Data;
        if (config[1].showType == ActivityType7Data.TYPE_LABA) {//腊八活动
			for (let i in config) {
				let state = actdata.getExchange(config[i].index);
				if (state == Activity.CanGet)
					return true;
			}
		} else {
            for (let i in config) {
                if (Activity.ins().getIsBuy(config[i])) {
                    if (config[i].itemId) {
                        itemData = UserBag.ins().getBagItemById(config[i].itemId);
                        if (itemData && itemData.count >= config[i].itemCount)
                            return true;
                    }
                    else if (actdata.bossScore >= config[i].score)
                        return true;
                }
            }
        }

        return false;
    }

    public getCurrentRingAwardIndex(record: number): number {
        let index = 1;
        if (record > 0) {
            while ((record >> index & 1) != 0) {
                index++;
            }
        }
        return index;
    }

    public getRingAward(index: number): ActivityType8Config {
        for (let i in GlobalConfig.ActivityType8Config) {
            let cfg: ActivityType8Config = GlobalConfig.ActivityType8Config[i][1];
            if (cfg.showType == ActivityType8Data.TYPE_RING) {//火焰戒指收费副本ID
                for (let j in GlobalConfig.ActivityType8Config[i]) {
                    if (j == index.toString()) {
                        return GlobalConfig.ActivityType8Config[i][j];
                    }
                }
            }
        }
        return null;
    }

    /**
     * 获取烈焰收费副本最后奖励
     * @returns {ActivityType8Config}
     */
    public getLastRingAward(): ActivityType8Config {
        let lastCfg: ActivityType8Config;
        for (let i in GlobalConfig.ActivityType8Config) {
            let cfg: ActivityType8Config = GlobalConfig.ActivityType8Config[i][1];
            if (cfg.showType == ActivityType8Data.TYPE_RING) {//火焰戒指收费副本ID
                for (let j in GlobalConfig.ActivityType8Config[i]) {
                    lastCfg = GlobalConfig.ActivityType8Config[i][j];
                }
            }
        }
        return lastCfg;
    }

    /**
     * 挑战烈焰副本时候添加事件监听，退出副本要重新打开挑战页面
     */
    public addEvent(): void {
        MessageCenter.addListener(GameLogic.ins().postEnterMap, this.openRingActivity, this);
    }

    /**
     * 挑战失败不打开挑战页面，移除事件监听
     */
    public removeEvent(): void {
        MessageCenter.ins().removeListener(GameLogic.ins().postEnterMap['funcallname'], this.openRingActivity, this);
    }

    public openRingActivity(): void {
        if (GameMap.fbType == 0) {
            MessageCenter.ins().removeListener(GameLogic.ins().postEnterMap['funcallname'], this.openRingActivity, this);
            ViewManager.ins().open(ActivityWin, 201);
            Activity.ins().sendChangePage(201);
        }
    }


    /**
     * 挑战飞剑副本时候添加事件监听，退出副本要重新打开挑战页面
     */
    public addFeijianFbEvent(): void {
        MessageCenter.addListener(GameLogic.ins().postEnterMap, this.openFeijianActivity, this);
    }

    /**
     * 挑战失败不打开挑战页面，移除事件监听
     */
    public removeFeijianFbEvent(): void {
        MessageCenter.ins().removeListener(GameLogic.ins().postEnterMap['funcallname'], this.openFeijianActivity, this);
    }

    public openFeijianActivity(): void {
        if (GameMap.lastFbTyp == UserFb.FB_TYPE_FEIJIANACT) {
            MessageCenter.ins().removeListener(GameLogic.ins().postEnterMap['funcallname'], this.openFeijianActivity, this);
            for (let i = 0; i < this.feijianHappyHoursID.length; i++) {
                let id: number = this.feijianHappyHoursID[i]
                let data: ActivityType20Data = this.activityData[id] as ActivityType20Data;
                if (data && data.isOpenActivity()) {
                    ViewManager.ins().open(ActivityWin, id, data.pageStyle);
                    Activity.ins().sendChangePage(id);
                }
            }
        }
    }

    public getType8RedPoint(activityID: number): boolean {
        let isRedPoint = false;
        let data: ActivityType8Data = Activity.ins().activityData[activityID] as ActivityType8Data;
        if (data && data.record == 0) {
            isRedPoint = true;
        }
        return isRedPoint;
    }

    public getType9RedPoint(activityID: number): boolean {
        let isRedPoint = false;
        let data: ActivityType9Data = Activity.ins().activityData[activityID] as ActivityType9Data;
        if (this.getRollSum(activityID)) {
            //是否有抽奖卷
            isRedPoint = true;
        } else {
            //是否有抽奖次数可领取判断
            let config: ActivityType9Config[] = GlobalConfig.ActivityType9Config[activityID];
            for (let i in config[0].reward) {
                //达到抽奖次数 并且未领取  抽奖次数奖励位第二位开始
                if (this.isGetRollReward(activityID, +i)) {
                    isRedPoint = true;
                    break;
                }
            }
        }
        return isRedPoint;
    }

    public getType10RedPoint(activityID: number): boolean {
        let data: ActivityType10Data = Activity.ins().activityData[activityID] as ActivityType10Data;
        let config: ActivityType10Config = GlobalConfig.ActivityType10Config[activityID][data.getLevel()];
        if (!config)
            return false;
        if (data.yb >= config.recharge && Actor.yb >= config.yuanBao)
            return true;
        return false;
    }

    public getType17RedPoint(activityID: number): boolean {
        let data: ActivityType17Data = Activity.ins().activityData[activityID] as ActivityType17Data;
        let config: ActivityType17Config[] = GlobalConfig.ActivityType17Config[activityID];
        if (!config)
            return false;

        return data.getIsCanReceived();
    }

    public getType18RedPoint(activityID: number): boolean {
        let data: ActivityType18Data = Activity.ins().activityData[activityID] as ActivityType18Data;
        let config: ActivityType18Config[] = GlobalConfig.ActivityType18Config[activityID];
        if (!config)
            return false;

        return data.getIsCanReceive();
    }

    public getType19RedPoint(activityID: number): boolean {
        let data: ActivityType19Data = Activity.ins().activityData[activityID] as ActivityType19Data;
        let config: ActivityType19Config[] = GlobalConfig.ActivityType19Config[activityID];
        if (!config)
            return false;

        return data.getIsCanReceive() && data.isBuy;
    }

    /**
     * 是否达到抽奖次数 并且未领取
     * @param 活动id
     * @param 领取的抽奖次数索引
     * */
    public isGetRollReward(activityID: number, id: number) {
        let data: ActivityType9Data = Activity.ins().activityData[activityID] as ActivityType9Data;
        if (!data) {
            data = Activity.ins().doubleTwelveData[activityID] as ActivityType9Data;
        }
        let config: ActivityType9Config[] = GlobalConfig.ActivityType9Config[activityID];
        if (config && config[0]) {
            if (config[0].reward[id].times && data.count >= config[0].reward[id].times && !(data.record >> (id + 1) & 1)) {
                return true;
            }
        }
        return false;
    }
    /**是否有抽奖卷*/
    public getRollSum(activityID: number): boolean {
        let config: ActivityType9Config[] = GlobalConfig.ActivityType9Config[activityID];
        if (config && config[0]) {
            let itemData: ItemData = UserBag.ins().getBagItemById(config[0].item);
            if (itemData) {
                return true;
            }
        }
        return false;
    }

    /**判断是否10连抽*/
    public getIsRollTen(activityID: number) {
        let config: ActivityType9Config = GlobalConfig.ActivityType9Config[activityID][0];
        if (config && config.item && config.yb) {
            let sum: number = 0;
            let item: ItemData = UserBag.ins().getBagItemById(config.item);
            if (item) {
                sum += item.count;
            }
            if (sum >= 10)
                return true;
            sum = 10 - sum;
            if (Actor.yb >= config.yb * sum)
                return true;
        } else if (config && config.yb) {
            return Actor.yb >= config.yb * 10;
        }
        return false;
    }

    /**
     * 零元礼包信息
     * 25-22
     * @param  {GameByteArray} bytes
     * @returns void
     */
    public postZeroElement(bytes: GameByteArray): void {
        let data = this.getActivityDataById(bytes.readInt());
        if (data) {
            (<ActivityType17Data>data).update(bytes);
        }
    }

    /**
     * 领取零元礼包
     * 25-22
     * @param  {number} activityID  活动id
     * @param  {number} index       礼包索引
     * @returns void
     */
    public sendReceiveZeroElement(activityID: number, index: number): void {
        let bytes: GameByteArray = this.getBytes(22);
        bytes.writeInt(activityID);
        bytes.writeShort(index);
        this.sendToServer(bytes);
    }

    /**
     * 请求零元礼包信息
     * 25-23
     * @param  {number} activityID  活动id
     * @returns void
     */
    public sendZeroElementInfo(activityID: number): void {
        let bytes: GameByteArray = this.getBytes(23);
        bytes.writeInt(activityID);
        this.sendToServer(bytes);
    }

    /**
     * 首充团购信息
     * 25-24
     * @param  {GameByteArray} bytes
     * @returns void
     */
    public postFirstChargeGroup(bytes: GameByteArray): void {
        let data = this.getActivityDataById(bytes.readInt());
        if (data) {
            (<ActivityType18Data>data).update(bytes);
        }
    }

    /**
     * 领取首充团购
     * 25-24
     * @param  {number} activityID  活动id
     * @param  {number} gear        档位
     * @param  {number} index       第几位奖励
     * @returns void
     */
    public sendFirstChargeGroup(activityID: number, gear: number, index: number): void {
        let bytes: GameByteArray = this.getBytes(24);
        bytes.writeInt(activityID);
        bytes.writeShort(gear);
        bytes.writeShort(index);
        this.sendToServer(bytes);
    }

    /**
     * 请求首充团购信息
     * 25-27
     * @param  {number} activityID  活动id
     * @returns void
     */
    public sendFirstChargeGroupInfo(activityID: number): void {
        let bytes: GameByteArray = this.getBytes(27);
        bytes.writeInt(activityID);
        this.sendToServer(bytes);
    }

    /**
     * 购买基金
     * 25-25
     * @param  {number} activityID  活动id
     * @returns void
     */
    public sendBuyFund(activityID: number): void {
        let config = GlobalConfig.ActivityType19Config[activityID][0];
        if (!config)
            return;

        WarnWin.show(`是否消耗${config.yb}元宝投资成长基金`, () => {
            if (Actor.yb < config.yb) {
                egret.setTimeout(() => {
                    UserTips.ins().showTips(`元宝不足`);
                }, this, 200);

                return;
            }

            if (UserVip.ins().lv < config.vip) {
                UserTips.ins().showTips(`vip等级不足`);
                return;
            }

            let bytes: GameByteArray = this.getBytes(25);
            bytes.writeInt(activityID);
            this.sendToServer(bytes);

        }, this);
    }

    /**
     * 领取基金
     * 25-26
     * @param  {number} activityID  活动id
     * @param  {number} index       第几份基金
     * @returns void
     */
    public sendReceiveFund(activityID: number, index: number): void {
        let bytes: GameByteArray = this.getBytes(26);
        bytes.writeInt(activityID);
        bytes.writeShort(index);
        this.sendToServer(bytes);
    }

    /**
     * 基金信息
     * 25-26
     * @param  {GameByteArray} bytes
     * @returns void
     */
    public postFundInfo(bytes: GameByteArray): void {
        let data = this.getActivityDataById(bytes.readInt());
        let cfg: ActivityConfig = GlobalConfig.ActivityConfig[data.id];
        if (cfg) {
            data.timeType = cfg.timeType;
            data.pageStyle = cfg.pageStyle || 0;
        }
        if (data) {
            (<ActivityType19Data>data).update(bytes);
        }
    }

    /**
     * 请求基金信息
     * 25-28
     * @param  {number} activityID
     * @returns void
     */
    public sendFundInfo(activityID: number): void {
        let bytes: GameByteArray = this.getBytes(28);
        bytes.writeInt(activityID);
        this.sendToServer(bytes);
    }

    /**
     * 飞剑奇缘活动
     * 25-29
     * @param  {GameByteArray} bytes
     */
    public postFlySword(bytes: GameByteArray) {
        let data = this.getActivityDataById(bytes.readInt());
        if (!data) return;
        (<ActivityType20Data>data).update(bytes);
    }

    /**
     * 进入飞剑副本
     * 25-29
     * @param  {number} actId
     */
    public sendEnterFlySwordFb(actId: number) {
        let bytes: GameByteArray = this.getBytes(29);
        bytes.writeInt(actId);
        this.sendToServer(bytes);
    }

    /**
     * 购买0元礼包
     * @param  {number} activityID
     * @param  {number} index
     * @returns void
     */
    public sendBuyZeroElement(activityID: number, index: number): void {
        let bytes: GameByteArray = this.getBytes(30);
        bytes.writeInt(activityID);
        bytes.writeShort(index);
        this.sendToServer(bytes);
    }

    /**
	 * 开红包消息派发
	 * @return [活动id,红包id,元宝,金币,所有玩家领取这个红包信息]
	 * */
	public postGetRedEnvelope(id: number, eid: number, yb: number, gold: number, arr: { job: number, sex: number, name: string, yb: number }[]) {
		return [id, eid, yb, gold, arr];
	}

    public get activityTimers() {
		this._actTimeSecond1 = this._actTimeSecond1 ? this._actTimeSecond1 : [];
		return this._actTimeSecond1;
    }
    
    /**
     * 一元秒杀信息
     * 25-31
     * @param  {GameByteArray} bytes
     * @returns void
     */
    public giftData:any[];
    public postYYMSInfo(bytes: GameByteArray): void {
        let activityId = bytes.readInt();
        let count: number = bytes.readShort();

        let arr = []
		for (let i = 1; i <= count; i++) {
			let reld = {
                index : bytes.readInt(),
                count : bytes.readShort()
            }
			arr.push(reld);
        }
        this.giftData = arr;
    }
}


class DabiaoData {
    public rankIndex: number;//名次
    public id: number;//玩家id
    public name: string;//名字
    public level: number;//等级
    public zsLevel: number;//转生等级
    public monthCard: number;//月卡标识
    public vipLv: number;//vip等级
    /**
     * 0--战力排行榜  表示战力
     * 5 等级  表示等级
     * 6 翅膀  翅膀等级
     * 7 战士     战士战力
     * 8 法师  法师战力
     * 9 术士  术士战力
     * 12 宝石  宝石等级
     * 13 天仙 int 天仙阶 int 天仙星
     * 14 龙印 int 龙印总等级
     */
    public numType: any;

    public prase(bytes: GameByteArray, rankType: number): void {

        if (rankType == RankDataType.TYPE_XIAOFEI || rankType == RankDataType.TYPE_HF_XIAOFEI) {
            this.rankIndex = bytes.readShort();
            this.id = bytes.readInt();
            this.name = bytes.readString();
            this.numType = bytes.readInt();
            return;
        }

        this.rankIndex = bytes.readShort();
        this.id = bytes.readInt();
        this.name = bytes.readString();
        this.level = bytes.readShort();
        this.zsLevel = bytes.readShort();
        this.monthCard = bytes.readShort();
        this.vipLv = bytes.readShort();

        if (RankDataType.TYPE_LEVEL != rankType) {
            if (rankType == RankDataType.TYPE_BAOSHI || rankType == RankDataType.TYPE_LONGHUN) {
                this.numType = bytes.readInt();
            } else if (rankType == RankDataType.TYPE_ZHANLING) {
                let zj: number = bytes.readInt();
                let zx: number = bytes.readInt();
                this.numType = [zj, zx];
            } else {
                this.numType = bytes.readDouble();
            }
        }
    }
}

namespace GameSystem {
    export let  activity = Activity.ins.bind(Activity);
}