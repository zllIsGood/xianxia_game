class PaoDianResultWin extends BaseEuiView{

	public bgClose:eui.Rect;
	public bg:eui.Image;
	public closeBtn:eui.Button;
	public result:eui.Image;
	public myRewarrd:eui.List;
	public rankList:eui.List;
	public timerGroup:eui.Group;
	public info:eui.Label;

	private _time:number = 5;

	private _arrayCollect:ArrayCollection;

	public constructor() {
		super();
		this.skinName = "PointResultSkin";
	}

	public childrenCreated():void
	{
		super.childrenCreated();
		this.init();
	}

	public init() {
		this.rankList.itemRenderer = PaoDianResultItemRender;
		this.myRewarrd.itemRenderer = PaoDianIconItemRender;

		this._arrayCollect = new ArrayCollection();
		this.myRewarrd.dataProvider = this._arrayCollect;
	}

	public open(...args:any[]):void
	{
		this.addTouchEvent(this, this.onTap);
		this.observe(PaoDianCC.ins().postMyInfo, this.updateMyScore);

		this.timerGroup.visible = true;
		this.info.text = this._time + "";
		TimerManager.ins().doTimer(1000, 5, this.repeat, this);
		this.updateMyScore();
		
		this.rankList.dataProvider = new eui.ArrayCollection(args[0]);	
	}


	private updateMyScore():void
	{
		this._arrayCollect.source = [["ZSprestige", PaoDianCC.ins().jadeChips], ["ZSexp", PaoDianCC.ins().shenBingExp]];
	}

	private repeat():void
	{
		this._time--;
		if (this._time > 0)
			this.info.text = this._time + "";
		else
			this.timerGroup.visible = false;	
	}

	public close():void
	{
		this.removeTouchEvent(this, this.onTap);
		this.removeObserve();
		TimerManager.ins().removeAll(this);
	}

	private onTap(e:egret.TouchEvent):void
	{
		switch (e.target)
		{
			case this.closeBtn:
				UserFb.ins().sendExitFb();
				ViewManager.ins().close(this);
				break;
		}
	}
}
ViewManager.ins().reg(PaoDianResultWin, LayerManager.UI_Main);