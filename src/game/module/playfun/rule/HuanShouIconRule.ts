class HuanShouIconRule extends RuleIconBase {

	constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.updateMessage = [
			UserBag.ins().postItemAdd,
			UserBag.ins().postItemDel,
			UserZs.ins().postZsLv,
			Actor.ins().postLevelChange,
			GameServer.ins().postServerOpenDay,
			HuanShouRedPoint.ins().postTotalRed,
			UserTask.ins().post9012Event,
			UserTask.ins().post9013Event,
		];
	}

	checkShowIcon(): boolean {
		return OpenSystem.ins().checkSysOpen(SystemType.HUANSHOU) && UserTask.ins().isCanAwake(UserTask.AWAKE_TASK_TYPE.HUANSHOU);
	}

	checkShowRedPoint(): number {
		return Number(HuanShouRedPoint.ins().totalRed) || 0;
	}

	tapExecute(): void {
		ViewManager.ins().open(HuanShouWin);
	}
}