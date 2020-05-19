/**
 * 零元礼包
 */
class OSATarget17Panel extends ActivityPanel {
	public title: eui.Image;
	public btnGroup: eui.Group;
	public btn1: eui.RadioButton;
	public btn2: eui.RadioButton;
	public btn3: eui.RadioButton;
	public img: eui.Image;
	public effGroup: eui.Group;
	public itemList: eui.List;
	public word: eui.Image;
	public redPoint0: eui.Image;
	public redPoint1: eui.Image;
	public redPoint2: eui.Image;
	public infoBg: eui.Group;
	public actTime: eui.Label;
	public btn: eui.Button;
	public buyYbGroup: eui.Group;
	public icon: eui.Image;
	public yuanbao: eui.Label;
	public vip: eui.Group;
	// public vipimg: eui.Image;
	public vipLv: eui.BitmapLabel;
	public des: eui.Label;
	public days: eui.Label;

	private eff: MovieClip;
	private redPointList: eui.Image[] = [];
	private radioButtonGroup: eui.RadioButtonGroup = new eui.RadioButtonGroup();

	public constructor() {
		super();
		this.skinName = `lingyuanlibaoSkin`;
	}

	protected childrenCreated(): void {
		super.childrenCreated();

		this.init();
	}

	public init() {
		this.itemList.itemRenderer = ItemBase;

		let len: number = this.btnGroup.numChildren;
		let button: eui.RadioButton;
		for (let i: number = 0; i < len; i++) {
			button = this.btnGroup.getChildAt(i) as eui.RadioButton;
			if (button) {
				button.group = this.radioButtonGroup;
			}
		}
		this.redPointList = [this.redPoint0, this.redPoint1, this.redPoint2];
		this.days.visible = false;
	}

	public open(...param: any[]): void {
		egret.Tween.get(this.img, { loop: true }).to({ y: 161 - 20 }, 1500).to({ y: 161 }, 1500);
		this.initEvent();
		this.initObserve();
		this.updateTimeView();
		this.once(egret.Event.RENDER, this.onRender, this);
	}

	private onRender(): void {
		this.radioButtonGroup.selectedValue = `1`;
		this.updateView();
	}

	public close(...param: any[]): void {
		TimerManager.ins().remove(this.updateTimeView, this);
		egret.Tween.removeTweens(this.img);
		//这里矫正位置防止缓动造成的偏差
		this.img.y = 161;
	}

	private initObserve(): void {
		this.observe(Activity.ins().postZeroElement, this.updateView);
	}

	private initEvent(): void {
		TimerManager.ins().doTimer(1000, 0, this.updateTimeView, this);
		this.addTouchEvent(this.btn, this.onTouchBtn);
		this.addEvent(eui.UIEvent.CHANGE, this.radioButtonGroup, this.onTapTab);
	}

	private onTapTab(): void {
		this.updateView();
	}

	private getSelectIndex(): number {
		return parseInt(this.radioButtonGroup.selectedValue) || 1;
	}

	private updateButton(): void {
		let data = this.getCurrentData();

		if (!data)
			return;

		let isOpen: boolean = data.isOpen();
		this.btn.visible = isOpen;

		if (!isOpen)
			return;

		let state = data.getBtnState();
		//index 2.购买
		this.btn.label = [`等级不足`, `领取`, ``, `已领取`][state];
		this.btn.enabled = state != ZeroElementBtnStateType.Received;
	}

	public updateData(): void {

	}

	public updateView(): void {
		let index: number = this.getSelectIndex();

		let data = this.getCurrentData()
		if (!data)
			return;

		let config = this.getConfig(index);
		if (!config)
			return;

		this.updateButton();
		this.updateRedPoint();

		let consume: RewardData = config.rewardsYB[0];
		this.itemList.dataProvider = new eui.ArrayCollection(config.rewards);

		this.days.visible = config.openday > GameServer.serverOpenDay + 1 ? true : false;
		if (this.days.visible) {
			this.days.text = `开服第${config.openday}天起可购买`;
		}
		
		this.buyYbGroup.visible = config.recharge > 0 && data.getBtnState() == ZeroElementBtnStateType.Buy;
		if (this.buyYbGroup.visible) {
			this.yuanbao.text = (config.moneyLabel || 0) + `元`;
		}

		let descTxt = index == 1 ? "免费赠送" : "全额返还";
		this.des.text = consume.count ? `${config.day}天后${descTxt}${consume.count}元宝` : ``;

		this.img.source = config.img;
		
		this.word.source = config.word;

		let vip = config.vip;
		this.vip.visible = vip > 0;
		if (this.vip.visible) {
			// this.vipimg.source = vip > 3?`ZZVip_png`:`HHVip_png`;
			this.vipLv.text = String(vip);//(vip > 3 ? vip - 3 : vip) + ``;
		}

		if (config.img != undefined && config.img != ``) {
			this.eff = this.eff || new MovieClip();
			this.eff.playFile(`${RES_DIR_EFF}artifacteff2`, -1);
			this.effGroup.addChild(this.eff);
		}
		else {
			DisplayUtils.removeFromParent(this.eff);
		}
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

	private onTouchBtn(): void {
		let data = this.getCurrentData();
		if (!data)
			return;

		let state = data.getBtnState();

		switch (state) {
			case ZeroElementBtnStateType.Buy:
				if (data.index != 1 && data.getIsVip()){
					if (GameServer.serverOpenDay + 1 < this.getConfig(data.index).openday)
						UserTips.ins().showTips(`开服第` + this.getConfig(data.index).openday + `天可购买`);
					else if (data.index == 2 || data.index == 3){
						let rechargeid = Recharge.ins().getZeroRechargeId(data.index);
						if (rechargeid) {
							Recharge.ins().showReCharge(rechargeid);
						}
					}
				}
				else
					UserTips.ins().showTips(`VIP等级不足`);
				break;

			case ZeroElementBtnStateType.CanReceived:
				Activity.ins().sendReceiveZeroElement(this.activityID, data.index);
				break;
		}
	}

	private getConfig(index: number): ActivityType17Config {
		let data = this.getActivityData();
		return data ? data.getConfig(index) : null;
	}

	private getActivityData(): ActivityType17Data {
		return Activity.ins().activityData[this.activityID] as ActivityType17Data;
	}

	private getCurrentData(): ZeroElementData {
		let data: ActivityType17Data = this.getActivityData();
		if (!data)
			return null;

		return data.giftBagDatas[this.getSelectIndex() - 1];
	}

	private updateTimeView(): void {
		let data: ActivityType17Data = this.getActivityData();
		this.actTime.text = data.getRemainTime();
	}
}