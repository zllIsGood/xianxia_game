/**
 * 跨服战场图标规则
 */
class KFIconRule extends RuleIconBase {
	public constructor(t: egret.DisplayObjectContainer) {
		super(t);

		this.updateMessage = [
			KFBattleRedPoint.ins().postRedPoint,
			DevildomRedPoint.ins().postRedPoint,
			KfArenaRedPoint.ins().postRedPoint
		];
	}

	checkShowIcon(): boolean {
		//跨服BOSS
		let boo: boolean = KFBossSys.ins().isOpen();
		return boo;
		// return false;
	}

	checkShowRedPoint(): number {
		return KFBattleRedPoint.ins().redPoint || DevildomRedPoint.ins().redPoint|| KfArenaRedPoint.ins().redpoint;
	}

	tapExecute(): void {
		ViewManager.ins().open(KFBattleWin);
	}
}