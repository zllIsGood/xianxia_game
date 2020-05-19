/**
 * Created by MPeter on 2018/1/17.
 * 跨服副本-跨服boss系统红点
 */
class KFBossRedpoint extends BaseSystem {
	/**各个boss副本刷新点 */
	public redpoints: number[] = [];
	/**总红点 */
	public redpoint: number;
	public constructor() {
		super();
		//总红点
		this.associated(this.postRedPoint,
			KFBossSys.ins().postBossInfo,
			KFBossSys.ins().postBossRevive,
			KFBossSys.ins().postInfo,
		)

		//总红点
		// this.associated(this.postRedPoint,
		// 	this.postRedPoint1,
		// )
	}

	public postRedPoint(): number {
		this.redpoints = [];
		this.redpoint = 0;
		if (!KFBossSys.ins().isOpen()) return 0;
		for (let info of KFBossSys.ins().fbInfo) {
			if (!info) continue;
			let index: number = info.dpId;
			let dp = GlobalConfig.CrossBossConfig[info.dpId];
			let boo: boolean = UserZs.ins().lv >= dp.levelLimit[0] / 1000 && UserZs.ins().lv <= dp.levelLimit[1] / 1000;
			if (boo) boo = (info.flagRefTimer - egret.getTimer() < 0 && KFBossSys.ins().flagTimes > 0) || (info.bossRefTimer - egret.getTimer() < 0 && KFBossSys.ins().bossTimes > 0);//有刷新时间

			this.redpoints[info.dpId] = boo ? 1 : 0;
		}

		this.redpoint = this.redpoints.indexOf(1) > -1 ? 1 : 0;
		return this.redpoint;
	}
	public static ins(): KFBossRedpoint {
		return super.ins() as KFBossRedpoint;
	}
}
namespace GameSystem {
	export let  kfBossRedpoint = KFBossRedpoint.ins.bind(KFBossRedpoint);
}