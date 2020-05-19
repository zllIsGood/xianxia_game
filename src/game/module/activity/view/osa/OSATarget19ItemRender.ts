/**
 * 成长基金项
 */
class OSATarget19ItemRender extends BaseItemRender {
	public btnLabel: eui.Label;
	public getBtn: eui.Button;
	public redPoint: eui.Image;
	public infoLabel: eui.Label;
	public otherLabel: eui.Label;
	public itemList: eui.List;

	public data: GrowthFundData;

	public constructor() {
		super();
	}

	protected childrenCreated(): void {
		super.childrenCreated();

		this.init();	
	}
	public init() {
		
		this.itemList.itemRenderer = ItemBase;
		this.getBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchBtn, this);

	}

	protected dataChanged(): void {
		super.dataChanged();

		if (!this.data)
			return;

		let config = this.data.getConfig();
		if (!config)
			return;

		this.otherLabel.visible = this.itemIndex == 7;
		this.infoLabel.textFlow = TextFlowMaker.generateTextFlow(`达到|C:${0xFFFF00}&T:${this.getLevelStr(config.level)}|，返还`);
		this.itemList.dataProvider = new eui.ArrayCollection(config.rewards);

		let isBuy: boolean = this.data.getIsBuy();
		let isLevel: boolean = this.data.getIsLevel();
		let isReceive: boolean = this.data.isReceive;

		this.getBtn.label = isReceive ? `已领取` : (isLevel ? `领取` : `未达标`);
		this.redPoint.visible = this.getBtn.enabled = this.data.getIsCanReceive();
	}

	private getLevelStr(value: number): string {
		let lv: number = value % 1000;
		let zs: number = value / 1000 >> 0;
		return zs > 0 ? `${zs}转` : `${lv}级`;
	}

	private onTouchBtn(): void {
		if (!this.data)
			return;

		if (!this.data.getIsCanReceive())
			return;

		if (!this.data.getIsBuy())
			UserTips.ins().showTips(`购买基金后才可领取奖励`);
		else
			Activity.ins().sendReceiveFund(this.data.activityID, this.data.index);
	}
}