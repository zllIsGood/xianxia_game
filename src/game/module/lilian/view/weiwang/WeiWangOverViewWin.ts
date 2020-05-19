class WeiWangOverViewWin extends BaseEuiView{
	
	public bgClose:eui.Rect;
	public list:eui.List;

	public constructor() {
		super();
		this.skinName = "WeiWangOverViewSkin";
	}

	public childrenCreated():void
	{
		super.childrenCreated();
		this.init();
	}

	public init() {
		this.list.itemRenderer = WeiWangItemRender;
	}

	public open(...args:any[]):void
	{
		this.addTouchEvent(this.bgClose, this.onOtherClose);
		this.update();
	}

	public close():void
	{
		this.removeTouchEvent(this.bgClose, this.onOtherClose);
	}

	private update():void
	{
		let arr:any[] = [];
		let len:number = Object.keys(GlobalConfig.PrestigeLevel).length;
		for (let i:number = 1; i <= len; i++)
			arr.push(GlobalConfig.PrestigeLevel[i]);

		this.list.dataProvider = new eui.ArrayCollection(arr.reverse());
	}

	private onOtherClose(e:egret.TouchEvent):void
	{
		ViewManager.ins().close(this);
	}
}

ViewManager.ins().reg(WeiWangOverViewWin, LayerManager.UI_Popup);