class LadderBtnIconRule extends RuleIconBase {
	constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.updateMessage = [
			Ladder.ins().postTadderChange,
			Encounter.ins().postEncounterDataChange,
			Mine.ins().postRedPoint
		];
	}

	checkShowIcon(): boolean {

		return (UserFb.ins().guanqiaID >= GlobalConfig.SkirmishBaseConfig.openLevel && !Encounter.ins().isGuiding && !UserFb.ins().pkGqboss);
	}

	checkShowRedPoint(): number {
		let num: number = Encounter.ins().isHasRed();
		if(num){
			return num;
		}
		if(Ladder.ins().checkRedShow()){
			return 1;
		}
		if(Mine.redpointCheck()){
			return 1;
		}
		return 0;
	}

	getEffName(redPointNum: number): string {
		// return "";
		return undefined;
	}


	tapExecute(): void {
		ViewManager.ins().open(LadderWin, 0);
	}
}