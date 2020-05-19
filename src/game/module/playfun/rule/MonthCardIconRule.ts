class MonthCardIconRule extends RuleIconBase {
	private firstTap: boolean = true;
	private playPunView: PlayFunView;
	constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.updateMessage = [
			Actor.ins().postLevelChange,
			UserExpGold.ins().postExpUpdate
		];
		this.playPunView = ViewManager.ins().getView(PlayFunView) as PlayFunView;
	}

	checkShowIcon(): boolean {
		let b: boolean = true;
		if (Recharge.ins().monthDay > 0
			//&& Recharge.ins().franchise > 0
		) {
			b = false;
		}
		if(WxTool.shouldRecharge()) {
			return this.playPunView.btnGuanQiaGroup.visible && OpenSystem.ins().checkSysOpen(SystemType.MONTHCARD) && b;
		} else {
			return false;
		}
		// return false;
	}

	checkShowRedPoint(): number {
		return 0;
	}

	getEffName(redPointNum: number): string {
		if (this.firstTap) {
			this.effX = 38;
			this.effY = 55;
			return "actIconCircle";
		}
		return undefined;
	}

	tapExecute(): void {
		let index = 2;//月卡标签
		// if (Recharge.ins().monthDay > 0)
		// 	index = 3;//特权标签
		ViewManager.ins().open(FuliWin, index);
		this.firstTap = false;
		this.update();
	}
}