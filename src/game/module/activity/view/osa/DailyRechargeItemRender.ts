class DailyRechargeItemRender extends BaseItemRender {
	
	public bg:eui.Image;
	public reward:eui.List;
	public target:eui.Label;
	public get:eui.Button;
	public redPoint:eui.Image;
	public recharge:eui.Label;

	private _config:ActivityType3Config;

	private _state:number = 0;

	private _totalRecharge:number = 0;

	private _activityID:number = 0;

	private _index:number = 0;

	public constructor() {
		super();
		this.skinName = "DailyRechargeItemSkin";
	}

	public childrenCreated():void
	{
		super.childrenCreated();
		this.init();
	}

	public init() {
		this.reward.itemRenderer = ItemBase;
		this.get.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this, );
	}

	public dataChanged():void
	{
		this._config = this.data[0];
		this._state = this.data[1];
		this._totalRecharge = this.data[2];
		this._activityID = this.data[3];
		this._index = this.data[4];

		this.target.text = "累计充值" + this._config.val + "元宝";
		this.recharge.text = "(" + (this._totalRecharge > this._config.val ? this._config.val : this._totalRecharge) + "/" + this._config.val + ")";
		this.reward.dataProvider = new eui.ArrayCollection(this._config.rewards);
		this.redPoint.visible = this._state == 1;
		this.get.enabled = this._state == 1;
		this.get.label = this._state == 2 ? "已领取" : (this._state == 1 ? "领取" : "未完成");
	}

	 private onTap(e:egret.TouchEvent) {
        Activity.ins().sendReward(this._activityID, this._index);
    }
}