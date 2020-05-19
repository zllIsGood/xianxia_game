/**
 * 活动2-1控件
 */
class OSATargetItemRender1 extends BaseItemRender {
	private reward: eui.List;
	private original: eui.Label;
	private now: eui.Label;
	private get: eui.Button;
	private discountNum: eui.BitmapLabel;

	private actId: number;
	private index: number;
	private isGet: boolean;//是否可领取
	private redPoint: eui.Image;
	private already: eui.Label;
	private vip: eui.Group;
	private vipLv: eui.BitmapLabel;
	private times: eui.Label;

	// public vipimg: eui.Image;

	constructor() {
		super();
		this.skinName = 'OSADailyGiftItemSkin';
		this.init();
	}


	protected init(): void {
		this.addEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
		this.reward.itemRenderer = ItemBase;

	}
	/**触摸事件 */
	public onClick(e: egret.Event) {
		switch (e.target) {
			case this.get:
				if (this.isGet) {
					Activity.ins().sendReward(this.actId, this.index);
				} else {
					let config: ActivityType2Config = this.data;
					if (config) {
						if (UserVip.ins().lv < config.vip)
							UserTips.ins().showTips(`|C:0xff0000&T:VIP等级不满足要求|`);
						else
							UserTips.ins().showTips(`|C:0xf3311e&T:元宝不足|`);
					}
				}
				break;
		}
	}

	protected dataChanged(): void {
		if (!this.data) return;
		let config: ActivityType2Config = this.data;
		let act2Data: ActivityType2Data = Activity.ins().getActivityDataById(config.Id) as ActivityType2Data;
		if (!config || !act2Data) {
			this.isGet = false;
			return;
		}
		this.redPoint.visible = false;
		//已领取
		if (act2Data.buyData[config.index] >= config.count) {
			this.isGet = false;
			this.already.visible = true;
		}
		else {
			//未领取
			this.isGet = UserVip.ins().lv >= config.vip && Actor.yb >= config.price;
			this.already.visible = false;
			this.redPoint.visible = this.getRedPoint(config);
		}
		let cur: number = config.count - act2Data.buyData[config.index];
		cur = cur <= 0 ? 0 : cur;
		let colorStr = cur ? 0x00ff00 : 0xff0000;
		this.times.textFlow = TextFlowMaker.generateTextFlow1(`可购买：|C:${colorStr}&T:${cur}|/${config.count}`);
		this.times.visible = this.get.visible = !this.already.visible;
		// this.get.touchEnabled = this.redPoint.visible;
		// this.get.label = this.redPoint.visible?"领取":"未完成";

		this.original.text = config.originalPrice + "";
		this.now.text = config.price + "";
		this.reward.dataProvider = new eui.ArrayCollection(config.rewards);
		this.actId = config.Id;
		this.index = config.index;
		if (config.discount) {
			this.discountNum.text = config.discount + "";	
		}

		if (config.vip) {
			// this.vipimg.source = config.vip <= 3 ? "HHVip_png" : "ZZVip_png"
			this.vip.visible = true;
			this.vipLv.text = String(config.vip);// <= 3 ? config.vip + "" : (config.vip - 3) + "";
		} else {
			this.vip.visible = false;
		}

		//特殊需求 50级以前不要红点
		if (Actor.level < ActivityType2Data.LimitLevel)
			this.redPoint.visible = false;

	}
	//
	private getRedPoint(config: ActivityType2Config) {
		return UserVip.ins().lv >= config.vip && Actor.yb >= config.price;
	}

	public destruct(): void {
		this.removeEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
	}


}