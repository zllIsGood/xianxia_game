class StoryFinishWin extends BaseEuiView {
	public bgClose: eui.Rect;
	public btnSure: eui.Button;
	public guide: eui.Group;

	private eff: MovieClip;

	constructor() {
		super();
		this.skinName = `welcome2skin`;
	}

	public open() {
		this.addTouchEvent(this.btnSure, this.closeBtnOntap);
		if (!this.eff) {
			this.eff = new MovieClip;
			this.eff.playFile(RES_DIR_EFF + "guideff", -1);
			this.btnSure.addChild(this.eff);
			this.eff.x = this.btnSure.width / 2;
			this.eff.y = this.btnSure.height / 2;
			this.tweenPoint();
		}
	}

	public closeBtnOntap() {
		ViewManager.ins().close(this);
		egret.Tween.removeTweens(this.guide);
		DisplayUtils.removeFromParent(this.eff);
	}

	public tweenPoint() {
		egret.Tween.removeTweens(this.guide);
		egret.Tween.get(this.guide).to(
			{ verticalCenter: 150 }, 1000
		).to(
			{ verticalCenter: 130 }, 1000
			).call(this.tweenPoint, this);
	}
}

ViewManager.ins().reg(StoryFinishWin, LayerManager.UI_Popup);