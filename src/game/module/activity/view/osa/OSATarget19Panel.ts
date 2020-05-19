/**
 * 成长基金
 */
class OSATarget19Panel extends ActivityPanel {
	public title: eui.Image;
	public infoBg: eui.Group;
	public actTime: eui.Label;
	public actInfo: eui.Label;
	public content: eui.List;
	public background: eui.Image;
	public attr: eui.Label;
	public myAttrValue: eui.Label;
	public buyBtn: eui.Button;

	private dataCollection: eui.ArrayCollection = new eui.ArrayCollection();

	public constructor() {
		super();
		this.skinName = `GrowthFundSkin`;
	}

	public updateData() {

	}

	protected childrenCreated(): void {
		super.childrenCreated();
		this.init();
		
	}
	public init() {
		this.content.itemRenderer = OSATarget19ItemRender;
		this.content.dataProvider = this.dataCollection;

	}

	public open(...param: any[]): void {
		this.initEvent();
		this.initObserve();
		this.once(egret.Event.RENDER, this.onRender, this);
	}

	private onRender(): void {
		this.updateView();
		this.updateTimeView();
	}

	public close(...param: any[]): void {
		TimerManager.ins().remove(this.updateTimeView, this);
	}

	private initObserve(): void {
		this.observe(Activity.ins().postFundInfo, this.updateView);
	}

	private initEvent(): void {
		TimerManager.ins().doTimer(1000, 0, this.updateTimeView, this);
		this.addTouchEvent(this.buyBtn, this.onTouchBtn);
	}

	public updateView(): void {
		let data = this.getActivityData();
		if (!data)
			return;

		this.buyBtn.visible = !data.isBuy;
		this.dataCollection.replaceAll(data.dataList);
	}

	private onTouchBtn(): void {
		let data = this.getActivityData();
		if (!data)
			return;

		if (data.isBuy)
			return;

		Activity.ins().sendBuyFund(this.activityID);
	}

	private getActivityData(): ActivityType19Data {
		return Activity.ins().activityData[this.activityID] as ActivityType19Data;
	}

	private updateTimeView(): void {
		let data: ActivityType19Data = this.getActivityData();
		this.actTime.text = data.getRemainTime();
	}
}