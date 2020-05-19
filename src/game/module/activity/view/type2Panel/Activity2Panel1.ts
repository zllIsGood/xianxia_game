class Activity2Panel1 extends BaseView {
	public date: eui.Label;
	public desc: eui.Label;


	public vipTxt: eui.Label;

	public label_title0: eui.Label;
	public item0: ItemIcon;
	public price0: PriceIcon;
	public buy0: eui.Button;
	public redPoint0: eui.Group;
	public desc0: eui.Label;
	public label_title1: eui.Label;
	public item1: ItemIcon;
	public price1: PriceIcon;
	public buy1: eui.Button;
	public redPoint1: eui.Group;
	public desc1: eui.Label;
	public label_title2: eui.Label;
	public bg1: eui.Image;
	public item2: ItemIcon;
	public price2: PriceIcon;
	public buy2: eui.Button;
	public redPoint2: eui.Group;
	public desc2: eui.Label;
	public imgDiscount0: eui.Image;
	public imgDiscount1: eui.Image;
	public imgDiscount2: eui.Image;
	public itemname0: eui.Label;
	public itemname1: eui.Label;
	public itemname2: eui.Label;

	//奖励道具数量
	public itemCount0: eui.Label;
	public itemCount1: eui.Label;
	public itemCount2: eui.Label;


	public group_item0: eui.Group;
	public group_item1: eui.Group;
	public group_item2: eui.Group;

	public img: eui.Image;
	private activityID: number;

	constructor() {
		super();

		this.skinName = "LimitGiftActSkin";
	}

	protected childrenCreated(): void {
		super.childrenCreated();

	}

	public open(...param: any[]): void {
		this.updateData();

		this.addTouchEvent(this.buy0, this.onTap);
		this.addTouchEvent(this.buy1, this.onTap);
		this.addTouchEvent(this.buy2, this.onTap);
	}

	public close(...param: any[]): void {
		debug.log("close");

		this.removeTouchEvent(this.buy0, this.onTap);
		this.removeTouchEvent(this.buy1, this.onTap);
		this.removeTouchEvent(this.buy2, this.onTap);
	}

	private onTap(e: egret.TouchEvent): void {
		let config: ActivityType2Config;
		let index: number;
		switch (e.currentTarget) {
			case this.buy0:
				index = 0;
				break;
			case this.buy1:
				index = 1;
				break;
			case this.buy2:
				index = 2;
				break;
		}

		let activityData: ActivityType2Data = Activity.ins().activityData[this.activityID] as ActivityType2Data;
		config = GlobalConfig.ActivityType2Config[this.activityID][index];
		let buyData: number = activityData.buyData[index] || 0;
		let myMoney: number = (config.currencyType == 1 ? Actor.gold : Actor.yb);
		let typeName: string = (config.currencyType == 1 ? "金币" : "元宝");

		if (config.vip && UserVip.ins().lv < config.vip) {
			UserTips.ins().showTips("vip等级不足");
		}
		else {
			let id: number = this.configList[index].rewards[0].id;
			let type: number = ItemConfig.getType(GlobalConfig.ItemConfig[id]);
			if (UserBag.ins().getSurplusCount() < 1 && type == 0) {
				UserTips.ins().showTips("|C:0xf3311e&T:背包已满，请清理背包|");
				return;
			}
			if (myMoney >= config.price) {
				WarnWin.show(`确定消耗${config.price}` + typeName + `购买特惠商品吗？`, () => {
					// ControllerManager.ins().applyFunc(ControllerConst.Activity, ActivityFunc.SEND_ACTIVITY_REWARD, this.activityID, index + 1);
					Activity.ins().sendReward(this.activityID, index + 1);
				}, this);
			}
			else
				UserTips.ins().showTips(typeName + "不足");
		}
	}

	private configList: ActivityType2Config[]

	public updateData() {
		let activityData: ActivityType2Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType2Data;
		let beganTime = Math.floor((DateUtils.formatMiniDateTime(activityData.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(activityData.endTime) - GameServer.serverTime) / 1000);
		if (beganTime >= 0) {
			this.date.text = "活动未开启";
		} else if (endedTime <= 0) {
			this.date.text = "活动已结束";
		} else {
			let day: number = Math.floor(endedTime / (3600 * 24));
			let hour: number = Math.floor((endedTime % (3600 * 24)) / 3600);
			let minu: number = Math.floor((endedTime % 3600) / 60);
			this.date.text = day + "天" + hour + "小时" + minu + "分";
		}

		this.desc.text = GlobalConfig.ActivityConfig[this.activityID].desc;

		this.configList = GlobalConfig.ActivityType2Config[this.activityID];

		if (this.group_item0) this.group_item0.visible = false;
		if (this.group_item1) this.group_item1.visible = false;
		if (this.group_item2) this.group_item2.visible = false;
		for (let i = 0; i < this.configList.length; i++) {
			let config: ActivityType2Config = this.configList[i];
			let buyData: number = activityData.buyData[i] || 0;
			let item: ItemIcon = this["item" + i];
			let itemCount: eui.Label = this["itemCount" + i];
			let label_title: eui.Label = this["label_title" + i];
			let price: PriceIcon = this["price" + i];
			let desc: eui.Label = this["desc" + i];
			let buy: eui.Button = this["buy" + i];
			let redPoint: eui.Group = this["redPoint" + i];
			let group_item: eui.Group = this["group_item" + i];
			let imgDiscount: eui.Image = this["imgDiscount" + i];
			let nameLabel: eui.Label = this["itemname" + i];
			let title: eui.Image = this["title" + i];
			let itemCfg: ItemConfig = GlobalConfig.ItemConfig[config.rewards[0].id];

			if (item) {
				item.setData(itemCfg);
				itemCount.text = config.rewards[0].count + "";
			}
			if (nameLabel) {
				nameLabel.text = itemCfg.name;
			}
			if (label_title) {
				label_title.text = config.vip ? `${UserVip.formatLvStr(config.vip)}特权` : "全民特惠";
			}
			if (price) {
				price.setText(config.price + "");
				price.setType((config.currencyType == 1 ? MoneyConst.gold : MoneyConst.yuanbao));
			}
			if (desc) {
				desc.text = "今日购买次数：" + (config.count - buyData);
			}
			if (title) {
				title.source = "tq_" + (config.vip < 10 ? "0" + config.vip : config);
			}
			if (buy) {
				buy.enabled = (config.count - buyData) > 0;
			}
			if (redPoint) {
				redPoint.visible = Activity.ins().getisCanBuyXianGouItem(this.activityID + "", i);
			}
			if (group_item) {
				group_item.visible = true;
			}
			if (imgDiscount) {
				// imgDiscount.source = config.discount;
			}
		}
	}
}