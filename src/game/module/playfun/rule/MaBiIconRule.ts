class MaBiIconRule extends RuleIconBase {
	private firstTap: boolean = true;
	constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.updateMessage = [
			Actor.ins().postLevelChange,
			UserExpGold.ins().postExpUpdate,
			UserVip.ins().postUpdataExp,
			UserVip.ins().postUpdateVipAwards,
		];
	}

	checkShowIcon(): boolean {
		var v = ViewManager.ins().getView(PlayFunView) as PlayFunView;
		if(WxTool.shouldRecharge()) {
			return v.btnGuanQiaGroup.visible && OpenSystem.ins().checkSysOpen(SystemType.MABI) && !(UserVip.ins().state >> 5 & 1);
		} else {
			return false;
		}

	}

	checkShowRedPoint(): number {
		return UserVip.ins().lv >= 6?1:0;
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
		this.firstTap = false;
		this.update();

		ViewManager.ins().open(Vip3MWin,6);

	}
}