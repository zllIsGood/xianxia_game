/**
 * Created by MPeter on 2017/11/30.
 * 跨服副本-无极战场-匹配面板
 */
class WJBattlefieldMatchPanel extends BaseEuiView {
	/**取消按钮 */
	private cancelBtn: eui.Button;
	/**最小化按钮 */
	private minBtn: eui.Button;
	/**剩余时间标签 */
	private overTimersLabel: eui.Label;
	/**匹配字标签 */
	private matchLabel: eui.Label;


	///////////////////////////////////////////
	private matchTick: number = 0;
	private matchingStrs: string[] = [`.`, '..', '...'];
	public constructor() {
		super();
		this.skinName = `WJBattleMatchSkin`;

	}
	public open(...args): void {
		this.addTouchEvent(this.cancelBtn, this.onTouch);
		this.addTouchEvent(this.minBtn, this.onTouch);

		this.startMatch();
	}
	public close(...args): void {
		TimerManager.ins().removeAll(this);
	}

	/**最小化UI */
	private miniUI(): void {
		ViewManager.ins().close(this);
		//最小化,记录时间
		WJBattlefieldSys.ins().matchingTime = this.matchTick - egret.getTimer() / 1000;
	}
	/**触屏处理 */
	private onTouch(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.cancelBtn:
				WJBattlefieldSys.ins().sendCancelMatch();
				break;
			case this.minBtn:
				this.miniUI();
				break;
		}
	}
	/**开始匹配 */
	private startMatch(): void {
		this.matchTick = WJBattlefieldSys.ins().getMatchingTime();
        
		this.overTimersLabel.text = DateUtils.getFormatBySecond(this.matchTick >> 1);
		TimerManager.ins().doTimer(500, 0, () => {
			this.matchTick++;
			this.matchLabel.text = `匹配中${this.matchingStrs[this.matchTick % 3]}`;

			this.overTimersLabel.text = DateUtils.getFormatBySecond(this.matchTick >> 1);
		}, this);
	}

}
ViewManager.ins().reg(WJBattlefieldMatchPanel, LayerManager.UI_Popup);
