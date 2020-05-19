class WeiWangItemRender extends BaseItemRender{
	
	public title:eui.Image;
	public value:eui.Label;

	public constructor() {
		super();
		this.skinName = "WeiWangItemSkin";
	}

	public dataChanged():void
	{
		let cfg:PrestigeLevel = this.data;
		this.title.source = cfg.res;
		this.value.text = cfg.exp + "";
	}
}