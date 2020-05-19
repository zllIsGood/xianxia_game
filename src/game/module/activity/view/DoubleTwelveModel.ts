/**
 * Created by Peach.T on 2017/12/6.
 */
class DoubleTwelveModel extends BaseClass {

	public static ins(): DoubleTwelveModel {
		return super.ins() as DoubleTwelveModel;
	}

	public getNeedRecharge(activityId: number): number
	{
		let data: ActivityType3Data = Activity.ins().doubleTwelveRechargeData[activityId] as ActivityType3Data;
		let cfg = GlobalConfig.ActivityType3Config[activityId][1];
		return Math.max(0, cfg.val - data.chongzhiTotal);
	}

}

namespace GameSystem {
	export let  doubleTwelveModel = DoubleTwelveModel.ins.bind(DoubleTwelveModel);
}
