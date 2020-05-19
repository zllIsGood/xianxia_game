class ExpGoldIconRule extends RuleIconBase {
	private firstTap: boolean = true;

	constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.updateMessage = [
			UserVip.ins().postUpdateVipAwards
		];
	}

	checkShowIcon(): boolean {
		return (UserVip.ins().state >> 2 & 1) == 0;
	}

	checkShowRedPoint(): number {
		let boo: boolean = (UserVip.ins().state >> 2 & 1) == 0 && UserVip.ins().lv >= 3;
		return boo ? 1 : 0;
	}

	getEffName(redPointNum: number): string {
		// if (this.firstTap) {
		// 	this.effX = 38;
		// 	this.effY = 38;
		// 	return "actIconCircle";
		// }
		return undefined;
	}

	tapExecute(): void {
		ViewManager.ins().open(Vip3Win);
		this.firstTap = false;
		this.update();
	}
}