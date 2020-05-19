/**
 * Created by hujinheng on 2017/11/20
 */
class ThanksIconRule extends RuleIconBase {

	private firstTap: boolean = true;

	constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.updateMessage = [
			Activity.ins().postActivityIsGetAwards,
			Actor.ins().postYbChange,
			Actor.ins().postLevelChange,
			Recharge.ins().postUpdateRecharge,
			UserFb.ins().postGuanqiaInfo,
			UserFb.ins().postGqIdChange,
			Recharge.ins().postRechargeTotalDay,
			Recharge.ins().postUpdateRechargeEx
		];
	}

	checkShowIcon(): boolean {
		if(!OpenSystem.ins().checkSysOpen(SystemType.THANKS)) return false;

		let sum:string[] = Object.keys(Activity.ins().activityData);
		if( !sum.length )
			return false;
		for (let k in Activity.ins().activityData) {
			if( Activity.ins().activityData[k].pageStyle &&
				Activity.ins().activityData[k].pageStyle == ActivityPageStyle.THANKS
			){
				if (Activity.ins().getActivityDataById(+k).isOpenActivity()) {
					return true;
				}
			}
		}

		return false;
	}

	checkShowRedPoint(): number {
		let data = Activity.ins().activityData;
		for (let k in data) {
			if( Activity.ins().activityData[k].pageStyle &&
				Activity.ins().activityData[k].pageStyle == ActivityPageStyle.THANKS
			){
				if (data[k].isOpenActivity() && data[k].canReward() && data[k].specialState()) {
					return 1;
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
		ViewManager.ins().open(ThanksGivingWin);
		this.firstTap = false;
		this.update();
	}
}
