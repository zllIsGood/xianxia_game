class BattleRankWin extends BaseEuiView{
	
	public bgClose:eui.Rect;
	public anigroup:eui.Group;
	public titleDesc:eui.Label;
	public viewStack:eui.ViewStack;
	public runePanel0:BattleScoreRankPanel;
	public decomPanel0:BattleRewardPanel;
	public tab:eui.TabBar;
	public tipGroup:eui.Group;

	private _panels:Array<any>;

	private _selectedIndex:number = 0;
	
	public constructor() {
		super();
		this.skinName = "BattleScoreSkin";
		this.isTopLevel = true;
	}

	public initUI(): void 
	{
		super.initUI();
		this._panels = [this.runePanel0, this.decomPanel0];
		this._panels[this._selectedIndex].open();
		this.viewStack.selectedIndex = this._selectedIndex;
	}

	public open(...args:any[]):void
	{
		this.addTouchEvent(this, this.onTap);
		this.addChangeEvent(this.tab, this.onTabTouch);
	}

	public close():void
	{
		this.removeTouchEvent(this, this.onTap);
		this.removeEventListener(egret.TouchEvent.CHANGE, this.onTabTouch, this.tab);
	}

	private onTabTouch(e:egret.TouchEvent):void
	{
		this._panels[this._selectedIndex].close();

		this._selectedIndex = e.currentTarget.selectedIndex;
		this._panels[this._selectedIndex].open();
		this.viewStack._selectedIndex = this._selectedIndex;
	}

	private onTap(e:egret.TouchEvent):void
	{
		if (e.target == this.bgClose)
			ViewManager.ins().close(this);
	}


}

ViewManager.ins().reg(BattleRankWin, LayerManager.UI_Main);