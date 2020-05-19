
class RenzhengIconRule extends RuleIconBase {
    constructor(t: egret.DisplayObjectContainer) {
        super(t);
        this.updateMessage = [
            PfActivity.ins().postRenZheng
        ];
    }

    checkShowIcon(): boolean {
        let pfa = PfActivity.ins();
        return pfa.renzhengState != -1 && pfa.getRenzhengReward == 0;
    }

    checkShowRedPoint(): number {
        return 1;
    }

    tapExecute(): void {
        ViewManager.ins().open(RenZhengWin);
    }
}