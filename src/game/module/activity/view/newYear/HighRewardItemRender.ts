class HighRewardItemRender extends BaseItemRender{
	
	public count:eui.Label;
	public lingqu:eui.Image;
	public list:eui.List;
	public get:eui.Button;

	private _listCollect:ArrayCollection;

	public constructor() {
		super();
		this.skinName = "highRewardItemSkin";
	}

	public childrenCreated():void
	{
		super.childrenCreated();
		
		this.list.itemRenderer = ItemBase;
		this._listCollect = new ArrayCollection();
		this.list.dataProvider = this._listCollect;

		this.get.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouch, this);
	}

	public dataChanged():void
	{
		//{activityID:this.activityID, index:i, state:state, config:config};
		this.count.text = this.data.config.score;
		this.currentState = this.data.state == 2 ? "done" : (this.data.state == 1 ? "kelingqu" : "normal");
		this._listCollect.source = this.data.config.reward;
	}

	private onTouch(e:egret.TouchEvent):void
	{
		 Activity.ins().sendReward(this.data.activityID, this.data.index, 1);
	}

	public destruct(): void {
		this.get.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouch, this);
	}
}
