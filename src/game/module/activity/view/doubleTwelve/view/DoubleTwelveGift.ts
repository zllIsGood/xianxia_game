/**
 * Created by Peach.T on 2017/12/7.
 */
class DoubleTwelveGift extends BaseView {

	public activityID: number;

	private _index: number = 0;
	private config: ActivityType2Config;
	private static giftNameArr: string[] = ["", "材料礼包", "图鉴礼包", "羽翼礼包", "神兵礼包"];

	private buy: eui.Button;
	private szlb: eui.Group;
	private lhlb: eui.Group;
	private yylb: eui.Group;
	private sblb: eui.Group;
	//item0-6
	//select0-3
	private showbg: eui.Image;

	private desc1: eui.Label;
	private desc3: eui.Label;
	private desc5: eui.Label;

	public actTime: eui.Label;

	private already: eui.Label;
	private redPoint: eui.Image;
	private title: eui.Image;

	constructor() {
		super();
	}

	protected childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}

	public init() {
		let idx: number = this.getRule();
		this.updateData(idx);
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.buy, this.onTap);
		this.addTouchEvent(this.szlb, this.onTap);
		this.addTouchEvent(this.lhlb, this.onTap);
		this.addTouchEvent(this.yylb, this.onTap);
		this.addTouchEvent(this.sblb, this.onTap);
		this.observe(Activity.ins().postRewardResult, this.GetCallBack);
		TimerManager.ins().doTimer(1000, 0, this.setTime, this);
		this.hideSelect();

		let idx: number = this.getRule();
		this.updateData(idx);
	}

	public close():void
    {
        this.removeObserve();
		TimerManager.ins().removeAll(this);

    }

	private hideSelect() {
		for (let i = 0; i < 4; i++) {
			this["select" + i].visible = false;
			this["arrow" + i].visible = false;
			this["select" + i].visible = false;
		}
	}

	private GetCallBack(activityID: number) {
		if (this.activityID != activityID)return;
		if (!Activity.ins().isSuccee) {
			UserTips.ins().showTips("领取失败");
			let activityData: ActivityType2Data = Activity.ins().doubleTwelveData[this.activityID] as ActivityType2Data;
			Activity.ins().sendChangePage(activityData.id);
		}
		Activity.ins().isSuccee = false;
		this.hideSelect();
		let idx: number = this.getRule();
		this.updateData(idx);
	}

	private onTap(e: egret.TouchEvent): void {
		let index: number;
		switch (e.currentTarget) {
			case this.buy:
				if (this.config.vip && UserVip.ins().lv < this.config.vip) {
					UserTips.ins().showTips("vip等级不足");
				}
				else {
					if (UserBag.ins().getSurplusCount() < 7) {
						UserTips.ins().showTips("|C:0xf3311e&T:背包已满，请清理背包|");
						return;
					}
					if (Actor.yb >= this.config.price) {
						Activity.ins().sendReward(this.activityID, this._index);
					} else {
						UserTips.ins().showTips("|C:0xf3311e&T:元宝不足|");
					}
				}
				index = -1;
				break;
			case this.lhlb://材料礼包
				index = 1;
				break;
			case this.yylb://图鉴礼包:
				index = 2;
				break;
			case this.szlb://翅膀礼包
				index = 3;
				break;
			case this.sblb://神兵礼包
				index = 4;
				break;
		}
		if (index != -1) {
			for (let i = 0; i < 4; i++) {
				if (index != (i + 1))
					this["select" + i].visible = false;
				else
					this["select" + i].visible = true;
				this["arrow" + i].visible = this["select" + i].visible;
			}
			this.updateData(index);
		}
	}

	//显示规则:默认显示未购买的 价格最低的活动页
	//当礼包购买时 显示最左边的
	public getRule(): number {
		let activityData: ActivityType2Data = Activity.ins().doubleTwelveData[this.activityID] as ActivityType2Data;
		let tmplist: ActivityType2Config[] = GlobalConfig.ActivityType2Config[this.activityID];
		let listData: ActivityType2Config[] = [];
		for (let k in tmplist) {
			listData.push(tmplist[k]);
		}
		listData.sort(this.sortFunc);
		//经过规则排序后的列表
		for (let i = 0; i < listData.length; i++) {
			let config: ActivityType2Config = listData[i];
			let isBuy: boolean = activityData.buyData[config.index] >= config.count ? true : false;
			if (!isBuy)//未购买的
				return config.index;
		}
		return 2;
	}

	private sortFunc(aConfig: ActivityType2Config, bConfig: ActivityType2Config): number {
		if (aConfig.price < bConfig.price)
			return -1;
		if (aConfig.price > bConfig.price)
			return 1;
		return 0;
	}

	public updateData(index: number = 2) {
		this._index = index;
		this["select" + (index - 1)].visible = true;
		this["arrow" + (index - 1)].visible = true;
		let activityData: ActivityType2Data = Activity.ins().doubleTwelveData[this.activityID] as ActivityType2Data;
		this.setTime();
		this.config = GlobalConfig.ActivityType2Config[this.activityID][index];
		let btncfg: ActivityBtnConfig = GlobalConfig.ActivityBtnConfig[this.activityID];
		if (btncfg)
			this.title.source = btncfg.title;
		this.desc3.text = this.config.price + "";

		this.desc5.text = this.config.giftName;//OSATarget2Panel2.giftNameArr[index];
		//奖励
		for (let i = 0; i < this.config.rewards.length; i++) {
			let rew: RewardData = this.config.rewards[i];
			this["item" + i].data = {type: rew.type, count: rew.count, id: rew.id};
			if (this["item" + i].getItemType() == 17)
				this["item" + i].showSpeicalDetail = false;
		}
		let isBuy: boolean = activityData.buyData[this._index] >= this.config.count ? true : false;
		this.buy.visible = !isBuy;
		this.already.visible = isBuy;
		this.actTime.visible = !this.already.visible;

		this.showbg.source = this.config.source[2] + "_png";
		this.redPoint.visible = this.buy.visible && Actor.yb >= this.config.price;

		//特殊需求 50级以前不要红点
		if (Actor.level < ActivityType2Data.LimitLevel)
			this.redPoint.visible = false;

		for (let i in GlobalConfig.ActivityType2Config[this.activityID]) {
			let cfg: ActivityType2Config = GlobalConfig.ActivityType2Config[this.activityID][i];
			if (cfg && cfg.source[0]) {
				this[`bg${+i - 1}`].source = cfg.source[0];
			}
			if (cfg && cfg.source[1]) {
				this[`name${+i - 1}`].source = cfg.source[1];
			}
		}
	}

	private setTime() {
		let activityData: ActivityType2Data = Activity.ins().doubleTwelveData[this.activityID] as ActivityType2Data;
		let beganTime = Math.floor((DateUtils.formatMiniDateTime(activityData.startTime) - GameServer.serverTime) / 1000);
		let endedTime = Math.floor((DateUtils.formatMiniDateTime(activityData.endTime) - GameServer.serverTime) / 1000);
		if (beganTime >= 0) {
			this.actTime.text = "活动未开启";
		} else if (endedTime <= 0) {
			this.actTime.text = "活动已结束";
		} else {
			this.actTime.text = DateUtils.getFormatBySecond(endedTime, DateUtils.TIME_FORMAT_5, 3);
		}
	}
}
