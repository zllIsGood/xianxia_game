class RankingBtnIcon extends RuleIconBase {
	constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.updateMessage = [
			Rank.ins().postPraiseResult,
			Actor.ins().postLevelChange
		];
	}

	checkShowIcon(): boolean {
		return true;
	}

	tapExecute(): void {
		ViewManager.ins().open(RankingWin);
	}
}