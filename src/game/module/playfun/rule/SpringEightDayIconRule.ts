/**
 * 春节八天乐活动入口
 * @author ade
 */
class SpringEightDayIconRule extends RuleIconBase {
    private firstTap: boolean = true;

    private _activityID: number = 0;

    public constructor(t: egret.DisplayObjectContainer) {
        super(t);

        this.showMessage = [
            Activity.ins().postActivityIsGetAwards,
            Actor.ins().postLevelChange
        ];

        this.updateMessage = [
            Activity.ins().postActivityIsGetAwards,
        ];
    }

    checkShowIcon(): boolean {
        if (!OpenSystem.ins().checkSysOpen(SystemType.SPRINGEIGHTDAY))
            return false;

        let data = Activity.ins().activityData;
        let sum: string[] = Object.keys(data);
        if (!sum || !sum.length)
            return false;

        for (let k in data) {
            let actData = data[k];
            if (actData.pageStyle == ActivityPageStyle.SPRINGEIGHTDAY) {
                if (actData.isOpenActivity() && !actData.getHide()) {
                    this._activityID = (+k);
                    return true;
                }
            }
        }

        return false;
    }

    checkShowRedPoint(): number {
        let data = Activity.ins().activityData;
        for (let k in data) {
            let actData = data[k];
            if (actData.pageStyle == ActivityPageStyle.SPRINGEIGHTDAY) {
                if (actData.isOpenActivity() && actData.canReward() && !actData.getHide())
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
        ViewManager.ins().open(SpringEightDayWin, this._activityID);
        if (this.firstTap) {
            this.firstTap = false;
            this.update();
        }
    }
}