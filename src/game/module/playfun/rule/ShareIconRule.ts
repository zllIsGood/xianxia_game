/**
 * Created by hrz on 2017/9/19.
 */

class ShareIconRule extends RuleIconBase {
    constructor(t){
        super(t);
        this.updateMessage = [PfActivity.ins().postInviteInfoUpdate,
            PfActivity.ins().postShare,
            Actor.ins().postLevelChange];
    }

    checkShowIcon(): boolean {
        return OpenSystem.ins().checkSysOpen(SystemType.SHARE) && PfActivity.ins().shareState != -1 && PfActivity.ins().wxInviteCount < 3;
    }

    checkShowRedPoint(): number {
        let t: number = (DateUtils.formatMiniDateTime(PfActivity.ins().inviteTime) - GameServer.serverTime);
        TimerManager.ins().removeAll(this);
        let b = t <= 0 ? 1 : 0;
        if(!b) TimerManager.ins().doTimer(t,1,this.updateTime,this);
        return b;
    }

    private updateTime() {
        this.update();
    }

    tapExecute(): void {
        ViewManager.ins().open(YqWin);
    }
}