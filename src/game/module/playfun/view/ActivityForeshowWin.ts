/**
 * 活动预告
 * Created by Peach.T on 2017/11/16.
 */
class ActivityForeshowWin extends BaseEuiView {

	public activityImg: eui.Image;

	public closeBtn:eui.Button;

	public daojishi0:eui.Label;

	constructor() {
		super();
		this.isTopLevel = true;
		this.skinName = "NewFuncNoticeSkin";
	}

	public open(...param: any[]): void {
		this.addCustomEvent();
		this.updateView();
	}

	private addCustomEvent(): void {
		this.addTouchEvent(this.closeBtn, this.closeWin)
		TimerManager.ins().doTimerDelay(1000, 1000, 0, this.refreshTime, this);
	}

	public closeWin():void
	{
		ViewManager.ins().close(this);
	}

	private updateView(): void {
		let cfg = ActivityForeshowModel.ins().getForeshow();
		if (cfg) {
			this.activityImg.source = cfg.pic;
		}
		this.refreshTime();
	}

	private refreshTime(): void {
		let timeDesc:string = DateUtils.getFormatBySecond(ActivityForeshowModel.ins().getRemainTime());
		this.daojishi0.text = timeDesc;
	}
}

ViewManager.ins().reg(ActivityForeshowWin, LayerManager.UI_Main);

