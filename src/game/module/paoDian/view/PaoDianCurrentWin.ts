class PaoDianCurrentWin extends BaseEuiView{
	
	public bgClose:eui.Rect;
	public anigroup:eui.Group;
	public currentArea:eui.Label;
	public Speed:eui.Label;
	public yupeiNum:eui.Label;
	public gwexpNum:eui.Label;

	public constructor() {
		super();
		this.skinName = "PointCurrentTipsSkin";
	}

	public childrenCreated():void
	{
		super.childrenCreated();

		
	}

	public open(...args:any[]):void
	{
		this.addTouchEvent(this.bgClose, this.onClose);
		this.observe(PaoDianCC.ins().postMyInfo, this.update);
		this.observe(PaoDianCC.ins().postAreaChange, this.update);	

		this.update();
	}

	private update():void
	{
		this.yupeiNum.text = "威望" + PaoDianCC.ins().jadeChips;
		this.gwexpNum.text = "经验" + PaoDianCC.ins().shenBingExp;
		let cfg:PassionPointAwardConfig = GlobalConfig.PassionPointAwardConfig[PaoDianCC.ins().areaId];
		this.currentArea.text = cfg ? cfg.times + "倍区域" : "";

		let num:number = cfg ? cfg.reward[1].count : 0;
		num = Math.floor(num / 1000) / 10;
		this.Speed.text = GlobalConfig.PassionPointConfig.efficiencyDesc.replace("{0}", (cfg ? cfg.reward[0].count : 0) + "").replace("{1}", num + "");
		this.currentArea.textColor = this.yupeiNum.textColor = this.gwexpNum.textColor = this.Speed.textColor = cfg ? cfg.color : this.Speed.textColor;
	}

	public close():void
	{
		this.removeTouchEvent(this.bgClose, this.onClose);
		this.removeObserve();
	}

	private onClose(e:egret.TouchEvent):void
	{
		ViewManager.ins().close(this);
	}

}
ViewManager.ins().reg(PaoDianCurrentWin, LayerManager.Main_View);