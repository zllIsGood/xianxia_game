class Activity2Panel2 extends BaseView {

	private activityID: number;

	public get_1: eui.Image;
	public get_2: eui.Image;
	public get_3: eui.Image;
	public get_4: eui.Image;
	public list: eui.List;
	public buyBtn: eui.Button;
	public type_1: eui.Button;
	public type_2: eui.Button;
	public type_3: eui.Button;
	public type_4: eui.Button;
	public chosen: eui.Image;
	public date: eui.Label;
	public desc: eui.Label;

	private _index: number = 0;
	private config: ActivityType2Config;
	private static giftNameArr:string[] = ["超值礼包","豪华礼包","神翅礼包","玄玉礼包"];
	constructor() {
		super();
		this.skinName = "ActGiftSkin";
		this.list.itemRenderer = ItemBase;
	}

	protected childrenCreated(): void {
		super.childrenCreated();
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.buyBtn, this.onTap);
		this.addTouchEvent(this.type_1, this.onTap);
		this.addTouchEvent(this.type_2, this.onTap);
		this.addTouchEvent(this.type_3, this.onTap);
		this.addTouchEvent(this.type_4, this.onTap);
		this.updateData();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.buyBtn, this.onTap);
		this.removeTouchEvent(this.type_1, this.onTap);
		this.removeTouchEvent(this.type_2, this.onTap);
		this.removeTouchEvent(this.type_3, this.onTap);
		this.removeTouchEvent(this.type_4, this.onTap);
	}

	private onTap(e: egret.TouchEvent): void {
		let index: number;
		switch (e.currentTarget) {
			case this.buyBtn:
				index = -1;
				if (this.config.vip && UserVip.ins().lv < this.config.vip) {
					UserTips.ins().showTips("vip等级不足");
				}
				else {
					if (UserBag.ins().getSurplusCount() < 1 && this._index == 3) {
						UserTips.ins().showTips("|C:0xf3311e&T:背包已满，请清理背包|");
						return;
					}
					if (Actor.yb >= this.config.price) {
						WarnWin.show(`确定消耗${this.config.price}元宝购买特惠商品吗？`, () => {
							// ControllerManager.ins().applyFunc(ControllerConst.Activity, ActivityFunc.SEND_ACTIVITY_REWARD, this.activityID, this._index + 1);
							Activity.ins().sendReward(this.activityID, this._index + 1);
						}, this);
					}
					else
						UserTips.ins().showTips("元宝不足");
				}
				break;
			case this.type_1:
				index = 0;
				break;
			case this.type_2:
				index = 1;
				break;
			case this.type_3:
				index = 2;
				break;
			case this.type_4:
				index = 3;
				break;
		}
		if (index != -1)
			this.updateData(index);
	}

	public updateData(index: number = 0) {
		let activityData: ActivityType2Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType2Data;
		let beganTime = Math.floor((DateUtils.formatMiniDateTime(activityData.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(activityData.endTime) - GameServer.serverTime) / 1000);
		if (beganTime >= 0) {
			this.date.text = "活动未开启";
		} else if (endedTime <= 0) {
			this.date.text = "活动已结束";
		} else {
			this.date.text = DateUtils.getFormatBySecond(endedTime, DateUtils.TIME_FORMAT_5, 3);
		}
		this.config = GlobalConfig.ActivityType2Config[this.activityID][index];
		this.list.dataProvider = new eui.ArrayCollection(this.config.rewards);
		let giftName: string = Activity2Panel2.giftNameArr[index]
		let str:string = `花费<font color = '#FF964C'>${this.config.price}</font>元宝即可获得<font color = '#FF964C'>${giftName}</font>`;
		this.desc.textFlow = new egret.HtmlTextParser().parser(str);
		this.chosen.x = 7 + index * 105;
		this._index = index;
		this.get_1.visible = activityData.buyData[0] == 1;
		this.get_2.visible = activityData.buyData[1] == 1;
		this.get_3.visible = activityData.buyData[2] == 1;
		this.get_4.visible = activityData.buyData[3] == 1;
		this.buyBtn.visible = activityData.buyData[index] == 0;
	}
}