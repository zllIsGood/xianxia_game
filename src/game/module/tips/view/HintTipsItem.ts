class HintTipsItem extends BaseView {
    public bg: eui.Image;
    public lab: eui.Label;
    public pic: eui.Image;
    private res: string;
    constructor() {
        super();
        this.skinName = "TipsSkin";

        this.lab.visible = false;
        this.bg.visible = false;

    }
    public setTips(res: string) {
        this.pic.source = res + "_png";
        this.res = res;
        this.pic.alpha = 0;
        this.pic.y = 0;

        let t1: egret.Tween = egret.Tween.get(this.pic);
        t1.to({ "alpha": 1 }, 500
        ).wait(3000).to({ "alpha": 0 }, 200).call(() => {
            DisplayUtils.removeFromParent(this);
        }, this);
    }

    public getTips(): string {
        return this.res;
    }
}