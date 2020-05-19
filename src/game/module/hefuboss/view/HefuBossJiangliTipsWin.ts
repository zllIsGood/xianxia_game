class HefuBossJiangliTipsWin extends BaseEuiView {

	public giveUp: eui.Image;
	public belongList: eui.List;

	public constructor() {
		super();
	}
	public initUI(): void {
		super.initUI();

		this.skinName = "CityBossJiangliTipsSkin";
		this.isTopLevel = true;

		this.belongList.itemRenderer = ItemBase;
	}
	public open(...param: any[]): void {
		this.addTouchEvent(this.giveUp, this.otherClose);

		this.showAward();
	}

	public showAward() {
		if(HefuBossCC.ins().isInHefuBoss) {
			for (let i in GlobalConfig.HefuBossConfig) {
				if (GlobalConfig.HefuBossConfig[i].bossId == HefuBossCC.ins().hefuBossId) {
					this.belongList.dataProvider = new eui.ArrayCollection(GlobalConfig.HefuBossConfig[i].showReward);
					break;
				}

			}
		}
	}

	private otherClose(evt: egret.TouchEvent) {
		ViewManager.ins().close(this);
	}
}

ViewManager.ins().reg(HefuBossJiangliTipsWin, LayerManager.UI_Popup);