class BattleAwardTargetItemRender extends BaseItemRender{
	
	public rank:eui.Label;
	public already:eui.Image;
	public award:ItemBase;

	public constructor() {
		super();
		this.skinName = "BattleTargetItemSkin";
	}

	public dataChanged():void
	{
		var cfg:CampBattlePersonalAwardConfig = this.data[0];
		this.rank.text = cfg.integral + "\n积分";
		this.award.data = cfg.award[0];
		this.already.visible = this.data[1];
	}
}