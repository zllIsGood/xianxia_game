class PublicBossJiangliTipWin extends BaseEuiView {
	constructor() {
		super();
	}
	protected belongItem: ItemBase;
	protected joinItem: ItemBase;

	protected belongList: eui.List;
	protected joinList: eui.List;

	public initUI(): void {
		super.initUI();

		this.skinName = "WorldBossJiangLiTishiSkin";
		this.isTopLevel = true;

		this.belongList.itemRenderer = ItemBase;
		this.joinList.itemRenderer = ItemBase;

	}

	public open(...param: any[]): void {
		this.addTouchEvent(this, this.otherClose);

		if (GwBoss.ins().isGwBoss) {
			this.currentState = `gwboss`;
		} else  if (GwBoss.ins().isGwTopBoss){
			this.currentState = `normal`;
		}

		let config = GlobalConfig.WorldBossConfig[UserBoss.ins().currBossConfigID];

		this.belongItem.data = config.belongRewardshow[0];
		this.joinItem.data = config.canRewardshow[0];

		this.belongList.dataProvider = new eui.ArrayCollection(config.belongRewardshow[1]);

		this.joinList.dataProvider = new eui.ArrayCollection(config.canRewardshow[1]);
	}
	public close(...param: any[]): void {
		this.removeTouchEvent(this, this.otherClose)
	}

	private otherClose(evt: egret.TouchEvent) {
		ViewManager.ins().close(PublicBossJiangliTipWin);
	}

	static openCheck() {
		if(!UserBoss.ins().currBossConfigID){
			return false;
		}
		return true;
	}
}

ViewManager.ins().reg(PublicBossJiangliTipWin, LayerManager.UI_Popup);