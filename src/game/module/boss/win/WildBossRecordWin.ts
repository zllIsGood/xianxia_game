/**
 * 全民boss击杀记录面板
 */
class WildBossRecordWin extends BaseEuiView {

	private list: eui.List;
	private closeBtn: eui.Button;

	private arrCollect: eui.ArrayCollection;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "WildBossRecordSkin";

		this.list.itemRenderer = WildBossJoinItem;

		this.arrCollect = new eui.ArrayCollection();
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		// this.observe(UserBoss.ins().postKillLog, this.updateRank);
		this.observe(UserBoss.ins().postChallageRank, this.updateRank);
		
		this.arrCollect.source = [];
		this.list.dataProvider = this.arrCollect;
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeObserve();
	}

	private updateRank(param:Array<any>): void {
		let id: number = param[0];
		let datas: string[][] = param[1];
		this.arrCollect.source = datas;

		this.list.dataProvider = this.arrCollect;
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;

			default:
				break;
		}
	}
}

ViewManager.ins().reg(WildBossRecordWin, LayerManager.UI_Main);