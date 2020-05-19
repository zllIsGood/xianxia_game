/**
 * Created by wangzhong on 2016/7/20.
 */
class GuangqiaIconRule extends RuleIconBase {
	private self;

	constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.updateMessage = [
			UserFb.ins().postGuanqiaInfo,
			UserFb.ins().postGqIdChange,
			UserTask.ins().postUpdteTaskTrace,
			UserFb.ins().postAutoPk,//闯关
			UserFb.ins().postAutoPk2,//更新副本
			CityCC.ins().postEnterCity,
			CityCC.ins().postEscCity,
		];

		this.self = t;
	}

	checkShowIcon(): boolean {
		return UserFb.ins().checkGuanqiaIconShow() && !UserFb.ins().pkGqboss && !CityCC.ins().isCity;
	}

	checkShowRedPoint(): number {
		let config: ChaptersRewardConfig = GlobalConfig.ChaptersRewardConfig[UserFb.ins().guanqiaReward];
		if (!config)
			return 0;
		let preConfig: ChaptersRewardConfig = GlobalConfig.ChaptersRewardConfig[UserFb.ins().guanqiaReward - 1];
		let needLevel: number = preConfig ? config.needLevel - preConfig.needLevel : config.needLevel;
		let curLevel: number = UserFb.ins().guanqiaID - (preConfig ? preConfig.needLevel : 0) - 1;
		let state: number = curLevel >= needLevel ? 1 : 0;
		return state || this.upDateGuanqiaWroldReward();
	}

	private upDateGuanqiaWroldReward(): number {
		let boxPass = UserFb.ins().getWorldGuanQia();
		return UserFb.ins().isReceiveBox(boxPass) ? 1 : 0;
	}

	private canChallen: boolean = false;

	getEffName(redPointNum: number): string {
		let eff: string = "";

		this.canChallen = UserFb.ins().isShowBossPK() && !UserFb.ins().bossIsChallenged;
		return eff;
	}

	tapExecute(): void {
		
	}
}