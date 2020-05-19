class StoryAlertWinType1 extends StoryQuestWin {
	public npcImg: eui.Image;
	public labDesc: eui.Label;
	public sureBtn: eui.Button;
	public labAction: eui.Label;
	public guide: eui.Group;

	public remainSec = 5;

	constructor() {
		super();
		this.skinName = `GuidePanel2Skin`;
	}

	public open() {
		this.remainSec = 5;
		this.labAction.textFlow = TextFlowMaker.generateTextFlow(`|C:0x3BE504&T:${this.remainSec}|秒后自动领取`);
		TimerManager.ins().doTimer(1000, 5, this.cntTime, this, this.sureBtnOntap, this);
		this.tweenBlack();
		this.addTouchEvent(this.sureBtn, this.sureBtnOntap);
	}

	public close(){
		UserFb.ins().sendCreateRobot();
	}

	public static openCheck(): boolean {
		return !ViewManager.ins().getView(StoryAlertWinType1);
	}

	public sureBtnOntap() {
		ViewManager.ins().close(this);
	}

}

ViewManager.ins().reg(StoryAlertWinType1, LayerManager.UI_Popup);