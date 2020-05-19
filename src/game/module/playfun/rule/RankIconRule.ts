/**
 * 排行榜
 */
class RankIconRule extends RuleIconBase {

	constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.updateMessage = [
			UserMail.ins().postMailData,
			UserMail.ins().postGetItemFromMail,
			Actor.ins().postLevelChange,
			UserFb.ins().postGuanqiaInfo,
			UserFb.ins().postGqIdChange,
		];
	}

	checkShowIcon(): boolean {
		return OpenSystem.ins().checkSysOpen(SystemType.RANK);
	}

	checkShowRedPoint(): number {
		if (OpenSystem.ins().checkSysOpen(SystemType.RANK)) {
			return 0;
		} else {
			return Rank.ins().canPraiseInAll() ? 1 : 0;
		}
	}

	tapExecute(): void {
		ViewManager.ins().open(RankingWin);
	}
}