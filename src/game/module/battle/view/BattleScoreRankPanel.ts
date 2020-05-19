class BattleScoreRankPanel extends BaseEuiView{
	
	public list:eui.List;
	public myRank:eui.Label;
	public myScore:eui.Label;

	private _arrayCllect:eui.ArrayCollection;
	
	public constructor() {
		super();
		//this.skinName = "BattleScoreRankSkin";
	}

	public childrenCreated():void
	{
		super.childrenCreated();
		this.init();
	}

	public init() {
		
		this.list.itemRenderer = BattleRankItemRender;
		this._arrayCllect = new eui.ArrayCollection();
		this.list.dataProvider = this._arrayCllect;

	}

	public open(...args:any[]):void
	{
		this.observe(BattleCC.ins().postRankInfo, this.update);
		this.observe(BattleCC.ins().postScoreChange, this.updateMyScore);

		this.update();
		this.updateMyScore();
	}

	public close():void
	{
		this.removeObserve();
	}

	private update():void
	{
		this._arrayCllect.source = BattleCC.ins().battleRanks;
	}

	private updateMyScore():void
	{
		this.myScore.text = BattleCC.ins().myScore + "";
		this.myRank.text = "我的排名：" +  BattleCC.ins().myRank;
	}
}