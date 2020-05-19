/**
 * Created by wangzhong on 2016/7/20.
 */
class ActivityIconRule extends RuleIconBase {

	protected firstTap: boolean = true;
	protected pageStyle: ActivityPageStyle = ActivityPageStyle.KAIFU;

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
			Activity.ins().postActivityIsSeek
		];
	}

	checkShowIcon(): boolean {
		if (this.pageStyle == ActivityPageStyle.KAIFU) {
			if (GameServer.serverOpenDay < 7) {
				(this.tar as any).icon = `icon_kaifu`;
			} else {
				(this.tar as any).icon = `icon_huodong`;
			}
		}


		if (!OpenSystem.ins().checkSysOpen(SystemType.ACTIVITY)) {
			return false;
		}

		let sum: string[] = Object.keys(Activity.ins().activityData);
		if (!sum.length)
			return false;
		for (let k in Activity.ins().activityData) {
			if (Activity.ins().activityData[k].pageStyle == this.pageStyle &&
				Activity.ins().activityData[k].timeType != ActivityDataFactory.TimeType_Total
			) {
				if (Activity.ins().getActivityDataById(+k).isOpenActivity() &&
					(!Activity.ins().getActivityDataById(+k).getHide || (!Activity.ins().getActivityDataById(+k).getHide()))) {
					return true;
				}
			}
		}

		return false;
	}

	checkShowRedPoint(): number {

		let data = Activity.ins().activityData;
		if(RoleMgr.ins().isFirst && this.pageStyle != ActivityPageStyle.KAIFUFANLI) return 1;
		
		for (let k in data) {
			if (Activity.ins().activityData[k].pageStyle == this.pageStyle && Activity.ins().activityData[k].timeType != ActivityDataFactory.TimeType_Total) {
				if (data[k].isOpenActivity() && data[k].canReward()) {
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
		ViewManager.ins().open(ActivityWin, 0, this.pageStyle);
		this.firstTap = false;
		this.update();
	}
}
