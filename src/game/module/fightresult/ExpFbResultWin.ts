/**
 * Created by hrz on 2017/7/8.
 */

class ExpFbResultWin extends BaseEuiView {
    private mainGroup: eui.Group;
    private btnGet: eui.Button;
    private lbExp: eui.BitmapLabel;
    private s: number = 11;
    constructor() {
        super();
        this.skinName = `jyjiangli`;
    }

    public open(...param) {

        this.addTouchEvent(this.btnGet, this.onTouch);

        this.observe(UserFb.ins().postFbExpInfo, this.update);
        this.update();

        this.s = 9;
        this.btnGet.name = `前往领取`;

        this.updateCloseBtnLabel();

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
        ViewManager.ins().open(FbWin, 1);
        // ViewManager.ins().addFilterTopView(FbWin);
        UserFb.ins().sendExitFb();
    }

    public update() {
        let fbExp = UserFb.ins().fbExp;
        let config = GlobalConfig.ExpFubenConfig[fbExp.cid || fbExp.sid];
        if (config) {
            let discount: number = GlobalConfig.MonthCardConfig.expFubenPrecent / 100;
            let addValue: number = Recharge.ins().getIsForeve() ? 1 + discount : 1;
            this.setExp(Math.ceil(config.exp * addValue));
        }
    }

    public setExp(exp) {
        this.lbExp.text = `${exp}`;
        // BitmapNumber.ins().changeNum(this.lbExp, exp, "r0", 5);
        // this.lbExp.anchorOffsetX = this.lbExp.width / 2;
    }
}

ViewManager.ins().reg(ExpFbResultWin, LayerManager.UI_Popup);