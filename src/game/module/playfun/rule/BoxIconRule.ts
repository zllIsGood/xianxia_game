/**
 * 宝箱
 */
class BoxIconRule extends RuleIconBase {
	private alertText: eui.Label;
	constructor(t: egret.DisplayObjectContainer) {
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

		if (BoxModel.ins().checkCanTake()) {
			this.alertText.text = `可领取`;
		} else {
			this.startTime();
			this.runTime();
		}

		this.updateMessage = [
			Box.ins().postUpdateData,
			Actor.ins().postLevelChange,
			Box.ins().postUpdateFreeBox,
			// BookRedPoint.ins().postRedPoint
		];
	}

	private startTime(){
		if(!TimerManager.ins().isExists(this.runTime,this))
		{
			TimerManager.ins().doTimer(1000, 0, this.runTime, this);
		}
	}

	private removeTime(){
		TimerManager.ins().remove(this.runTime,this);
	}

	private runTime(){
		let time = BoxModel.ins().getMinBoxTime();
		if (time == Number.MAX_VALUE) {
			this.alertText.text = '';
			this.removeTime();
		} else if(time <= 0) {
			this.alertText.text = `可领取`;
			this.removeTime();
			this.update();
		} else {
			this.alertText.text = DateUtils.getFormatBySecond(time, DateUtils.TIME_FORMAT_12);
		}
	}

	checkShowIcon(): boolean {
		return false;
		// let boo: boolean = GlobalConfig.TreasureBoxBaseConfig.openLevel <= Actor.level;
		// if(!boo) {
		// 	this.removeTime();
		// } else if(!BoxModel.ins().checkCanTake()) {
		// 	this.startTime();
		// }
		// return boo;
	}

	checkShowRedPoint(): number {
		let flag: boolean = BoxModel.ins().checkRedPointShow() || BookRedPoint.ins().redpoint;
		if (flag) {
			return 1;
		}
		return 0;
	}

	tapExecute(): void {
		ViewManager.ins().open(BoxBgWin);
	}

	getEffName(redPointNum: number): string {
		// if(BoxModel.ins().checkCanTake()) {
		// 	this.effX = 38;
		// 	this.effY = 38;
		// 	return "actIconCircle";
		// } else {
		// 	return '';
		// }
		return undefined;
	}
}