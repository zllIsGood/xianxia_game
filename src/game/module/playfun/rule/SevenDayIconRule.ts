/**
 * Created by wangzhong on 2016/7/20.
 */
class SevenDayIconRule extends RuleIconBase {

	private firstTap: boolean = true;

	constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.updateMessage = [
			Activity.ins().postSevendayIsAwards,
			Actor.ins().postLevelChange
		];
	}

	checkShowIcon(): boolean {
		return Actor.level >= 10 && Activity.ins().getSevenDayLogIsVisible();
	}

	checkShowRedPoint(): number {
		return Activity.ins().getSevenDayStast() ? 1 : 0;
	}

	getEffName(redPointNum: number): string {
		// if (this.firstTap || redPointNum) {
		// 	this.effX = 38;
		// 	this.effY = 38;
		// 	return "actIconCircle";
		// }
		return undefined;
	}


	tapExecute(): void {
		ViewManager.ins().open(SevenDayLogWin);
		this.firstTap = false;
		this.update();
	}
}