
class WorldBossJiangliTipWin extends BaseEuiView {
	constructor() {
		super();
	}
	// protected belongItem: ItemBase;
	// protected joinItem: ItemBase;

	protected belongList: eui.List;
	protected joinList: eui.List;

	public initUI(): void {
		super.initUI();

		this.skinName = "WorldBossJiangLiTishiSkin2";
		this.isTopLevel = true;

		this.belongList.itemRenderer = ItemBase;
		this.joinList.itemRenderer = ItemBase;

	}

	public open(...param: any[]): void {
		this.addTouchEvent(this, this.otherClose);

		let config = GlobalConfig.WorldBossConfig[UserBoss.ins().currBossConfigID];
		// let belongReward: RewardData = new RewardData();
		// belongReward.type = config.belongRewardshow[0].type;
		// belongReward.id = config.belongRewardshow[0].id;
		// belongReward.count = config.belongRewardshow[0].count;
		// this.belongItem.data = belongReward;

		// let joinReward: RewardData = new RewardData();
		// joinReward.type = config.canRewardshow[0].type;
		// joinReward.id = config.canRewardshow[0].id;
		// joinReward.count = config.canRewardshow[0].count;
		// this.joinItem.data = joinReward;

		// this.belongItem.data = config.belongRewardshow[0];
		// this.joinItem.data = config.canRewardshow[0];

		this.belongList.dataProvider = new eui.ArrayCollection(config.belongRewardshow[1]);

		this.joinList.dataProvider = new eui.ArrayCollection(config.canRewardshow[1]);
	}
	public close(...param: any[]): void {
		this.removeTouchEvent(this, this.otherClose)
	}

	private otherClose(evt: egret.TouchEvent) {
		ViewManager.ins().close(WorldBossJiangliTipWin);
	}

	static openCheck(){
		if(!UserBoss.ins().currBossConfigID){
			return false;
		}
		let config = GlobalConfig.WorldBossConfig[UserBoss.ins().currBossConfigID];
		if(Assert(config, `GlobalConfig.WorldBossConfig[${UserBoss.ins().currBossConfigID}]是空`)){
			return false;
		}
		return true;
	}
}

ViewManager.ins().reg(WorldBossJiangliTipWin, LayerManager.UI_Popup);