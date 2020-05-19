/**
 * Created by MPeter on 2018/3/3.
 * 魔界入侵红点
 */
class DevildomRedPoint extends BaseSystem {
	/**未进入任意BOSS或者我进入的BOSS未死亡红点*/
	public redPoint: number = 0;

	public redPoints: boolean[] = [];

	public constructor() {
		super();
		this.associated(this.postRedPoint,
			DevildomSys.ins().postBossInfo,
			DevildomSys.ins().postInfo
		);
	}

	public postRedPoint(): void {
		this.redPoint = 0;
		let devildomSys = DevildomSys.ins();
		if (!devildomSys.isOpen())return;

		for (let id in devildomSys.killedState) {
			this.redPoints[id] = !devildomSys.killedState[id] && (!devildomSys.historyId || devildomSys.historyId == id);
		}

		this.redPoint = this.redPoints.indexOf(true) > -1 ? 1 : 0;
	}
}
namespace GameSystem {
	export let  devildomRedPoint = DevildomRedPoint.ins.bind(DevildomRedPoint);
}
