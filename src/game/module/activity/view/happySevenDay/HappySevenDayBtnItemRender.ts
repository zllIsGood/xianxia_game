class HappySevenDayBtnItemRender extends BaseItemRender {
	
	public dayImg:eui.Image;

	public isOpen:boolean;

	public day:number = 0;

	public redpoint:eui.Image;
	
	public constructor() {
		super();
		//this.skinName = "dayBtnSkin";
		this.touchChildren = false;
	}

	public dataChanged():void
	{
		//{res:conf.dayImg, isOpen:this._curDay >= conf.day, showRed:false, day:conf.day}
		this.dayImg.source = this.data.res;
		this.isOpen = this.data.isOpen;
		this.day = this.data.day;
		this.currentState = !this.isOpen ? "lock" : "unlock";
		
		this.redpoint.visible = this.data.showRed;
	}

	public set selected(value:boolean)
	{
		this.currentState = this.isOpen ? (value ? "unlockS" : "unlock") : "lock";
		if (this.data)
			this.redpoint.visible = this.data.showRed;
	}

}