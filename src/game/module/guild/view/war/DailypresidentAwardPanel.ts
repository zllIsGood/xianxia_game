class DailypresidentAwardPanel extends BaseEuiView {

    public bgClose: eui.Rect;
    public desc: eui.Label;
    public closeBtn: eui.Button;
    public sure: eui.Button;
    public closeBtn1: eui.Button;
    public list: eui.List;
    private dataArr:eui.ArrayCollection;

    public initUI(): void {
        super.initUI();
        this.skinName = "DailypresidentAwardSkin";
        this.list.itemRenderer = ItemBase;
        this.dataArr = new eui.ArrayCollection();
    }

    public open(...param: any[]): void {
        this.addTouchEvent(this.bgClose, this.onTap);
        var data1:RewardData[] = GlobalConfig.GuildBattleConst.occupationAward;
		this.dataArr.source = data1;
		this.list.dataProvider = this.dataArr;
    }

    public close(...param: any[]): void {
        this.removeTouchEvent(this.bgClose, this.onTap);
    }

    private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
            case this.bgClose:
				ViewManager.ins().close(this);
				break;
        }
    }
}

ViewManager.ins().reg(DailypresidentAwardPanel, LayerManager.UI_Main);