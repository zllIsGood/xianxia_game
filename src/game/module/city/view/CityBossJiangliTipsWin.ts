class CityBossJiangliTipsWin extends BaseEuiView {

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
		if(CityCC.ins().isCity) {
			for (let i in GlobalConfig.CityBossConfig) {
				if (GlobalConfig.CityBossConfig[i].bossId == CityCC.ins().cityBossId) {
					this.belongList.dataProvider = new eui.ArrayCollection(GlobalConfig.CityBossConfig[i].showReward);
					break;
				}

			}
		}
	}

	private otherClose(evt: egret.TouchEvent) {
		ViewManager.ins().close(this);
	}
}

ViewManager.ins().reg(CityBossJiangliTipsWin, LayerManager.UI_Popup);