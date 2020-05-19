class BattleRankItemRender extends BaseItemRender{
	
	public rankImg:eui.Image;
	public rank:eui.Label;
	public nameLabel:eui.Label;
	public nameGuild:eui.Label;
	public score:eui.Label;

	public constructor() {
		super();
		this.skinName = "BattleScoreRankItem";
	}

	public dataChanged():void
	{
		var vo:BattleRankVo = this.data;
		var isTop:boolean = vo.rank <= 3;
		this.rankImg.source = isTop ? "common1_no" + vo.rank : null;
		this.rank.text = isTop ? "" : vo.rank + "";
		this.nameLabel.text = vo.roleName;
		this.nameGuild.text = vo.unionName;
		this.score.text = vo.score + "";	
	}
}