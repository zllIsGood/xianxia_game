class GuildWarMemWin extends BaseEuiView {

	public list: eui.List;
	public closeBtn0: eui.Button;
	public closeBtn: eui.Button;

	public data: eui.ArrayCollection;
	private bgClose:eui.Rect;
	public initUI(): void {
        super.initUI();
        this.skinName = "GuildWarMemSkin";

		this.list.itemRenderer = GuildWarMemListRenderer;

		this.data = new eui.ArrayCollection();
		this.isTopLevel = true;
	}

	public open(...param: any[]): void {
		this.list.dataProvider = this.data;
		this.observe(GuildWar.ins().postMyRankChange, this.refushList);
		GuildWar.ins().requestOwnMyGuildRank();

		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.bgClose, this.onTap);

    }

    public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
		this.removeObserve();
	}

	public refushList(): void {
		this.data.replaceAll(GuildWar.ins().getModel().myRankList);
	}

	private onTap(e: egret.TouchEvent): void {
		ViewManager.ins().close(GuildWarMemWin);
	}
}
ViewManager.ins().reg(GuildWarMemWin, LayerManager.UI_Popup);