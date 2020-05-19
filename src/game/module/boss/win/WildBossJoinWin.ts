/**
 * 全民boss击杀记录面板
 */
class WildBossJoinWin extends BaseEuiView {

	private list: eui.List;
	private closeBtn: eui.Button;

	private bgClose: eui.Image;

	private arrCollect: eui.ArrayCollection;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "WildBossJoinSkin";

		this.list.itemRenderer = WildBossJoinItem;

		this.arrCollect = new eui.ArrayCollection();

	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.bgClose, this.onTap);

		this.arrCollect.source = [];
		this.list.dataProvider = this.arrCollect;
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.bgClose, this.onTap);
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
			case this.bgClose:
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;

			default:
				break;
		}
	}
}

ViewManager.ins().reg(WildBossJoinWin, LayerManager.UI_Main);