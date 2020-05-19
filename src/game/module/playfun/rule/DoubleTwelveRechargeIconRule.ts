/**
 * Created by Peach.T on 2017/12/6.
 */
class DoubleTwelveRechargeIconRule extends RuleIconBase{
	private firstTap: boolean = true;

	private alertText: eui.Label;
	private time: number;

	public constructor(t: egret.DisplayObjectContainer) {
		super(t);

		this.alertText = new eui.Label();
		// this.alertText.fontFamily = "黑体";
		this.alertText.size = 14;
		this.alertText.width = 120;
		this.alertText.textAlign = "center";
		this.alertText.textColor = 0x35e62d;
		this.alertText.horizontalCenter = 0;
		t.addChild(this.alertText);
		this.alertText.y = 70;

		this.updateMessage = [
			Activity.ins().postActivityIsGetAwards,
			Activity.ins().postChangePage,
			Activity.ins().postRewardResult,
			Recharge.ins().postUpdateRecharge,
			Recharge.ins().postUpdateRechargeEx,
			Actor.ins().postLevelChange
		];
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

	checkShowIcon(): boolean {
		if(!OpenSystem.ins().checkSysOpen(SystemType.DOUBLE_TWELVE_RECHARGE)){
			return false;
		}
		for (let k in Activity.ins().doubleTwelveRechargeData)
		{
			if (Activity.ins().doubleTwelveRechargeData[k].isOpenActivity()){

				let data = Activity.ins().doubleTwelveRechargeData[Activity.ins().doubleTwelveRechargeIDAry[0]] as ActivityType3Data;
				if (data) {
					TimerManager.ins().remove(this.runTime, this);
					this.time = data.getLeftTime();
					this.runTime();
					TimerManager.ins().doTimer(1000, 0, this.runTime, this);
				}
				return true;
			}
		}
		return false;
	}

	checkShowRedPoint(): number {
		let data = Activity.ins().doubleTwelveRechargeData;
		for (let k in Activity.ins().doubleTwelveRechargeData)
		{
			if (data[k].canReward())
			{
				return 1;
			}
		}
		return 0;
	}

	getEffName(redPointNum: number): string {
		if (this.firstTap || redPointNum) {
			this.effX = 38;
			this.effY = 55;
			return "actIconCircle";
		}
		return undefined;
	}

	tapExecute(): void {
		ViewManager.ins().open(DoubleTwelveRechargeWin);
		this.firstTap = false;
		this.update();
	}
}
