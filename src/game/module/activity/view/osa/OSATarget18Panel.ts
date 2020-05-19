class OSATarget18Panel extends ActivityPanel {
	public title: eui.Image;
	public infoBg: eui.Group;
	public actTime: eui.Label;
	public actDesc: eui.Label;
	public rechargeCoumt: eui.Label;
	public bgP: eui.Image;
	public rechargeitem: eui.List;
	public btnGroup: eui.Group;
	public redPointGroup: eui.Group;
	public redPoint1: eui.Image;
	public redPoint2: eui.Image;
	public redPoint3: eui.Image;
	public redPoint4: eui.Image;
	public redPoint5: eui.Image;

	private redPointList: eui.Image[] = [];
	private radioButtonGroup: eui.RadioButtonGroup = new eui.RadioButtonGroup();

	public constructor() {
		super();
		this.skinName = `TGRechargeSkin`;
	}

	public updateData() {

	}

	protected childrenCreated(): void {
		super.childrenCreated();

		this.init();
		
	}


	public init() {
	
		this.rechargeitem.itemRenderer = OSATarget18ItemRender;
		this.rechargeitem.dataProvider = new eui.ArrayCollection();

		let len: number = this.btnGroup.numChildren;
		let button: eui.RadioButton;
		for (let i: number = 0; i < len; i++) {
			button = this.btnGroup.getChildAt(i) as eui.RadioButton;
			if (button) {
				button.group = this.radioButtonGroup;
			}
		}

		this.redPointList = [this.redPoint1, this.redPoint2, this.redPoint3, this.redPoint4, this.redPoint5];
	}

	public open(...param: any[]): void {
		this.initEvent();
		this.initObserve();
		this.once(egret.Event.RENDER, this.onRender, this);
	}

	private onRender(): void {
		this.radioButtonGroup.selectedValue = `1`;
		this.updateView();
		this.updateTimeView();
	}

	public close(...param: any[]): void {
		TimerManager.ins().remove(this.updateTimeView, this);
	}

	private initObserve(): void {
		this.observe(Activity.ins().postFirstChargeGroup, this.updateView);
	}

	private initEvent(): void {
		TimerManager.ins().doTimer(1000, 0, this.updateTimeView, this);
		this.addEvent(eui.UIEvent.CHANGE, this.radioButtonGroup, this.onTapTab);
	}

	private onTapTab(): void {
		this.updateView();
	}

	private getSelectIndex(): number {
		return parseInt(this.radioButtonGroup.selectedValue) || 1;
	}

	public updateView(): void {
		let data = this.getActivityData();
		if (!data)
			return;

		this.updateRedPoint();
		this.rechargeCoumt.text = `今日已充值${data.rechargeCount}元宝`;
		this.rechargeitem.dataProvider = new eui.ArrayCollection(data.dataList[this.getSelectIndex() - 1]);
	}

	private updateRedPoint(): void {
		let data = this.getActivityData();

		if (!data)
			return;

		for (let redPoint of this.redPointList) {
			if (redPoint && redPoint.parent) {
				redPoint.visible = data.getIsCanReceiveByIndex(this.redPointList.indexOf(redPoint));
			}
		}
	}

	private getActivityData(): ActivityType18Data {
		return Activity.ins().activityData[this.activityID] as ActivityType18Data;
	}

	private updateTimeView(): void {
		let data: ActivityType18Data = this.getActivityData();
		this.actTime.text = data.getRemainTime();
	}
}