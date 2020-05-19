class MijiLookWin extends BaseEuiView {

    private list: eui.List;
    private bgClose: eui.Rect;
    private scroller: eui.VScrollBar;

    constructor() {
        super();
        this.skinName = "MijiOverViewSkin";
        this.isTopLevel = true;
        this.scroller.viewport = this.list;
    }

    public open(...param: any[]): void {
        this.addTouchEvent(this.bgClose, this.onTap);
        this.list.itemRenderer = MijiLookItem;

        let arr: any[] = [];//中级秘术
        let arrEx: any[] = [];//高级秘术
        let rolarr: any[] = [];//中级每一行数据
        let rolarrEx: any[] = [];//高级每一行数据
        for (let i in GlobalConfig.MiJiSkillConfig) {
            let mj: MiJiSkillConfig = GlobalConfig.MiJiSkillConfig[i];
            let itemconfig: ItemConfig = GlobalConfig.ItemConfig[mj.item];
            if (ItemConfig.getQuality(itemconfig) == 3) {
                if (!arr.length)
                    arr.push("middle");
                if (rolarr.length < 5)
                    rolarr.push(mj);
                else {
                    arr.push(rolarr);
                    rolarr = [];
                    rolarr.push(mj);
                }
            } else {
                if (!arrEx.length)
                    arrEx.push("high");
                if (rolarrEx.length < 5)
                    rolarrEx.push(mj);
                else {
                    arrEx.push(rolarrEx);
                    rolarrEx = [];
                    rolarrEx.push(mj);
                }
            }
        }
        if (rolarr.length)
            arr.push(rolarr);
        if (rolarrEx.length)
            arrEx.push(rolarrEx);
        let totoalArr = arr.concat(arrEx);
        this.list.dataProvider = new eui.ArrayCollection(totoalArr);
    }

    private onTap(e: egret.TouchEvent): void {
        switch (e.currentTarget) {
            case this.bgClose:
                ViewManager.ins().close(this);
                break;
        }

    }

    public close(...param: any[]): void {
        this.removeTouchEvent(this.bgClose, this.onTap);
    }

    public destoryView(): void {
    }

    /**
     * 设置界面数据
     */
    public setData(): void {

    }

}

ViewManager.ins().reg(MijiLookWin, LayerManager.UI_Main);