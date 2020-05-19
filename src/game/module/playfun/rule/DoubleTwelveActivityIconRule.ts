/**
 * 双12活动 ICON
 * Created by Peach.T on 2017/12/6.
 */
class DoubleTwelveActivityIconRule extends RuleIconBase{
	private firstTap: boolean = true;

	public constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.updateMessage = [
			Activity.ins().postActivityIsGetAwards,
			Activity.ins().postChangePage,
			Activity.ins().postRewardResult,
			Actor.ins().postLevelChange
		];
	}

	checkShowIcon(): boolean {
		if(!OpenSystem.ins().checkSysOpen(SystemType.DOUBLE_TWELVE)){
			return false;
		}
		for (let k in Activity.ins().doubleTwelveData)
		{
			if (Activity.ins().doubleTwelveData[k].isOpenActivity())
				return true;
		}
		return false;
	}

	checkShowRedPoint(): number {
		let data = Activity.ins().doubleTwelveData;
		for (let i in data)
		{
			if (data[i].isOpenActivity() && data[i].type == 9)
			{
				for(let j = 0; j < 3; j++){
					if(Activity.ins().isGetRollReward(data[i].id, j))return 1;
				}
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
		ViewManager.ins().open(DoubleTwelveWin);
		this.firstTap = false;
		this.update();
	}
}
