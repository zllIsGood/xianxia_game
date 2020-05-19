/**
 * Created by AlexLam on 2017/11/2.
 */
class ActivityFestivalIconRule extends RuleIconBase {

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
			Recharge.ins().postUpdateRechargeEx,
			UserBag.ins().postItemAdd,
			UserBag.ins().postItemChange
		];
	}

	checkShowIcon(): boolean {
		if(!OpenSystem.ins().checkSysOpen(SystemType.FESTIVAL))
			return false;
			
		let sum:string[] = Object.keys(Activity.ins().activityData);
		if( !sum || !sum.length )
			return false;

		for (let k in Activity.ins().activityData) {
			if(Activity.ins().activityData[k].pageStyle == ActivityPageStyle.FESTIVAL)
			{
				if (Activity.ins().getActivityDataById(+k).isOpenActivity() && !Activity.ins().getActivityDataById(+k).getHide())
					return true;
			}
		}

		return false;
	}

	checkShowRedPoint(): number {
		let data = Activity.ins().activityData;
		for (let k in data)
		{
			if(Activity.ins().activityData[k].pageStyle == ActivityPageStyle.FESTIVAL)
			{
				if (data[k].isOpenActivity() && data[k].canReward() && !Activity.ins().getActivityDataById(+k).getHide())
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
		ViewManager.ins().open(ActivityFestivalWin);
		this.firstTap = false;
		this.update();
	}
}
