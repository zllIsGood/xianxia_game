class RedBagDetailsWin extends BaseEuiView {

    public closeBtn0: eui.Button;
    public num: eui.Label;
    public list: eui.List;

    public effect: MovieClip;
    public bgClose: eui.Rect;


    public initUI(): void {
        super.initUI();

        this.skinName = "RedBagDetailsSkin";
        this.list.itemRenderer = RedBagRenderer;

        this.effect = new MovieClip;

    }

    public open(...param: any[]): void {
        this.addTouchEvent(this.bgClose, this.onTap);
        this.num.text = GuildWar.ins().getModel().robYbNum + "";
        this.list.dataProvider = new eui.ArrayCollection(GuildWar.ins().getModel().rebList);

        if (param[0]) {
            this.effect.playFile(RES_DIR_EFF + "yanhuaeff", 1);
            this.effect.x = StageUtils.ins().getWidth() / 2;
            this.effect.y = 300;
            this.addChild(this.effect);
        }
    }

    public close(...param: any[]): void {
        this.removeTouchEvent(this.bgClose, this.onTap);
        DisplayUtils.removeFromParent(this.effect);
    }

    private onTap(e: egret.TouchEvent): void {
        switch (e.currentTarget) {
            case this.bgClose:
                ViewManager.ins().close(RedBagDetailsWin);
                break;
        }
    }
}
ViewManager.ins().reg(RedBagDetailsWin, LayerManager.UI_Main);