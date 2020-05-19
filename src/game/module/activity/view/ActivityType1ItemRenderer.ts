/**
 *
 * @author hepeiye
 *
 */
class ActivityType1ItemRenderer extends BaseItemRender {
	private rewardedTip: eui.Image;
	private rewardBtn: eui.Button;
	private list: eui.List;

	public level: eui.Image;


	constructor() {
		super();

		this.skinName = "ActLevelSonSkin";
		this.list.itemRenderer = ItemBase;
		this.rewardBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.reward, this);
	}

	public dataChanged(): void {
		let config: ActivityType1Config = this.data;
		let data: ActivityType1Data = Activity.ins().getActivityDataById(config.Id) as ActivityType1Data;

		if (config.zslevel > 0) {
			// this.level.text = config.zslevel + "转";
			this.level.source = `level_${8 + config.zslevel}`;
		} else {
			// this.level.text = config.level + "级";
			this.level.source = `level_${config.level / 10}`;
		}

		this.currentState = data.getRewardStateById(config.index - 1) + "";

		this.list.dataProvider = new eui.ArrayCollection(config.rewards);
	}


	private reward(e: egret.TouchEvent) {
		let config: ActivityType1Config = this.data;
		if (UserBag.ins().getSurplusCount() < 1 && this.data.index == 13) {
			UserTips.ins().showTips("|C:0xf3311e&T:背包已满，请清理背包|");
		}
		else {
			Activity.ins().sendReward(config.Id, config.index);
		}
	}
}