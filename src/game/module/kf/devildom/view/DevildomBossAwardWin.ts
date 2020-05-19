/**
 * Created by MPeter on 2018/3/5.
 * 魔界入侵-击杀boss获得励展示面板
 */
class DevildomBossAwardWin extends BaseEuiView {
	public bgClose: eui.Rect;
	public nameTxt: eui.Label;
	public nameTxt0: eui.Label;
	public giveUp: eui.Image;
	public belongReward1: eui.List;
	public saleReward1: eui.List;
	public belongReward0: eui.List;
	public saleReward0: eui.List;

	public constructor() {
		super();
		this.skinName = "KFInvasionJiangLiTishiSkin";
	}

	protected childrenCreated(): void {
		this.init();
	}

	

	public init() {
		
		this.belongReward1.itemRenderer = ItemBase;
		this.saleReward1.itemRenderer = ItemBase;
		this.belongReward0.itemRenderer = ItemBase;
		this.saleReward0.itemRenderer = ItemBase;

	}

	public open(...param): void {
		this.addTouchEvent(this.bgClose, this.onCloseWin);
		this.addTouchEvent(this.giveUp, this.onCloseWin);

		this.belongReward1.dataProvider = new eui.ArrayCollection(KFBossSys.ins().getBossShowAward(GlobalConfig.DevilBossBase.belongAwards));
		this.saleReward1.dataProvider = new eui.ArrayCollection(KFBossSys.ins().getBossShowAward(GlobalConfig.DevilBossBase.belongSaleAwards));
		this.belongReward0.dataProvider = new eui.ArrayCollection(KFBossSys.ins().getBossShowAward(GlobalConfig.DevilBossBase.partAwards));
		this.saleReward0.dataProvider = new eui.ArrayCollection(KFBossSys.ins().getBossShowAward(GlobalConfig.DevilBossBase.partSaleAwards));
	}

	private onCloseWin(): void {
		ViewManager.ins().close(this);
	}
}
ViewManager.ins().reg(DevildomBossAwardWin, LayerManager.UI_Popup);
