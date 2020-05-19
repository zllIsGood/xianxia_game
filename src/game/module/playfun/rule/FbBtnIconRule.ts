/**
 * Created by Administrator on 2016/8/3.
 */
class FbBtnIconRule extends RuleIconBase {

	constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.updateMessage = [FbRedPoint.ins().postRedPoint];
	}

	checkShowIcon(): boolean {
		return OpenSystem.ins().checkSysOpen(SystemType.FB)  && !UserFb.ins().pkGqboss;
	}

	checkShowRedPoint(): number {
		return FbRedPoint.ins().redpoint ? 1 : 0;
	}

	tapExecute(): void {
		ViewManager.ins().open(FbWin);
	}
}