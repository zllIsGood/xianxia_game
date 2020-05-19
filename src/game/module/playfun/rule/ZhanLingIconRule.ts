/**
 * 天仙活动入口
 * @author wanghengshuai
 */
class ZhanLingIconRule extends RuleIconBase {

    private firstTap: boolean = true;

    public constructor(t: egret.DisplayObjectContainer) {
        super(t);

        this.updateMessage = [
            Activity.ins().postActivityIsGetAwards,
            Actor.ins().postYbChange,
            Actor.ins().postLevelChange,
            UserBag.ins().postItemAdd,
            UserBag.ins().postItemChange
            
        ];
    }

    checkShowIcon(): boolean {
        if (!OpenSystem.ins().checkSysOpen(SystemType.ZHANLING))
            return false;

        let data = Activity.ins().activityData;
        let sum: string[] = Object.keys(data);
        if (!sum || !sum.length)
            return false;

        for (let k in data) {
            let actData = data[k];
            if (actData.pageStyle == ActivityPageStyle.ZHANLING) {
                if (actData.isOpenActivity() && !actData.getHide())
                    return true;
            }
        }

        return false;
    }

    checkShowRedPoint(): number {
        let data = Activity.ins().activityData;
        for (let k in data) {
            let actData = data[k];
            if (actData.pageStyle == ActivityPageStyle.ZHANLING) {
                if (actData.isOpenActivity() && actData.canReward() && !actData.getHide())
                    return 1;
            }
        }

        return 0;
    }

    getEffName(redPointNum: number): string {
        if (this.firstTap || redPointNum) {
            this.effX = 38;
            this.effY = 38;
            return "actIconCircle";
        }
        return undefined;
    }

    tapExecute(): void {
        ViewManager.ins().open(ZhanLingACTWin);
        if (this.firstTap) {
            this.firstTap = false;
            this.update();
        }
    }
}