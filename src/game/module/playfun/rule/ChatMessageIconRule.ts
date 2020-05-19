class ChatMessageIconRule extends RuleIconBase {

	constructor(t: egret.DisplayObjectContainer) {
		super(t);
	}

	checkShowRedPoint(): number {
		return 0;
	}


	tapExecute(): void {
		ViewManager.ins().open(ChatWin);
	}
}