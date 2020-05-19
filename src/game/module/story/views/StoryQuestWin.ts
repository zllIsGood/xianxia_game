class StoryQuestWin extends BaseEuiView {
	public black: eui.Image;
	public npcImg: eui.Image;
	public labName: eui.Label;
	public labDesc: eui.Label;
	public list: eui.List;
	public sureBtn: eui.Button;
	public labAction: eui.Label;
	public guide: eui.Group;

	private data: AchievementData;

	private eff: MovieClip;

	public remainSec = 5;

	constructor() {
		super();
		this.skinName = `GuidePanelSkin`;
	}

	public tweenBlack() {
		if (!this.black) return;
		this.black.alpha = 0;
		egret.Tween.get(this.black).to({ alpha: 0.7 }, 600)
	}

	public open(data: AchievementData = UserTask.ins().taskTrace) {
		if (!data) return;
		this.data = data;
		this.addTouchEvent(this.sureBtn, this.sureBtnOntap);

		let role = EntityManager.ins().getNoDieRole();
		if (!role) return;

		let uTask = UserTask.ins();
		let cfg = uTask.getAchieveConfById(this.data.id);
		if (Assert(cfg, `cant find config by task id ` + this.data.id)) {
			ViewManager.ins().close(this);
			return;
		}

		this.labName.text = cfg.controlTarget[1] + "";
		this.npcImg.source = "resource/res/guide/" + cfg.controlTarget[2] + ".png";
		this.labDesc.text = cfg.controlTarget[3] + "";

		this.list.itemRenderer = ItemBase;
		let list = cfg.jobawardList || [];
		let jobAward = list[(role.infoModel as Role).job - 1] || []
		this.list.dataProvider = new eui.ArrayCollection(jobAward.concat(cfg.awardList));

		this.remainSec = 5;
		this.labAction.textFlow = TextFlowMaker.generateTextFlow(`|C:0x3BE504&T:${this.remainSec}|秒后自动领取`);
		TimerManager.ins().doTimer(1000, 5, this.cntTime, this, this.sureBtnOntap, this);

		if (this.data.id <= 100005 && !this.eff) {
			this.eff = new MovieClip;
			this.eff.playFile(RES_DIR_EFF + "guideff", -1);
			this.sureBtn.addChild(this.eff);
			this.eff.x = this.sureBtn.width / 2;
			this.eff.y = this.sureBtn.height / 2;
			this.tweenPoint();
		}

		this.guide.visible = this.data.id <= 100005;
		this.tweenBlack();
	}

	public static openCheck(): boolean {
		return !ViewManager.ins().getView(StoryQuestWin);
	}

	public cntTime() {
		this.remainSec--;
		this.labAction.textFlow = TextFlowMaker.generateTextFlow(`|C:0x3BE504&T:${this.remainSec}|秒后自动领取`)
	}

	public sureBtnOntap() {
		let uTask = UserTask.ins();
		let cfg = uTask.getAchieveConfById(this.data.id);
		if (!cfg || !cfg.controlTarget) return;
		let npcId = cfg.controlTarget[0];
		let npc = EntityManager.ins().getNPCById(npcId);
		if (!npc) return;
		uTask.sendVisitNpc(npcId);

		npc.hideTaskMc();
		egret.Tween.removeTweens(this.guide);
		ViewManager.ins().close(this);
	}

	public tweenPoint() {
		egret.Tween.removeTweens(this.guide);
		egret.Tween.get(this.guide).to(
			{ verticalCenter: 203 }, 1000
		).to(
			{ verticalCenter: 193 }, 1000
			).call(this.tweenPoint, this);
	}
}

ViewManager.ins().reg(StoryQuestWin, LayerManager.UI_Popup);