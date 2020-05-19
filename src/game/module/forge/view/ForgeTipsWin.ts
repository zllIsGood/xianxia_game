class ForgeTipsWin extends BaseEuiView {
	public colorCanvas: eui.Image;
	public group: eui.Group;
	public background: eui.Image;
	public attrTxt: eui.Label;
	public attrTxt0: eui.Label;


	private attr: number[];
	private attrStr: string;

	constructor() {
		super();
	}
	public initUI(): void {
		super.initUI();
		this.skinName = "forgeTips";
	}

	public open(...param: any[]): void {
		this.attr = param[0];
		this.attrStr = param[1];
		this.addTouchEndEvent(this, this.otherClose);
		this.attrTxt.text = this.attrStr;
		this.attrTxt0.text ="";
		for(let i = 0;i < this.attr.length;i++)
		{
			this.attrTxt0.text += this.attr[i] + ((i == this.attr.length-1)?"":"\n");
		}
		this.background.height = this.attrTxt.textHeight + 60;
		this.group.y = this.group.height / 2 - this.background.height / 2;
	}
	public close(...param: any[]): void {
		this.removeEventListener(egret.TouchEvent.TOUCH_END, this.otherClose, this);
	}

	private otherClose(evt: egret.TouchEvent) {
		ViewManager.ins().close(this);
	}
}

ViewManager.ins().reg(ForgeTipsWin,LayerManager.UI_Popup);