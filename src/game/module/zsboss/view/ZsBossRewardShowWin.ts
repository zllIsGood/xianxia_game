/**转生boss 奖励窗口*/
class ZsBossRewardShowWin extends BaseEuiView {

	public closeBtn: eui.Button;
	public closeBtn0: eui.Button;
	public tab: eui.TabBar;
	public ranklabel1: eui.Label;
	public ranklabel2: eui.Label;
	public ranklabel3: eui.Label;
	public ranklabel4: eui.Label;
	public ranklabel5: eui.Label;
	public ranklabel6: eui.Label;
	public bossName: eui.Label;
	public itemList1: eui.List;
	public itemList2: eui.List;
	public itemList4: eui.List;
	public itemList3: eui.List;
	public itemList5: ItemBase;
	public itemList6: ItemBase;


	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "ZSBossRewardSkin";
		this.tab.dataProvider = new eui.ArrayCollection(ZsBoss.ins().getBarList());
		this.itemList1.itemRenderer = ItemBase;
		this.itemList2.itemRenderer = ItemBase;
		this.itemList3.itemRenderer = ItemBase;
		this.itemList4.itemRenderer = ItemBase;

		this.isTopLevel = true;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addChangeEvent(this.tab, this.selectIndexChange);
		this.selectIndexChange(null);
	}
	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
	}

	private selectIndexChange(e: egret.Event): void {
		let cruIndex: number = this.tab.selectedIndex;
		let config: OtherBoss1Config = GlobalConfig.OtherBoss1Config[cruIndex + 1];
		this.bossName.text = GlobalConfig.MonstersConfig[config.bossId].name + "(" + config.llimit + "-" + config.hlimit + "转)";
		this.ranklabel1.text = config.rankname[0];
		this.ranklabel2.text = config.rankname[1];
		this.ranklabel3.text = config.rankname[2];
		this.ranklabel4.text = config.rankname[3];
		this.ranklabel5.text = config.rankname[4];
		this.ranklabel6.text = config.rankname[5];
		this.itemList1.dataProvider = new eui.ArrayCollection(config.rank1);
		this.itemList2.dataProvider = new eui.ArrayCollection(config.rank2);
		this.itemList3.dataProvider = new eui.ArrayCollection(config.rank3);
		this.itemList4.dataProvider = new eui.ArrayCollection(config.rank4);
		this.itemList5.data = config.killReward;
		this.itemList6.data = config.shield[0].reward;
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(this);
				break;
		}
	}
}

ViewManager.ins().reg(ZsBossRewardShowWin, LayerManager.UI_Popup);