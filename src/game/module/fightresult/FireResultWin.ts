/**
 * Created by hrz on 2017/11/6.
 */

class FireResultWin extends BaseEuiView {
    private mainGroup: eui.Group;
    private btnGet: eui.Button;
    private lbExp: eui.BitmapLabel;
    private s: number = 11;
    constructor(){
        super();
        this.skinName = `LYRFbResultSkin`;

        this.lbExp = BitmapNumber.ins().createNumPic(0, 'r0', 5);
        this.lbExp.y = 103;
        this.lbExp.x = 171;
        this.mainGroup.addChild(this.lbExp);
    }
    public open(...param) {

        this.addTouchEvent(this.btnGet, this.onTouch);

        this.s = 9;
        this.btnGet.name = `前往领取`;

        this.updateCloseBtnLabel();
        this.setExp();

        TimerManager.ins().doTimer(1000, this.s, this.updateCloseBtnLabel, this);
    }

    private onTouch() {
        ViewManager.ins().close(this);
    }

    private updateCloseBtnLabel(): void {
        this.s--;
        if (this.s <= 0)
            ViewManager.ins().close(this);
        this.btnGet.label = `${this.btnGet.name}(${this.s}s)`;
    }

    public close() {
        this.removeObserve();
        TimerManager.ins().remove(this.updateCloseBtnLabel, this);
        ViewManager.ins().open(FireRingWin,2);
        UserFb.ins().sendExitFb();
    }

    public setExp() {
        let exp = GlobalConfig.ActorExRingFubenConfig.reward[0].count;
        BitmapNumber.ins().changeNum(this.lbExp, exp, "r0", 5);
    }
}

ViewManager.ins().reg(FireResultWin, LayerManager.UI_Popup);