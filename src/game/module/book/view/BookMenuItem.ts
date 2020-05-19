class BookMenuItem extends BaseItemRender {
	private btnName: eui.Image;
	public label: eui.Label;
	public isShow: boolean = false;
	public redPoint: eui.Image;
	public itemData: any;
	public constructor() {
		super();
		this.skinName = `TujianzianniuSkin`;
		this.width = 160;
		this.height = 50;
		this.label.touchEnabled = false;
		// this.btnName.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
	}

	protected dataChanged() {
		this.itemData = GlobalConfig.SuitConfig[this.data][1];
		this.label.text = this.itemData.name;

		this.checkRedPoint();
	}

	private checkRedPoint(): void {
		// this.redPoint.visible = false;
		// for (let l in this.itemData.idList) {
		// 	if (Book.ins().getBookRedById(this.itemData.idList[l])) {
		// 		this.redPoint.visible = true;
		// 		break;
		// 	}
		// }
		this.redPoint.visible = Book.ins().getSuitRedPoint(this.data);
	}

	public show(b: boolean) {
		this.isShow = b;
		if (this.isShow) {
			this.currentState = `select`;
		}
		else {
			this.currentState = `close`;
		}
		this.validateNow();
		this.checkRedPoint();
	}



}