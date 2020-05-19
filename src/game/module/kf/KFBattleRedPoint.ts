/**
 * Created by MPeter on 2017/12/4.
 * 跨服副本-红点管理器
 */
class KFBattleRedPoint extends BaseSystem {
	//无极战场红点
	public redPoint1: number = 0;

	//跨服boss红点
	public redPoint2: number = 0;

	public redPoint: number = 0;
	public constructor() {
		super();
		//无极战场红点
		this.associated(this.postRedPoint1,
			WJBattlefieldSys.ins().postInfo
		);

		//跨服boss
		this.associated(this.postRedPoint2,
			KFBossRedpoint.ins().postRedPoint
		);

		//总红点
		this.associated(this.postRedPoint,
			this.postRedPoint1,
			this.postRedPoint2,
		)
	}

	public static ins(): KFBattleRedPoint {
		return super.ins() as KFBattleRedPoint;
	}

	postRedPoint1(): boolean {
		//剩余次数
		if (WJBattlefieldSys.ins().overCounts > 0) {
			this.redPoint1 = 1;
			return true;
		}
		//有奖励可领取
		//...
		return false;
	}
	postRedPoint2(): number {
		this.redPoint2 = KFBossRedpoint.ins().redpoint;
		return this.redPoint2;
	}

	/**跨服战场总红点 */
	postRedPoint(): number {
		this.redPoint = this.redPoint1 + this.redPoint2;
		return this.redPoint;
	}
}
namespace GameSystem {
	export let  kfBattleRedpoint = KFBattleRedPoint.ins.bind(KFBattleRedPoint);
}
