/**
 * 追血令结算
 */
class ZaoYuRecordWin extends BaseEuiView {
	private rank: eui.Label;
	private list: eui.List;
	private rankType:number;
	private closeBtn: eui.Button;
	private closeBtn0:eui.Button;
	// private closeBtn0: eui.Button;
	
	
	constructor() {
		super();
		
		this.skinName = "ZaoYuRecordSkin";

		this.list.itemRenderer = ZaoYuRecordItem;
	}


	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0,this.onTap);
		this.observe(Encounter.ins().postZaoYuRecord,this.updateData);
		Encounter.ins().sendInquireRecord();

	}
	
	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0,this.onTap);

		this.removeObserve();
	}
	
	private updateData(arr){
		if (!arr) return;

		function sort(a: ItemData, b: ItemData): number {
			if (a[0] < b[0])
				return 1;
			else if (a[0] > b[0])
				return -1;
			else
				return 0;
		}
		arr.sort(sort);
		
		this.list.dataProvider = new eui.ArrayCollection(arr);
	}
	
	private onTap(e: egret.TouchEvent){
		switch (e.target) {
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(this);
				break;
		}
	}
}

ViewManager.ins().reg(ZaoYuRecordWin, LayerManager.UI_Main);
