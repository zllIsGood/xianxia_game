class PaoDianResultItemRender extends BaseItemRender{
	
	public ranking:eui.Label;
	public roleName:eui.Label;
	public guild:eui.Label;
	public award:eui.List;


	public constructor() {
		super();
		this.skinName = "PointResultItemSkin";
	}

	public childrenCreated():void
	{
		super.childrenCreated();
		this.init();
	}

	public init() {
		this.award.itemRenderer = PaoDianIconItemRender;
	}

	public dataChanged():void
	{
		let vo:PaoDianRankVo = this.data;
		this.ranking.text = vo.rank + "";
		this.roleName.text = vo.roleName;
		this.guild.text = vo.unionName;
		this.award.dataProvider = new ArrayCollection([["ZSprestige", vo.jadeChips], ["ZSexp", vo.shenBingExp]]);
	}
}