class GuildWarRedBagIconRule extends RuleIconBase {

	constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.updateMessage = [
			GuildRedPoint.ins().postRedBag
		];
	}

	checkShowIcon(): boolean {
		return false;//GuildWar.ins().getModel().canSend || GuildWar.ins().getModel().canRod;
	}

	checkShowRedPoint(): number {
		return 0;
	}

	getEffName(redPointNum: number): string {
		// this.effX = 38;
		// this.effY = 38;
		// return "actIconCircle";
		return undefined;
	}

	tapExecute(): void {
		ViewManager.ins().open(RedBagWin);
	}
}