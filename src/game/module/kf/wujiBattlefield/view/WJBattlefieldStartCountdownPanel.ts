/**
 * Created by MPeter on 2017/11/30.
 * 跨服副本-无极战场开始倒计时面板
 */
class WJBattlefieldStartCountdownPanel extends BaseEuiView {
	/**倒计时数字 */
    private _count: eui.BitmapLabel;

	private _maxCount: number = 3;
	public constructor() {
		super();
		this.skinName = `WJBattleStartTipSkin`;
	}

	public initUI(): void {
		this._count = BitmapNumber.ins().createNumPic(0, "8", 5);
		this._count.x = 105;
		this._count.y = 350;
		this.addChild(this._count);
	}
	public open(...args): void {
		TimerManager.ins().doTimer(1000, this._maxCount+1, this.countdownFun, this);
		this.countdownFun();
	}
	public close(...args): void {
		TimerManager.ins().remove(this.countdownFun, this);
	}
    /**倒计时处理器 */
	private countdownFun(): void {
		if (this._maxCount <= 0) {
			ViewManager.ins().close(this);
			return;
		}
		BitmapNumber.ins().changeNum(this._count, this._maxCount, "8", 5);
		this._maxCount--;
	}

}
ViewManager.ins().reg(WJBattlefieldStartCountdownPanel, LayerManager.UI_Popup);