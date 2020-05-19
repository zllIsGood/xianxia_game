class TreasureChuanshiItemRender extends BaseItemRender{
	public gift:ItemBase;
	public select:eui.Image;
	public select2:eui.Image;
	
	public constructor() 
	{
		super();
		this.skinName = "TreasureChuanshiItem";
		this.touchChildren = false;
		this.touchEnabled = true;
	}


	public dataChanged():void
	{
		this.gift.data = this.data;
		this.select.visible = this.select2.visible = false;
	}

	public checkSelcted(index:number):void
	{
		this.select.visible = this.select2.visible = this.itemIndex == index;
	}

}