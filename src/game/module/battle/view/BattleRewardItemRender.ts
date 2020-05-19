class BattleRewardItemRender extends BaseItemRender{
	
	public rank:eui.Label;
	public awards:eui.List;

	private _arrayCollect:eui.ArrayCollection;
	
	public constructor() {
		super();
		this.skinName = "BattleRewarrdItemSkin";
	}

	public childrenCreated():void
	{
		super.childrenCreated();
		this.init();
	}

	public init() {
		
		this.awards.itemRenderer = ItemBase;
		this._arrayCollect = new eui.ArrayCollection();
		this.awards.dataProvider = this._arrayCollect;

	}

	public dataChanged():void
	{
		var cfg:CampBattlePersonalRankAwardConfig = this.data;
		this.rank.text = "第" + cfg.rank + "名";
		this._arrayCollect.source = cfg.award;
	}
}