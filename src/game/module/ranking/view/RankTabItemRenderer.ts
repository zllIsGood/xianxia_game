class RankTabItemRenderer extends BaseItemRender{
	private redPoint: eui.Group; 
	
	public constructor() {
		super(); 

		this.skinName = "BtnTab3Skin"; 
	}

	public dataChanged(): void
	{
		super.dataChanged();
		this.redPoint.visible = Rank.ins().canPraiseByType(this.data.type);
	}
}