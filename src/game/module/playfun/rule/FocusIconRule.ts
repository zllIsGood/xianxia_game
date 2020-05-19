/**
 * Created by hrz on 2017/9/19.
 */

class FocusIconRule extends RuleIconBase {
    constructor(t) {
        super(t);
        this.updateMessage = [
            Actor.ins().postLevelChange,
            PfActivity.ins().postGuanZhu
        ];
    }

    checkShowIcon(): boolean {
        return OpenSystem.ins().checkSysOpen(SystemType.FOCUS) && PfActivity.ins().focusState == 0;
    }

    checkShowRedPoint(): number {
        return 1;
    }

    tapExecute(): void {
        ViewManager.ins().open(FocusWin);
    }
}