class CDkeyIconRule extends RuleIconBase {

	constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.updateMessage = [
			UserFuLi.ins().postMoneyInfoChange,
			Notice.ins().postGameNotice,
			Actor.ins().postLevelChange,
			UserFb.ins().postGuanqiaInfo,
			UserFb.ins().postGqIdChange,
			DailyCheckIn.ins().postCheckInData,
			Activity.ins().postSevendayIsAwards,
			Recharge.ins().postFranchiseInfo,
		];
	}

	checkShowIcon(): boolean {
		return OpenSystem.ins().checkSysOpen(SystemType.FULI);
	}

	checkShowRedPoint(): number {
		if (DailyCheckIn.ins().showRedPoint()|| UserFuLiNotice.ins().awardState || Activity.ins().getSevenDayStast() || (Recharge.ins().franchise && Recharge.ins().franchiseget)) {
			return 1;
		}
		return 0;
	}

	getEffName(redPointNum: number): string {
		return undefined;
	}

	tapExecute(): void {
		ViewManager.ins().open(FuliWin);
		this.update();
	}
}