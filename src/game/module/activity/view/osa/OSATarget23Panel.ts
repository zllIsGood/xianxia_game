/**
 * 单笔充值 23
 */
class OSATarget23Panel extends ActivityPanel {
	private actTime: eui.Label;
	private actDesc: eui.Label;
	private gift: eui.List;

	private actData;
	private config;
	private curTime: number;

	public constructor() {
		super();
		this.skinName = `SinglepaySkin`;
	}

	protected childrenCreated() {
		super.childrenCreated();
		this.init();
	}

	public init() {
		this.config = GlobalConfig.ActivityType23Config[this.activityID];
		// console.log(this.config);

		this.gift.itemRenderer = OSSinglePayItem;

	}

	public open(...param: any[]): void {
		this.observe(Activity.ins().postChangePage,this.refreshData);

		this.refreshData();
	}

	public refreshData(): void {
		this.actData = Activity.ins().getActivityDataById(this.activityID) as ActivityType23Data;
		// console.log(this.actData);
		this.actDesc.text = this.actData.config.desc
		this.setTimer();

		let rewardData = [];
		for (let i in this.config) {
			let data: any = {};
			data.config = this.config[i];
			data.activityData = this.actData.activityData[data.config.index];
			if ((data.config.platform == 0 && LocationProperty.isNotNativeMode) || (data.config.platform == 1 && LocationProperty.isWeChatMode)) {
				rewardData.push(data);
			}
		}
		this.gift.dataProvider = new eui.ArrayCollection(rewardData);
	}

	public close(...param: any[]): void {
		this.removeObserve();
	}

	private setTimer(): void {
		if (TimerManager.ins().isExists(this.updateTimer,this)) {
			TimerManager.ins().remove(this.updateTimer,this);
		}
		this.curTime = this.actData.getLeftTime();
		this.actTime.text = DateUtils.getFormatBySecond(this.curTime,DateUtils.TIME_FORMAT_5,4);
		let overTimes: number = this.curTime;
		TimerManager.ins().doTimer(1000,overTimes,this.updateTimer,this);		
	}
	private updateTimer(): void {
		this.curTime -= 1;
		if (this.curTime <= 0) {
			this.actTime.text = "已结束";
			return;
		}
		this.actTime.text = DateUtils.getFormatBySecond(this.curTime,DateUtils.TIME_FORMAT_5,4);
	}

}

class OSSinglePayItem extends eui.ItemRenderer {
	private charge: eui.Label;
	private times: eui.Label;
	private reward: eui.List;
	private get: eui.Button;
	private redPoint: eui.Image;

	private getCount: number;

	public constructor() {
		super();
		this.skinName = "SinglepayItemSkin";
		this.reward.itemRenderer = ItemBase;
		this.get.addEventListener(egret.TouchEvent.TOUCH_END,this.onGetClick,this);
	}

	protected dataChanged() {
		super.dataChanged();
		// console.log(this.data);
		this.getCount = Math.min(this.data.activityData.rechargeCount,this.data.config.rewardCount)-this.data.activityData.rewardCount
		this.charge.text = this.data.config.amounts;
		this.times.text = `已领取次数：${this.data.activityData.rewardCount}/${this.data.config.rewardCount}`;
		this.reward.dataProvider = new eui.ArrayCollection(this.data.config.rewards);
		this.get.label = this.getCount>0?"领取":"去充值";
		this.get.visible = this.data.activityData.rewardCount<this.data.config.rewardCount;
		this.redPoint.visible = this.getCount>0;
		
	}

	private onGetClick(): void {
		if (this.getCount > 0) {
			Activity.ins().sendReward(this.data.config.Id,this.data.config.index);
			//console.log("领奖index: " + this.data.config.index);
		}
		else {
			ViewManager.ins().open(ChargeFirstWin);
		}
	}
}