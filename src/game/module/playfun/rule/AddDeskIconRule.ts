class AddDeskIconRule extends RuleIconBase {

	private clipShape: egret.Shape; // 进度遮罩

	constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.updateMessage = [
			Actor.ins().postLevelChange,
			Invite.ins().postDeskGiftState,
		];
	}

	checkShowIcon(): boolean {
		return LocationProperty.pf=="wanba" && Actor.level>=30;
	}

	checkShowRedPoint(): number {
		return Invite.ins().wanbaAddDeskReward==0?1:0;
	}

	tapExecute(): void {
		ViewManager.ins().open(AddDeskWin);
	}
}