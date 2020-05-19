class GuildShopRecordWin extends BaseEuiView {
	public closeBtn: eui.Button;
	public closeBtn0: eui.Button;
	public closeBtn1: eui.Button;
	public list: eui.List;
	private arrList: eui.ArrayCollection;

	constructor() {
		super();
	}
	public initUI(): void {
		super.initUI();
		this.skinName = "GuildStoreInfoSkin";
		this.list.itemRenderer = GuildShopRecordItemRender;
		this.arrList = new eui.ArrayCollection();
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.closeBtn1, this.onTap);
		this.arrList.replaceAll(GuildStore.ins().getRecordInfoAry());
		this.list.dataProvider = this.arrList;
	}
	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
		this.removeTouchEvent(this.closeBtn1, this.onTap);
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn1:
			case this.closeBtn0:
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
		}
	}
}

ViewManager.ins().reg(GuildShopRecordWin, LayerManager.UI_Main);