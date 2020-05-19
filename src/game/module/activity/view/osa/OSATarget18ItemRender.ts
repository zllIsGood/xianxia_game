class OSATarget18ItemRender extends BaseItemRender {
	public already: eui.Label;
	public unready: eui.Label;
	public reward: eui.List;
	public countLabel: eui.Label;
	public infoLabel: eui.Label;
	public buyGroup: eui.Group;
	public get: eui.Button;
	public redPoint: eui.Image;

	public data: FirstChargeGroupData;

	public constructor() {
		super();
	}

	protected childrenCreated(): void {
		super.childrenCreated();

		this.init();
	}

	public init() {
		this.reward.itemRenderer = ItemBase;
		this.get.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchBtn, this);
	}

	protected dataChanged(): void {
		super.dataChanged();
		if (!this.data)
			return;

		let config = this.data.getConfig();
		if (!config)
			return;

		let index: number = this.data.index;
		let rechargecount: number = config.rechargecount;
		let isCanReceive: boolean = this.data.getIsCanReceive();

		this.get.label = isCanReceive ? `领取` : !this.data.isReceive ? `前往` : `已领取`;
		this.get.enabled = !this.data.isReceive;

		this.reward.dataProvider = new eui.ArrayCollection(config.rewards1[index - 1]);
		this.countLabel.text = `(${this.data.getRechargeUserCount()}/${rechargecount})`

		this.infoLabel.text = `今日首充达到${rechargecount}人`;
		if (index > 1) {
			this.infoLabel.text += `\n`;
			this.infoLabel.text += [`且个人充值任意数额`, `且个人充值${config.recharge}元宝`][index - 2] || ``;
		}

		this.updateRedPoint();
	}

	private onTouchBtn(): void {
		if (!this.data)
			return;

		if (this.data.isReceive)
			return;

		if (this.data.getIsCanReceive()) {
			Activity.ins().sendFirstChargeGroup(this.data.activityID, this.data.id, this.data.index);
		}
		else {
			ViewManager.ins().open(ChargeFirstWin);
		}
	}

	public updateRedPoint(): void {
		this.redPoint.visible = this.data ? this.data.getIsCanReceive() : false;
	}

}