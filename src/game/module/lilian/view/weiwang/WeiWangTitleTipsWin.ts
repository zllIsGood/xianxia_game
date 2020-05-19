class WeiWangTitleTipsWin extends BaseEuiView{
	
	public bgClose:eui.Rect;
	public title:eui.Image;
	public content:eui.Label;

	public constructor() {
		super();
		this.skinName = "WeiWangTitleTipsSkin";
	}

	public open(...args:any[]):void
	{
		this.addTouchEvent(this.bgClose, this.onOtherClose);
		this.title.source = args[0].res;
		this.content.textFlow = TextFlowMaker.generateTextFlow1(args[0].des);
	}

	public close():void
	{
		this.removeTouchEvent(this.bgClose, this.onOtherClose);
	}

	private onOtherClose(e:egret.TouchEvent):void
	{
		ViewManager.ins().close(this);
	}
}

ViewManager.ins().reg(WeiWangTitleTipsWin, LayerManager.UI_Popup);