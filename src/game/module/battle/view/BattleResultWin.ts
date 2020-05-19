class BattleResultWin extends BaseEuiView{
	
	public bgClose:eui.Rect;
	public bg:eui.Image;
	public closeBtn:eui.Button;
	public result:eui.Image;
	public myRanking:eui.Label;
	public myScore:eui.Label;
	public myRewarrd:eui.List;
	public NaN:eui.Label;
	public guild0:eui.Label;
	public score0:eui.Label;
	public rankList:eui.List;
	public starBg:eui.Image;
	public timerGroup:eui.Group;
	public info:eui.Label;


	private _time:number = 5;
	
	public constructor() {
		super();
		this.isTopLevel = true;
		this.skinName = "BattleResultSkin";
	}

	public childrenCreated():void
	{
		super.childrenCreated();
		this.init();
	}

	public init() {
		
		this.rankList.itemRenderer = BattleResultItemRender;
		this.myRewarrd.itemRenderer = ItemBase;

	}

	public open(...args:any[]):void
	{
		this.addTouchEvent(this, this.onTap);
		this.observe(BattleCC.ins().postRankInfo, this.updateRank);
		this.observe(BattleCC.ins().postScoreChange, this.updateMyScore);

		this.timerGroup.visible = true;
		this.info.text = this._time + "";
		TimerManager.ins().doTimer(1000, 5, this.repeat, this);
		this.updateMyScore();
		this.updateRank();
	}

	private updateRank():void
	{
		this.rankList.dataProvider = new eui.ArrayCollection(BattleCC.ins().getRankTop(5));	
	}

	private updateMyScore():void
	{
		let myRank:number =  BattleCC.ins().myRank;
		this.myScore.text = BattleCC.ins().myScore + "";
		this.myRanking.text = myRank + "";

		let maxLen:number = Object.keys(GlobalConfig.CampBattlePersonalRankAwardConfig).length;
		var cfg:CampBattlePersonalRankAwardConfig = GlobalConfig.CampBattlePersonalRankAwardConfig[myRank > 0 && myRank <= maxLen ? myRank : maxLen];
		this.myRewarrd.dataProvider = new eui.ArrayCollection(cfg.award);
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

ViewManager.ins().reg(BattleResultWin, LayerManager.UI_Main);