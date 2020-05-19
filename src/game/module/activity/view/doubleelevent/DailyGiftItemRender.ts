class DailyGiftItemRender extends BaseItemRender{
	
	public times:eui.Label;
	public already:eui.Label;
	public vip:eui.Group;
	public vipLv:eui.BitmapLabel;
	public original:eui.Label;
	public now:eui.Label;
	public get:eui.Button;
	public redPoint:eui.Image;
	public discount:eui.Image;
	public discountSrc:eui.Group;
	public discountNum:eui.BitmapLabel;
	public reward:eui.List;
	
	private _config:ActivityType2Config;

	private _state:number = 0;

	private _activityID:number = 0;

	private _subRmb:number = 0;

	public constructor() {
		super();
		this.skinName = "DEDailyGiftItemSkin";
	}

	protected childrenCreated():void
	{
		super.childrenCreated();
		this.init();
	}

	public init(){
		this.reward.itemRenderer = ItemBase;
		this.get.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
	}

	public dataChanged():void
	{
		this._config = this.data[0];
		this._state = this.data[1];
		this._activityID = this.data[3];
		this._subRmb = this.data[4];

		this.discountNum.text = this._config.discount + "";
		this.vipLv.text = this._config.vip + "";
		this.vip.visible = this._config.vip > 0;
		this.original.text = this._config.originalPrice + "";
		this.now.text = this._config.price + "";

		let colorStr = this.data[2] ? 0x00ff00 : 0xff0000;
		this.times.textFlow = TextFlowMaker.generateTextFlow1(`可购买：|C:${colorStr}&T:${this.data[2]}|/${this._config.count}`);

		this.reward.dataProvider = new eui.ArrayCollection(this._config.rewards);
		this.redPoint.visible = this._state == 1 && Actor.yb >= this._config.price && this._subRmb >= this._config.needRecharge &&  UserVip.ins().lv >= this._config.vip;				
		this.get.enabled = this._state == 1;
		this.get.visible = this._state != 2;
		this.already.visible = this._state == 2;
	}

	 private onTap(e:egret.TouchEvent) {
		 if( UserVip.ins().lv < this._config.vip )
			UserTips.ins().showTips(`|C:0xff0000&T:VIP等级不满足要求|`);
		else if (Actor.yb < this._config.price)
			UserTips.ins().showTips(`|C:0xf3311e&T:元宝不足|`);
		else if (this._subRmb < this._config.needRecharge)
			UserTips.ins().showTips(`|C:0xf3311e&T:充值不足|`);
		else
			 Activity.ins().sendReward(this._activityID, this._config.index);
    }

	public destruct(): void {
		this.get.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
	}
}