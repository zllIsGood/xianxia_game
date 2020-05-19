/**
 *
 * @author hepeiye
 *
 */

class ItemBaseStore extends ItemBase {

	public onClick() {
		let uuid = this.data.handle;
		UserBag.ins().sendGetGoodsByStore(uuid);
	}
}

class TreasureStorePanel extends BaseEuiView {
	private get: eui.Button;
	private list: eui.List;
	private listScroller: eui.Scroller;

	private type:number;

	constructor() {
		super();
		this.isTopLevel = true;
	}

	public childrenCreated(): void{
		this.init();
	}

	public init(): void {
		this.skinName = "TreasureStore";
		this.list.itemRenderer = ItemBaseStore;
		this.listScroller.viewport = this.list;
	}

	public open(...param: any[]): void {
		this.type = param[0];
		this.addTouchEvent(this.get, this.getGoods);
		this.observe(UserBag.ins().postHuntStore, this.updateData);
		this.updateData();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.get, this.getGoods);
		this.removeObserve();
	}

	private updateData() {
		let datas: any = UserBag.ins().getHuntGoodsBySort(this.type);
		this.list.dataProvider = new eui.ArrayCollection(datas);
	}

	private getGoods(e: egret.TouchEvent) {
		if (this.list.dataProvider.length > 0) {
			UserBag.ins().sendGetGoodsByStore(this.type);
		}
	}
}

ViewManager.ins().reg(TreasureStorePanel, LayerManager.UI_Main);
