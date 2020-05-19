class SkyLevelModel {
	private static _instance: SkyLevelModel;

	public static ins(): SkyLevelModel {
		if (!this._instance) {
			this._instance = new SkyLevelModel();
		}
		return this._instance;
	}

	//当前的关卡等级  0--表示全部通关
	public cruLevel: number = 1;
	//是否通关最后一关
	public lastPass: boolean = false;
	//当前的阶级
	public stageLevel: number = 1;
	//当前是否领取过每日奖励  2--已领取   1--未领取
	public dayReward: number = 1;

	public dayRewardList: any[];
	//挑战副本剩余时间
	public limitTime: number = 180;
	//剩余领取次数
	public rewardTimes: number = 0;
	//通天塔已领取奖励索引
	public lotteryIndexs: number;
	//通天塔已经抽奖次数
	public lotteryUseTimes:number;
	//抽奖索引
	public lotteryAwards: number;
	//当前抽奖的索引
	public lotteryAwardIndex: number;

	public get lotteryRemainTimes():number
	{
		let remain:number = 0;
		let cfg:FbChallengeConfig;	
		if(this.cruLevel != 0){
			cfg = GlobalConfig.FbChallengeConfig[this.cruLevel - 1];
			if((this.cruLevel - 1) < GlobalConfig.FbChallengeBaseConfig.LotteryOpenLevel)return 0;
		}
		else
		{
			let len = Object.keys(GlobalConfig.FbChallengeConfig).length;
			cfg = GlobalConfig.FbChallengeConfig[len];
		}
		if(!cfg)return 0;
		remain = cfg.lotteryCount - this.lotteryUseTimes;
		return remain;
	}

	public isGetLotteryAward(index:number):boolean
	{
		return (this.lotteryIndexs >> index & 1) == 1;
	}

	//获取开启下个符文槽位的关卡等级
	public getNextOpenLevel(): FbChallengeConfig {
		let cfgList: FbChallengeConfig[] = GlobalConfig.FbChallengeConfig;
		for (let id in cfgList) {
			if (cfgList[id].id >= this.cruLevel && cfgList[id].showIcon) {
				return cfgList[id];
			}
		}
		return null;
	}

	//获取是否可以通关下一个关卡
	public getIsopenNext(): boolean {
		let cfgList: FbChallengeConfig[] = GlobalConfig.FbChallengeConfig;
		let cfg: FbChallengeConfig = cfgList[this.cruLevel];
		if (Actor.level >= cfg.levelLimit && Actor.zhuanShengLv >= cfg.zsLevelLimit)
			return true;
		return false;
	}

	public getSkyLevelList(): FbChallengeConfig[] {
		let dataList: FbChallengeConfig[] = [];
		let info: FbChallengeConfig[] = GlobalConfig.FbChallengeConfig;
		let cruInfo: FbChallengeConfig = info[this.cruLevel];
		let stageList: FbChallengeConfig[] = this.getStageList();
		let len: number = CommonUtils.getObjectLength(stageList);
		for (let str in stageList) {
			let cfg: FbChallengeConfig = stageList[str];
			if (this.checkIsPushInlist(cruInfo.layer, cfg.layer, len)) {
				dataList.push(cfg);
				if (dataList.length >= 6) {
					break;
				}
			}
		}
		dataList.reverse();
		return dataList;
	}

	public setLimtTimeDown(num: number): void {
		this.limitTime = num;
		TimerManager.ins().remove(this.timeDown, this);
		TimerManager.ins().doTimer(1000, num, this.timeDown, this);
	}

	private timeDown(): void {
		this.limitTime--;
		if (this.limitTime < 0) {
			this.limitTime = 0;
			TimerManager.ins().remove(this.timeDown, this);
		}
	}

	private checkIsPushInlist(id: number, layeId: number, len: number): boolean {
		if (id <= 4) {
			return true;
		} else if (id > 4) {
			let downNum: number = len - id >= 3 ? 3 : len - id;
			let upNum: number = 6 - downNum;
			let minLv: number = id - upNum;
			let maxLv: number = id + downNum;
			return layeId <= maxLv && layeId > minLv;
		}
	}

	private getStageList(): FbChallengeConfig[] {
		let info: FbChallengeConfig[] = GlobalConfig.FbChallengeConfig;
		let cruInfo: FbChallengeConfig = info[this.cruLevel];
		this.stageLevel = cruInfo.group;
		let list: FbChallengeConfig[] = [];
		if (!cruInfo) {
			return list;
		}
		for (let str in info) {
			let data: FbChallengeConfig = info[str];
			if (data.group == cruInfo.group) {
				list.push(data);
			}
		}
		return list;
	}

	public setCruLevelInfo(level: number): void {
		if (level > 0) {
			this.cruLevel = level;
			this.lastPass = false;
		} else {
			this.cruLevel = CommonUtils.getObjectLength(GlobalConfig.FbChallengeConfig);
			this.lastPass = true;
		}
	}
}