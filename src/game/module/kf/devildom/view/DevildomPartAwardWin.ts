/**
 * Created by MPeter on 2018/3/5.
 * 魔界入侵-参与者奖励展示面板
 */
class DevildomPartAwardWin extends BaseEuiView {
	public BG: eui.Rect;
	public anigroup: eui.Group;
	public background0: eui.Image;
	public belongReward: eui.List;
	public saleReward: eui.List;
	public tipGroup0: eui.Group;


	public constructor() {
		super();
		this.skinName = `KFInvasionPartSkin`;
	}

	protected childrenCreated(): void {
		this.init();
	}

	

	public init() {
		
		this.saleReward.itemRenderer = ItemBase;
		this.belongReward.itemRenderer = ItemBase;

	}
	public open(...param): void {
		this.addTouchEvent(this.BG, this.onCloseWin);
		this.addTouchEvent(this.tipGroup0, this.onCloseWin);

		this.belongReward.dataProvider = new eui.ArrayCollection(KFBossSys.ins().getBossShowAward(GlobalConfig.DevilBossBase.partAwards));
		this.saleReward.dataProvider = new eui.ArrayCollection(KFBossSys.ins().getBossShowAward(GlobalConfig.DevilBossBase.partSaleAwards));
	}

	private onCloseWin(): void {
		ViewManager.ins().close(this);
	}

}
ViewManager.ins().reg(DevildomPartAwardWin, LayerManager.UI_Popup);

