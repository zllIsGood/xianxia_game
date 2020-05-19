/**
 * Created by Administrator on 2017/3/7.
 */
class ChallengeInfoPanel extends BaseEuiView {

	public time: eui.Label;
	public levelLimit: eui.Label;
	public list: eui.List;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "ChuangtianguanBloodSkin";
		this.list.itemRenderer = ItemBase;
	}

	public open(...param: any[]): void {
		let dalay: number = SkyLevelModel.ins().limitTime;
		TimerManager.ins().doTimer(1000, dalay, this.setTimeLimit, this);
		this.refushInfo();
	}

	public close(...param: any[]): void {
	}

	private refushInfo(): void {
		let info: FbChallengeConfig = GlobalConfig.FbChallengeConfig[SkyLevelModel.ins().cruLevel + 1];
		if (info) {
			this.levelLimit.text = info.zsLevelLimit > 0 ? `${info.zsLevelLimit}转` : "" + `${info.levelLimit}级可挑战`;
			this.setTimeLimit();
		}
	}

	//设置倒计时
	private setTimeLimit(): void {
		let dalay: number = SkyLevelModel.ins().limitTime;
		this.time.text = DateUtils.getFormatBySecond(dalay, 3);
	}

}
ViewManager.ins().reg(ChallengeInfoPanel, LayerManager.Game_Main);