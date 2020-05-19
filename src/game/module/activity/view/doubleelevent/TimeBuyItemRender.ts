class TimeBuyItemRender extends BaseItemRender{
	
	public times:eui.Label;
	public already:eui.Label;
	public stock:eui.Label;
	public discount:eui.Image;
	public discountSrc:eui.Group;
	public discountNum:eui.BitmapLabel;
	public reward:eui.List;
	public get:eui.Button;
	public priceLabel:eui.Label;
	public iconImg:eui.Image;
	public redPoint:eui.Image;



	private _config:ActivityType2Config;

	private _state:number = 0;

	private _activityID:number = 0;
	
	public constructor() {
		super();
		this.skinName = "DETimeBuyItemSkin";
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
		this._config = this.data[0];
		this._state = this.data[1];
		this._activityID = this.data[3];

		this.discountNum.text = this._config.discount + "";
		this.priceLabel.text = this._config.price + "";

		let colorStr = this.data[2] ? 0x00ff00 : 0xff0000;
		this.times.textFlow = TextFlowMaker.generateTextFlow1(`可购买：|C:${colorStr}&T:${this.data[2]}|/${this._config.count}`);

		this.reward.dataProvider = new eui.ArrayCollection(this._config.rewards);
		this.stock.text = this.data[4];

		this.redPoint.visible = this._state == 1 &&  Actor.yb >= this._config.price;				
		this.get.enabled = this._state == 1;
		this.get.visible = this._state != 2;
		this.already.visible = this._state == 2;
	}

	 private onTap(e:egret.TouchEvent) {
		if (Actor.yb < this._config.price)
			UserTips.ins().showTips(`|C:0xf3311e&T:元宝不足|`);
		else
			 Activity.ins().sendReward(this._activityID, this._config.index);  
    }

	public destruct(): void {
		this.get.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
	}
}