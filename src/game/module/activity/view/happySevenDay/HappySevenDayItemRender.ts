class HappySevenDayItemRender extends BaseItemRender{
	
	public pName:eui.Label;
	public list:eui.List;
	public actBtn:eui.Button;
	public scedule:eui.Label;	
	public redpoint:eui.Image;

	private _listCollect:ArrayCollection;

	public constructor() {
		super();
	}

	public childrenCreated():void
	{
		super.childrenCreated();
		
		this.init();
	}

	public init() {
		this.list.itemRenderer = ItemBase;
		this._listCollect = new ArrayCollection();
		this.list.dataProvider = this._listCollect;

		this.actBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouch, this);
	}

	public dataChanged():void
	{
		//{activityID:this._activityID, conf:conf, state:state, times:achieve.times};
		this._listCollect.source = this.data.conf.reward;
		this.pName.textFlow = TextFlowMaker.generateTextFlow1(this.data.conf.name);

		this.scedule.textFlow = TextFlowMaker.generateTextFlow1(`|C:${0x00ff00}&T:${Math.floor(this.data.times / this.data.conf.rate)}|/${Math.floor(this.data.conf.dayLimit / this.data.conf.rate)}`);
		this.currentState = this.data.state == 2 ? "done" : "normal";
		this.redpoint.visible = this.data.state == 1;

		if (this.data.state == 0 && this.data.conf.turn)
		{
			this.actBtn.enabled = true;
			this.actBtn.label = "前  往";
		}
		else
		{
			this.actBtn.label = "领  取";
			this.actBtn.enabled = this.data.state == 1;
		}
	}

	private onTouch(e:egret.TouchEvent):void
	{
		if (this.data.state == 0 && this.data.conf.turn)
			ViewManager.ins().open(this.data.conf.turn[0], this.data.conf.turn[1]);
		else
			Activity.ins().sendReward(this.data.activityID, this.data.conf.index, 2);
	}

	public destruct(): void {
		this.actBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouch, this);
	}
}