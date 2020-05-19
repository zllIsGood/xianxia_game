/**
 * Created by MPeter on 2017/12/15.
 * 复活面板
 */
class ReliveWin extends BaseEuiView {
	public killTips: eui.Label;
	public reliveTxt: eui.Label;
	public reliveTimesTxt: eui.Label;

	private remainM: number = 0;

	public constructor() {
		super();
		this.skinName = `ReliveSkin`;
	}

	public open(...param: any[]): void {

		this.remainM = param[0];
		let killer = param[1];
		if (killer)
			this.killTips.textFlow = new egret.HtmlTextParser().parser(`你被${StringUtils.addColor(`${killer}`, "#23C42A")}击败`);
		this.reliveTimesTxt.text = this.remainM + "秒";
		if (!TimerManager.ins().isExists(this.refushLabel, this))
			TimerManager.ins().doTimer(1000, this.remainM, this.refushLabel, this, this.overTime, this);
	}

	private refushLabel(): void {
		this.remainM--;
		this.reliveTimesTxt.text = this.remainM + "秒";
		if (this.remainM <= 0) this.overTime();
	}

	private overTime(): void {
		ViewManager.ins().close(this);
	}

}
ViewManager.ins().reg(ReliveWin, LayerManager.UI_Popup);