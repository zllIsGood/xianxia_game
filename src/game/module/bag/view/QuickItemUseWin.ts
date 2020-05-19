/*
    file: src/game/module/bag/view/QuickItemUseWin.ts
    date: 2018-11-20
    author: solace
    descript: 物品快捷使用
*/
class QuickItemUseWin extends BaseView {
	private closeBtn: eui.Button;
	private yes: eui.Button;
	private item: ItemBase;

	private itemId: number;
	private count: number;
	private isAddListener: boolean;
	constructor() {
		super();
		this.skinName = "quickuseSkin";
		this.isAddListener = false;
	}

	public init() {

	}

	public open(data: any): void {
		if (!this.isAddListener) {
			this.isAddListener = true;
			this.addTouchEvent(this.closeBtn,()=>{
				UserBag.ins().itemQuickUseList = [];
				this.close();
			});
			this.addTouchEvent(this.yes,this.onItemUse);
		}
		this.itemId = data.id;
		this.count = data.count;
		this.item.visible = false;
		egret.setTimeout(()=>{
			this.item.visible = true;
			this.item.data = data;
		},this,0);
	}

	public close(): void {
		let view = ViewManager.ins().getView(PlayFunView) as PlayFunView;
		if (view) {
			view.showQuickUse();
		}
	}

	private onItemUse() {
		UserBag.ins().sendUseItem(this.itemId, this.count);
		UserBag.ins().itemQuickUseList.pop();
		this.close();
	}
}