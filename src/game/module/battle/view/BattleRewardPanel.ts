class BattleRewardPanel extends BaseEuiView{
	
	public list0:eui.List;
	public list1:eui.List;

	private _collect:eui.ArrayCollection;
	
	public constructor() {
		super();
		//this.skinName = "BattleScoreRewarrdSkin";
	}

	public childrenCreated():void
	{
		super.childrenCreated();

		this.init();
	}

	public init() {
		this.list0.itemRenderer = BattleRewardItemRender;

		let i:number = 0;
		let datas:Array<any> = [];
		
		for (let key in GlobalConfig.CampBattlePersonalRankAwardConfig)
		{
			datas[i] = GlobalConfig.CampBattlePersonalRankAwardConfig[key];
			i++;
		}

		this.list0.dataProvider = new eui.ArrayCollection(datas);
		
		this._collect = new eui.ArrayCollection();
		this.list1.itemRenderer = BattleAwardTargetItemRender;
		this.list1.dataProvider = this._collect;

	}

	public open(...args:any[]):void
	{
		this.observe(BattleCC.ins().postGiftInfo, this.update);
		this.update();
	}

	public close():void
	{
		this.removeObserve();
	}

	private update():void
	{
		let len:number = Object.keys(GlobalConfig.CampBattlePersonalAwardConfig).length;
		let datas:Array<any> = [];
		let awardId:number = BattleCC.ins().awardID;
		datas.length = len;
		for (let i:number = 1; i <= len; i++)
			datas[i - 1] = [GlobalConfig.CampBattlePersonalAwardConfig[i], i <= awardId];

		this._collect.source = datas;
	}
}