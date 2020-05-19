/**
 *  功能开启图标开启规则
 * Created by Peach.T on 2017/11/16.
 */
class FunctionOpenIconRule extends RuleIconBase {

	private alertText: eui.Label;

	private time: number;

	private dataCfg;

	constructor(icon: egret.DisplayObjectContainer) {
		super(icon);

		this.alertText = new eui.Label();
		// this.alertText.fontFamily = "黑体";
		this.alertText.size = 14;
		this.alertText.width = 120;
		this.alertText.textAlign = "center";
		this.alertText.textColor = 0x35e62d;
		this.alertText.horizontalCenter = 0;
		this.alertText.stroke = 1;
		this.alertText.strokeColor = 0x000000;
		icon.addChild(this.alertText);
		this.alertText.y = 80;

		this.updateMessage = [
			Actor.ins().postLevelChange,//级别变化校验是否显示
			GameApp.ins().postZeroInit//跨天要校验是否显示
		];
	}

	private getLeftTime() {
		let leftTime = 0;
		if (GameServer.serverOpenDay < this.dataCfg.close) {
			let date = new Date(GameServer.serverTime);
			let day = this.dataCfg.close - GameServer.serverOpenDay;
			date.setDate(date.getDate() + day);
			date.setHours(0, 0, 0, 0);
			leftTime = Math.floor((date.getTime() - GameServer.serverTime) / 1000);
		}
		return leftTime;
	}

	private runTime(): void {
		let time = this.time;
		this.time -= 1;
		if (time > 0) {
			this.alertText.text = DateUtils.getFormatBySecond(time, DateUtils.TIME_FORMAT_12)
		} else {
			this.alertText.text = "";
			TimerManager.ins().remove(this.runTime, this);
			this.update();
		}
	}

	public checkShowIcon(): boolean {
		let isShow = false;
		let cfg = ActivityForeshowModel.ins().getForeshow();
		if (cfg) {
			isShow = true;

			let cfg = ActivityForeshowModel.ins().getForeshow();
			if (cfg) {
				this.dataCfg = cfg;
				if (GameServer.serverOpenDay >= cfg.close) {
					this.alertText.text = "";
				} else {
					TimerManager.ins().remove(this.runTime, this);
					this.time = this.getLeftTime();
					this.runTime();
					TimerManager.ins().doTimer(1000, 0, this.runTime, this);
				}
				(this.tar as eui.Button).icon = cfg.icon;
			}
		}
		return isShow;
	}

	public checkShowRedPoint(): number {
		return 0;
	}

	public tapExecute(): void {
		ViewManager.ins().open(ActivityForeshowWin);
	}

}
