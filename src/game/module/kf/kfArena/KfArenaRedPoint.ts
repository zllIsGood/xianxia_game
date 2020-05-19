/**
 * Created by MPeter on 2018/3/12.
 * 跨服3v3竞技场 - 红点逻辑类
 */
class KfArenaRedPoint extends BaseSystem {
	/**总红点 */
	public redpoint: number = 0;
	/**匹配红点 */
	public redpoint_1: number = 0;
	/**参与红点 */
	public redpoint_2: number = 0;
	/**参与领取状态 */
	public joinState: number = 0;
	/*每个段位的是否领取红点 */
	public JoinRedPoint: number[] = [];
	/**段位红点 */
	public redpoint_3: number = 0;


	public constructor() {
		super();
		this.associated(this.postRedPoint,
			this.postRedPoint_1,
			this.postRedPoint_2
		);
		//匹配
		this.associated(this.postRedPoint_1,
			KfArenaSys.ins().postOpenKfArena,
			KfArenaSys.ins().postPlayerInfo
		);
		//参与和段位
		this.associated(this.postRedPoint_2,
			KfArenaSys.ins().postOpenKfArena,
			KfArenaSys.ins().postJoinRewards,
		);
	}

	public postRedPoint(): number {
		this.redpoint = this.redpoint_1 + this.redpoint_2 + this.redpoint_3;
		return this.redpoint;
	}

	public postRedPoint_1(): number {
		this.redpoint_1 = 0;
		if (!KfArenaSys.ins().isOpen()) return 0;
		this.redpoint_1 = KfArenaSys.ins().times;
		return this.redpoint_1;
	}

	public postRedPoint_2(): void {
		this.redpoint_2 = this.redpoint_3 = 0;
		this.joinState = 0;
		this.JoinRedPoint = [];
		let ins: KfArenaSys = KfArenaSys.ins();
		if (GlobalConfig.CrossArenaBase.openDay > GameServer.serverOpenDay + 1 || UserZs.ins().lv < GlobalConfig.CrossArenaBase.zhuanshengLevel || !ins.isServerOpen) return;
		let peakAwards: KfArenaPeakAwards[] = GlobalConfig.CrossArenaBase.peakAwards;
		let index: number = 1;
		let num = 0;
		let state: number = ins.dflState;
		for (let i in peakAwards) {
			if (((state >> index) & 1) != 1) {
				if (KfArenaSys.ins().dflCount >= peakAwards[i].count) {
					num++;
				}
			}
			if (((state >> index) & 1) != 1 && ins.dflCount >= peakAwards[i].count)
				this.JoinRedPoint[index] = 1;
			else
				this.JoinRedPoint[index] = 0;
			index++;
		}
		this.redpoint_2 = num;
		this.redpoint_3 = KfArenaSys.ins().dailyState == 0 ? 1 : 0;
		this.joinState = KfArenaSys.ins().dailyState == 0 ? 1 : 2;
	}

	public static ins(): KfArenaRedPoint {
		return super.ins() as KfArenaRedPoint;
	}

}
namespace GameSystem {
	export let  kfArenaRedPoint = KfArenaRedPoint.ins.bind(KfArenaRedPoint);
}
