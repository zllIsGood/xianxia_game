/**
 * 跟随工具（目前用于掉落物拾取）
 */
class EaseToFollowUtils {
	public static easing: number = 0.04; //缓动值，决定跟随速度的快慢
	private static vx: number = 0;	//x轴速度
	private static vy: number = 0;	//y轴速度
	private static dx: number;	//目标与当前元件的x轴距离
	private static dy: number;	//目标与当前元件的y轴距离
	private static arrowArray: any[];	//储存跟随对象的数组
	private static callBack: Function;
	private static finishFunc: Function;
	private static followTarget: any;

	/**
	 * 开始缓动
	 * @params followers 跟随者
	 * @params followTarget 跟随目标
	 * @params callback
	 */
	public static startTweenMove(followers: any, followTarget: any, callback: Function, finishFunc?: Function): void {
		let itemsTemp: any[] = [];
		EaseToFollowUtils.followTarget = followTarget;
		// EaseToMouse.isFirst = true;
		if (typeof followers == "object") {
			for (let key in followers) {
				itemsTemp.push(followers[key]);
			}
		} else if (Array.isArray(followers)) {
			itemsTemp = followers;
		}
		EaseToFollowUtils.arrowArray = itemsTemp;
		EaseToFollowUtils.callBack = callback;
		EaseToFollowUtils.finishFunc = finishFunc;
		TimerManager.ins().remove(EaseToFollowUtils.onEnterFrame, EaseToFollowUtils);
		TimerManager.ins().doTimer(10, 0, EaseToFollowUtils.onEnterFrame, EaseToFollowUtils);
	}

	private static onEnterFrame(): void {
		if (Assert(EaseToFollowUtils.followTarget, "the easeToFollow followTarget is null")) return;
		let items: CharItem2[] = EaseToFollowUtils.arrowArray;
		//是否一条线缓动方式
		let isLine: boolean = items.length < 5;
		for (let i: number = 0; i < items.length; i++) {
			if (i > 0 && isLine) {
				EaseToFollowUtils.calEvery(items[i - 1].x, items[i - 1].y, items[i]);
			} else {
				if (items[i] == null) return;
				EaseToFollowUtils.calEvery(EaseToFollowUtils.followTarget.x, EaseToFollowUtils.followTarget.y - 50, items[i]);
			}
		}
	}

	private static isFirst: boolean = true;
	//计算每个元件的缓动，传入不同的目标值和缓动对象
	private static calEvery(targetX: number, targetY: number, currentArrow: any): void {
		EaseToFollowUtils.dx = targetX - currentArrow.x;
		EaseToFollowUtils.dy = targetY - currentArrow.y;
		// if (Math.abs(EaseToMouse.dx) <= 20 && Math.abs(EaseToMouse.dy) <= 20 && EaseToMouse.isFirst) {
		// 	EaseToMouse.isFirst = false
		// 	EaseToMouse.easing = 0.03;
		// }
		if (Math.abs(EaseToFollowUtils.dx) < 30 && Math.abs(EaseToFollowUtils.dy) < 30) {
			EaseToFollowUtils.vx = 0;
			EaseToFollowUtils.vy = 0;
			let index: number = EaseToFollowUtils.arrowArray.indexOf(currentArrow);
			if (index > -1) {
				EaseToFollowUtils.arrowArray.splice(index, 1);
				if (EaseToFollowUtils.callBack) {
					EaseToFollowUtils.callBack(currentArrow);
				}
			}
			if (EaseToFollowUtils.arrowArray.length == 0) {
				EaseToFollowUtils.dispose(currentArrow);
				return;
			}
		}
		else {
			EaseToFollowUtils.easing += 0.004;
			EaseToFollowUtils.vx = EaseToFollowUtils.dx * EaseToFollowUtils.easing;
			EaseToFollowUtils.vy = EaseToFollowUtils.dy * EaseToFollowUtils.easing;
		}
		currentArrow.x += EaseToFollowUtils.vx;
		currentArrow.y += EaseToFollowUtils.vy;
	}

	private static dispose(item: any): void {
        TimerManager.ins().remove(EaseToFollowUtils.onEnterFrame, EaseToFollowUtils);
		EaseToFollowUtils.followTarget = null;
		EaseToFollowUtils.callBack = null;
		EaseToFollowUtils.arrowArray = [];
		EaseToFollowUtils.easing = 0.04;

		if (EaseToFollowUtils.finishFunc) {
			EaseToFollowUtils.finishFunc();
			EaseToFollowUtils.finishFunc = null;
		}
    }
}