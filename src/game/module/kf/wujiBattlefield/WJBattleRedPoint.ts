/**
 * Created by MPeter on 2017/12/4.
 * 跨服副本-无极战场-红点管理器
 */
class WJBattleRedPoint extends BaseSystem {
	
	public constructor() {
		super();
		// this.associated(this.postDayReward,
		// 	GuildWar.ins().postDayRewardInfo
		// );
	}

	

}
namespace GameSystem {
	let wjBattleRedpoint = WJBattleRedPoint.ins.bind(WJBattleRedPoint);
}