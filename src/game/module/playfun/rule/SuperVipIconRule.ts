/**
 * Created by hrz on 2017/11/10.
 */

class SuperVipIconRule extends RuleIconBase {
    constructor(t: egret.DisplayObjectContainer) {
        super(t);
        this.updateMessage = [
            UserVip.ins().postSuperVipData,
            Actor.ins().postLevelChange
        ];
    }

    checkShowIcon(): boolean {
        if(OpenSystem.ins().checkSysOpen(SystemType.SUPERVIP) && UserVip.ins().superVipData) {
            return UserVip.ins().superVipData.enabled;
        }
        return false;
    }

    checkShowRedPoint(): number {
        return 0;
    }

    tapExecute(): void {
        ViewManager.ins().open(SuperVipWin);
    }
}