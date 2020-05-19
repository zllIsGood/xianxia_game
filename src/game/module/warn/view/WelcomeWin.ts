/**
 * 欢迎面板
 */
class WelcomeWin extends BaseEuiView {

	public slogon: eui.Label;
	public sureBtn: eui.Button;
	// private sureBtnEff: MovieClip;
	// private eff: MovieClip;
	private sureGroup: eui.Group;
	private effgroup: eui.Group;
	private itemList: eui.List;

	constructor() {
		super();
		this.skinName = "welcomePanelSkin";
	}

	public initUI(): void {
		super.initUI();
		let str: string = LocationProperty.appid;
		if (str != "" && GlobalConfig.TerraceDescConfig[str]) {
			this.slogon.text = GlobalConfig.TerraceDescConfig[str].desc;
		} else {
			this.slogon.text = "";
		}
	}

	protected createChildren() {
		super.createChildren();
		this.validateNow();
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this, this.onTap);
		// this.playEff();
		this.tweenBtn();
		this.itemList.itemRenderer = ItemBase;
		this.itemList.dataProvider = new eui.ArrayCollection(GlobalConfig.WelcomeConfig[1].reward)
	}

	public close(...param: any[]): void {
		egret.Tween.removeTweens(this.sureBtn);
		egret.Tween.removeTweens(this.sureGroup);

	}
	private pic: eui.Image;
	public onTap(e: egret.TouchEvent): void {
		// ViewManager.ins().close(WelcomeWin);
		this.sureBtn.visible = false;
		let tw: egret.Tween = egret.Tween.get(this.sureGroup);
		let playPunView: PlayFunView = ViewManager.ins().getView(PlayFunView) as PlayFunView;
		if (!playPunView || !playPunView.location)
			return;
		let btn = playPunView.location;
		if (btn) {
			let gl = GameLogic.ins();
			let item = this.itemList.getElementAt(0) as ItemBase;
			let p: egret.Point = btn.localToGlobal();
			this.sureGroup.globalToLocal(p.x, p.y, p);
			tw.to({ scaleX: 0, scaleY: 0, x: p.x, y: p.y }, 500).call(() => {
				this.visible = false;
				gl.sendFirstRegisterReward(1);
				gl.postFlyItemTop(item);
			}).wait(200).call(() => {
				gl.postFlyItemTop(item);
			}).wait(200).call(() => {
				gl.postFlyItemTop(item);
				ViewManager.ins().close(WelcomeWin);
			});
		}

		if (GameMap.fbType == UserFb.FB_TYPE_STORY) {
			let uTask = UserTask.ins();
			uTask.checkTrace();
		}
	}

	public tweenBtn() {
		egret.Tween.removeTweens(this.sureBtn);
		egret.Tween.get(this.sureBtn).to(
			{ scaleX: 0.9, scaleY: 0.9 }, 500
		).to(
			{ scaleX: 1, scaleY: 1 }, 500
			).call(this.tweenBtn, this);
	}

}

ViewManager.ins().reg(WelcomeWin, LayerManager.UI_Popup);