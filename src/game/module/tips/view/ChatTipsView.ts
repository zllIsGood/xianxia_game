class ChatTipsView extends eui.Component {

	public bg: eui.Image;
	public lab: eui.Label;

	private showOver: boolean = false;

	constructor() {
		super();
		this.skinName = "ChatMessage";
	}

	public setData(msg: ChatSystemData): void {
		this.lab.textFlow = TextFlowMaker.generateTextFlow(msg.str);

		this.setshowTime();
	}

	private setshowTime(): void {
		if (!this.showOver) {
			TimerManager.ins().remove(this.showOverInfo, this);
		}
		TimerManager.ins().doTimer(5000, 1, this.showOverInfo, this);
	}

	private showOverInfo(): void {
		this.showOver = true;
		DisplayUtils.removeFromParent(this);
	}
}