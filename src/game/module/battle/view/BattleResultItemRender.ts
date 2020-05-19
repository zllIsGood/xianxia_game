class BattleResultItemRender extends BaseItemRender{
	
	public ranking:eui.Label;
	public roleName:eui.Label;
	public guild:eui.Label;
	public score:eui.Label;

	public constructor() {
		super();
		this.skinName = "BattleResultItem";
	}

	public dataChanged():void
	{
		var vo:BattleRankVo = this.data;
		this.ranking.text = vo.rank + "";
		this.roleName.text = vo.roleName;
		this.guild.text = vo.unionName;
		this.score.text = vo.score + "";
	}
}