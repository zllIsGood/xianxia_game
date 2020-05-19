class GodWeaponIconRule extends RuleIconBase {
	// private alertText: eui.Label;
	private _time: number = 0;
	public constructor(t) {
		super(t);
		// this.alertText = new eui.Label();
		// // this.alertText.fontFamily = "黑体";
		// this.alertText.size = 14;
		// this.alertText.width = 120;
		// this.alertText.textAlign = "center";
		// this.alertText.textColor = 0x35e62d;
		// this.alertText.horizontalCenter = 0;
		// t.addChild(this.alertText);
		// this.alertText.y = 70;

		// if (GameServer.serverOpenDay >= GlobalConfig.GodWeaponBaseConfig.openDay) {
		// 	this.alertText.text = "";
		// } else {
		// 	this._time = this.getLeftTime();
		// 	this.runTime();
		// 	TimerManager.ins().doTimer(1000, 0, this.runTime, this);
		// }

		this.updateMessage = [
			GodWeaponRedPoint.ins().postGodWeapon,
			UserZs.ins().postZsLv,
			Actor.ins().postLevelChange
		];
	}

	// private getLeftTime() {
	// 	let leftTime = 0;
	// 	if (GameServer.serverOpenDay < GlobalConfig.GodWeaponBaseConfig.openDay) {
	// 		let date = new Date(GameServer.serverTime);
	// 		let day = GlobalConfig.GodWeaponBaseConfig.openDay - GameServer.serverOpenDay;
	// 		date.setDate(date.getDate() + day);
	// 		date.setHours(0, 0, 0, 0);
	// 		leftTime = Math.floor((date.getTime() - GameServer.serverTime) / 1000);
	// 	}
	// 	return leftTime;
	// }

	// private runTime(): void {
	// 	let time = this._time;
	// 	this._time -= 1;
	// 	if (time > 0) {
	// 		this.alertText.text = DateUtils.getFormatBySecond(time, DateUtils.TIME_FORMAT_12)
	// 	} else {
	// 		this.alertText.text = "";
	// 		TimerManager.ins().remove(this.runTime, this);
	// 		this.update();
	// 	}
	// }

	checkShowRedPoint(): number {
		let num: number = GodWeaponRedPoint.ins().godWeaponRed ? 1 : 0;
		return num;
	}
	checkShowIcon(): boolean {
		if (Actor.level >= GlobalConfig.GodWeaponBaseConfig.noticeOpenLv && (GameServer.serverOpenDay >= GlobalConfig.GodWeaponBaseConfig.openDay)) {
			return true;
		} else {
			return false;
		}
		// return GodWeaponWin.openCheck(true);
	}

	tapExecute(): void {
		ViewManager.ins().open(GodWeaponWin);
	}
}