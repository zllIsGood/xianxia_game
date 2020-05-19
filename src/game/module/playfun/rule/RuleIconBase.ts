/**
 * Created by wangzhong on 2016/7/20.
 */
class RuleIconBase {

	public static thisUpdate: Function;
	public static thisObj: any;

	public ruleName: string;
	/** 特效位置（checkShowEff中赋值） */
	effX: number;
	effY: number;
	effScale: number = 1;
	effParent: egret.DisplayObjectContainer;
	 /** 显示功能入口监听函数 */
	 showMessage: any[];

	layerCount: number = 1;

	tar: egret.DisplayObjectContainer;

	constructor(t: egret.DisplayObjectContainer) {
		this.tar = t;
	}

	/** 更新响应的事件 */
	updateMessage: any;

	checkShowIcon(): boolean {
		return true;
	}

	checkShowRedPoint(): number {
		return null;
	}

	getEffName(redPointNum: number): string {
		return null;
	}

	/** 执行 */
	tapExecute(): void {

	}

	update(): void {
		RuleIconBase.thisUpdate.call(RuleIconBase.thisObj, this);
	}

	addEvents(): void {
		if (!this.updateMessage) return;

		for (let fun of this.updateMessage) {
			MessageCenter.addListener(fun, this.update, this);
		}
	}

	removeEvent(): void {
		MessageCenter.ins().removeAll(this);
	}
}
