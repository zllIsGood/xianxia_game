/**
 * Created by hrz on 2017/9/7.
 */

class OSATargetDays42ItemRender2 extends BaseItemRender {
	private reward: ItemBase;
	private days: eui.Label;
	private state: eui.Image;

	constructor() {
		super();
		this.skinName = `Days42BigRewardItemSkin`;
	}

	protected childrenCreated() {
		super.childrenCreated();
	}

	dataChanged() {
		super.dataChanged();
		let data = this.data as RechargeDaysAwardsConfig;
		this.days.text = "";//`${data.id}天`;
		if(data.awardList.length>1){
			this.reward.data = data.awardList[1];
		} else {
			this.reward.data = data.awardList[0];
		}

		if (Recharge.ins().rechargeTotal.hasGetDays.length >= 42) {
			this.state.visible = true;
		} else if (Recharge.ins().rechargeTotal.hasGetDays.indexOf(data.id) >= 0) {
			this.state.visible = true;
		} else {
			this.state.visible = false;
		}
	}
}