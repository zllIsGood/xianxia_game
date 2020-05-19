/**
 * Created by MPeter on 2018/3/5.
 * 魔界入侵-归属者奖励展示面板
 */
class DevildomBelongAwardWin extends BaseEuiView {
	public BG: eui.Rect;
	public anigroup: eui.Group;
	public background1: eui.Image;
	public belongReward0: eui.List;
	public saleReward0: eui.List;
	public tipGroup1: eui.Group;

	public constructor() {
		super();
		this.skinName = `KFInvasionBelongSkin`;
	}

	protected childrenCreated(): void {
		
		this.init();
	}


	

	public init() {
		this.saleReward0.itemRenderer = ItemBase;
		this.belongReward0.itemRenderer = ItemBase;

	}

	public open(...param): void {
		this.addTouchEvent(this.BG, this.onCloseWin);
		this.addTouchEvent(this.tipGroup1, this.onCloseWin);

		this.belongReward0.dataProvider = new eui.ArrayCollection(KFBossSys.ins().getBossShowAward(GlobalConfig.DevilBossBase.belongAwards));
		this.saleReward0.dataProvider = new eui.ArrayCollection(KFBossSys.ins().getBossShowAward(GlobalConfig.DevilBossBase.belongSaleAwards));
	}


	private onCloseWin(): void {
		ViewManager.ins().close(this);
	}
}
ViewManager.ins().reg(DevildomBelongAwardWin, LayerManager.UI_Popup);
