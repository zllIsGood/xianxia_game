class TimeBuyTab extends BaseComponent {
	
	public select0:eui.Image;
	public select1:eui.Image;
	public time:eui.Label;
	public timetxt:eui.Label;
	public redPoint:eui.Image;

	private _isOpen:boolean;
	
	public constructor() {
		super();
		this.skinName = "DETimeBuyTabSkin";
		this.touchChildren = false;
		this.touchEnabled = true;
	}

	public setData(config:ActivityType2Config, isOpen:boolean):void
	{
		this.time.text = config.limitTime[0] + ":" + (config.limitTime[1] < 10 ? config.limitTime[1] + "0" : config.limitTime[1]);
		this._isOpen = isOpen;
		this.setSelected(false);
	}

	public setSelected(selected:boolean):void
	{
		if (selected)
			this.currentState = this._isOpen ? "intimeselect" : "outtimeselect";
		else
			this.currentState = this._isOpen ? "intime" : "outtime";
	}

	/** 是否显示红点 */
	public setRedPoint(show:boolean):void
	{
		this.redPoint.visible = show;
	}
}