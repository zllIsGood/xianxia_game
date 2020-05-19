class ExtremeSkillTipsWin extends BaseEuiView{
	
	public bgClose:eui.Rect;
	public nameLabel:eui.Label;
	public description:eui.Label;

	public constructor() {
		super();
		this.skinName = "YupeiSkillTipsNewSkin";
		this.isTopLevel = true;
	}

	public open(...args:any[]):void
	{
		this.nameLabel.text = args[0];
		this.description.textFlow = TextFlowMaker.generateTextFlow1(args[1]);
		this.addTouchEvent(this.bgClose, this.onTouch);
	}

	public close():void
	{
		this.removeTouchEvent(this.bgClose, this.onTouch);
	}

	private onTouch(e:egret.TouchEvent):void
	{
		ViewManager.ins().close(this);
	}
}
ViewManager.ins().reg(ExtremeSkillTipsWin, LayerManager.UI_Main);
