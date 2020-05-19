/** 限时兑换列表项 */
class limitChangeItemRender extends BaseItemRender{
	
	public slimit:eui.Group;
	public limitchange0:eui.Label;
	public reward:eui.List;
	public consnum:eui.Label;
	public limitchange1:eui.Label;
	public get:eui.Button;
	public redPoint:eui.Image;

	private _activityID:number;

	private _config:ActivityType7Config;

	private _dataCollect:ArrayCollection;
	
	public constructor() {
		super();
		this.skinName = "limitChangeItemSkin";
	}

	public childrenCreated():void
	{
		super.childrenCreated();

		this.init();
	}

	public init() {
		this.reward.itemRenderer = ItemBase;
		this.get.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);

	}

	public dataChanged():void
	{
		// datas[i] = [this.activityID, config, state, pCount, sCount];
		this._activityID = this.data[0];
		this._config = this.data[1];
		this.slimit.visible = this.data[4] != Number.MAX_VALUE;
		if (this.data[4] != Number.MAX_VALUE)
		{
			let colorStr = this.data[4] ? 0x00ff00 : 0xff0000;
			this.limitchange0.textFlow = TextFlowMaker.generateTextFlow1(`今日全服可兑换次数：|C:${colorStr}&T:${this.data[4]}`);
		}

		if (this.data[3] == Number.MAX_VALUE)
			this.limitchange1.text = "";
		else
		{
			let colorStr = this.data[3] ? 0x00ff00 : 0xff0000;
			this.limitchange1.textFlow = TextFlowMaker.generateTextFlow1(`可兑换：|C:${colorStr}&T:${this.data[3]}|/${this._config.count}`);
		}

		if (!this._dataCollect)
		{
			this._dataCollect = new ArrayCollection();	
			this.reward.dataProvider = this._dataCollect;
		}
		
		this._dataCollect.source = this._config.rewards;
		this.consnum.text = this._config.itemCount + "";
		this.get.enabled = this.data[2];
		this.redPoint.visible = this.get.enabled;
	}

	private onTap(e:egret.TouchEvent) {
		Activity.ins().sendReward(this._activityID, this._config.index);  
    }

	public destruct(): void {
		this.get.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
	}
}