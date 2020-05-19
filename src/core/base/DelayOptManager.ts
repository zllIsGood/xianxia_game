/**
 * Created by Saco on 2014/8/2.
 */
class DelayOptManager extends BaseClass {

	//每帧运算逻辑的时间阈值，执行代码超过这个时间就跳过到下一帧继续执行，根据实际情况调整，因为每一帧除了这里的逻辑还有别的逻辑要做对吧
	private TIME_THRESHOLD: number = 2;
	private _delayOpts: any[];

	public constructor() {
		super();
		this._delayOpts = [];
		egret.startTick(this.runCachedFun, this);
	}

	public static ins():DelayOptManager{
		return super.ins() as DelayOptManager;
	}

	public addDelayOptFunction(thisObj: any, fun: Function, funPara?: any, callBack?: Function, para?: any): void {
		this._delayOpts.push({ "fun": fun, "funPara": funPara, "thisObj": thisObj, "callBack": callBack, "para": para });
	}

	public clear(): void {
		this._delayOpts.length = 0;
	}

	// public stop(): void {
	// 	TimerManager.ins().remove(this.runCachedFun, this);
	// }

	private runCachedFun(time: number): boolean {
		if (this._delayOpts.length == 0) {
			return false;
		}
		let timeFlag = egret.getTimer();
		let funObj: any;
		while (this._delayOpts.length) {
			funObj = this._delayOpts.shift();
			if (funObj.funPara)
				funObj.fun.call(funObj.thisObj, funObj.funPara);
			else
				funObj.fun.call(funObj.thisObj);
			if (funObj.callBack) {
				if (funObj.para != undefined)
					funObj.callBack.call(funObj.thisObj, funObj.para);
				else
					funObj.callBack();
			}
			if (egret.getTimer() - timeFlag > this.TIME_THRESHOLD)
				break;
		}
		return false;
	}
}