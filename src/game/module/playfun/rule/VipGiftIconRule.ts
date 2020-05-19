/**
 * Created by hrz on 2017/9/5.
 */

class VipGiftIconRule extends RuleIconBase {
    constructor(t: egret.DisplayObjectContainer) {
        super(t);
        this.updateMessage = [
            UserVip.ins().postUpdateVipData,
            UserVip.ins().postVipGiftBuy,
            Recharge.ins().postUpdateRechargeEx,
            Actor.ins().postYbChange
        ];
    }

    checkShowIcon(): boolean {

        if (!OpenSystem.ins().checkSysOpen(SystemType.VIPGIFT)) {
            return false;
        }
        let maxId = Object.keys(GlobalConfig.VipGiftConfig).length;
        let state: { id: number, state: number }[] = UserVip.ins().vipGiftState;
        for (let id = 1; id <= maxId; id++) {
            //if (((state>>id) & 1) == 0) {
            let hfTimes = GlobalConfig.VipGiftConfig[id].hfTimes;
            hfTimes = hfTimes ? hfTimes : 0;
            if (GameServer._hefuCount >= hfTimes && (state[id - 1].state & 1) == 0) {
                return true;
            }
        }
        return false;
    }

    checkShowRedPoint(): number {
        let vip = UserVip.ins().lv;
        for (let id in GlobalConfig.VipGiftConfig) {
            let config = GlobalConfig.VipGiftConfig[id];
            if (vip >= config.vipLv) {
                if (UserVip.ins().getVipGiftRedPoint(+id)) {
                    return 1;
                }
            }
        }
        return 0;
    }

    tapExecute(): void {
        ViewManager.ins().open(VipGiftWin);
    }
}