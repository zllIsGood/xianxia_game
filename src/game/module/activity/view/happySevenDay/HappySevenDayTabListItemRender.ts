class HappySevenDayTabListItemRender extends BaseItemRender{
	
	public tabName:eui.Label;

	public redpoint:eui.Image;

	public constructor() {
		super();
		//this.skinName = "tabBtnSkin";
		this.touchChildren = false;
	}

	public dataChanged():void
	{
		//{gName:days[k][0].gName, showRed:false}
		this.tabName.text = this.data.gName;
		this.redpoint.visible = this.data.showRed;
	}

	public set selected(value:boolean)
	{
		this.currentState = value ? "select" : "unselect";
		if (this.data)
			this.redpoint.visible = this.data.showRed;
	}

}