/**
 * Created by Administrator on 2017/6/9.
 */
class FbRedPoint extends RedPointBase {
	constructor() {
		super();

		this.isOpen = true;

		this.registerTab(0,
			UserFb.ins().postFbInfo,
			UserFb.ins().postFbInfoUp,
			DieGuide.ins().postdieGuide,
			Actor.ins().postExp,
		);

		this.registerTab(1,
			UserFb.ins().postFbExpInfo
		);

		this.registerTab(2,
			UserFb2.ins().postUpDataInfo
		);

		this.registerTab(3,
			Millionaire.ins().postMillionaireInfo,
			Millionaire.ins().postTurnDice,
			Millionaire.ins().postRoundReward,
			Millionaire.ins().postMillionaireUpdate,
			BattleCC.ins().postOpenInfo,
			Actor.ins().postLevelChange,
			PaoDianCC.ins().postOpenInfo,
		)
	}

	/**
	 * 
	 * @param  {number} tab
	 * @returns boolean
	 */
	protected getTabRedPoint(tab: number): boolean {
		if (tab == 0) return UserFb.ins().hasCount();
		else if (tab == 1) return UserFb.ins().fbExpRed();
		else if (tab == 2) return (SkyLevelModel.ins().cruLevel > 1 && SkyLevelModel.ins().dayReward == 1) || SkyLevelModel.ins().lotteryRemainTimes > 0;
		else if (tab == 3) return false//BattleCC.ins().checkRedPoint() || Millionaire.ins().getRedPoint() || PaoDianCC.ins().checkRedPoint();
		return false;
	}
}

namespace GameSystem {
	export let  fbredpoint = FbRedPoint.ins.bind(FbRedPoint);
}