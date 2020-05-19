/**
 * Created by hrz on 2018/3/29.
 *
 * 日常副本红点
 */

class DailyFbRedPoint extends BaseSystem {
	redPoint: boolean = false;
	expRed: boolean = false;
	guardRed: boolean = false;
	demonRed: boolean = false;

	constructor() {
		super();

		//日常副本红点
		this.associated(this.postRedPoint,
			this.postExp,
			this.postGuardWeapon,
			// this.postDemonCircle,
		);

		//经验副本红点
		this.associated(this.postExp,
			UserFb.ins().postFbExpInfo,
		);

		//守护神剑
		this.associated(this.postGuardWeapon,
			UserZs.ins().postZsLv,//转生级别
			GameApp.ins().postZeroInit,//跨天
			UserFb.ins().postGuardInfo,
		);

		// //法阵副本
		// this.associated(this.postDemonCircle,
		// 	UserBag.ins().postItemAdd,
		// 	UserBag.ins().postItemChange,
		// 	DemonCir.ins().postFbInfo,
		// );
	}

	postRedPoint() {
		let old = this.redPoint;
		this.redPoint = this.expRed || this.guardRed || this.demonRed;
		return old != this.redPoint;
	}

	postExp() {
		let old = this.expRed;
		this.expRed = UserFb.ins().fbExpRed();
		return old != this.expRed;
	}

	postGuardWeapon() {
		let old = this.guardRed;
		this.guardRed = GuardWeaponModel.ins().canChallenge();
		return old != this.guardRed;
	}

	// postDemonCircle() {
	// 	let old = this.demonRed;
	// 	this.demonRed = DemonCir.ins().checkFb();
	// 	return old != this.demonRed;
	// }

	static ins(): DailyFbRedPoint {
		return super.ins() as DailyFbRedPoint;
	}
}

namespace GameSystem {
	export let dailyfbredpoint = DailyFbRedPoint.ins.bind(DailyFbRedPoint);
}