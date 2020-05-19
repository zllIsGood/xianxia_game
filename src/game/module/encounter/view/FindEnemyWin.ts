/**
 *
 */
class FindEnemyWin extends BaseEuiView {

	private ok: eui.Button;
	private cancel: eui.Button;
	private closeBtn0: eui.Button;

	private yuanbao: eui.Label;
	private count: eui.Label;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "ZaoYuTip0Skin";
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn0, this.closeCB);
		this.addTouchEvent(this.cancel, this.closeCB);
		this.addTouchEvent(this.ok, this.buy);

		this.updateView();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn0, this.closeCB);
		this.removeTouchEvent(this.cancel, this.closeCB);
		this.removeTouchEvent(this.ok, this.buy);

	}

	private updateView(): void {
		this.yuanbao.text = GlobalConfig.SkirmishBaseConfig.refreshCost + "元宝";
		this.count.text = "（本日已主动寻找" + EncounterModel.refreshTimes + "次对手）";
	}

	private closeCB(e: egret.TouchEvent) {
		ViewManager.ins().close(this);
	}

	private buy(e: egret.TouchEvent) {
		if (Actor.yb >= GlobalConfig.SkirmishBaseConfig.refreshCost) {
			Encounter.ins().sendRefresh();
			Encounter.ins().postZaoYuRecord();
			ViewManager.ins().close(this);
		} else {
			UserTips.ins().showTips( "|C:0xf3311e&T:元宝不足|");
		}

	}

}
ViewManager.ins().reg( FindEnemyWin, LayerManager.UI_Main);