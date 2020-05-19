class DailyAwardPanel extends BaseEuiView {

	public desc: eui.Label;
	public closeBtn: eui.Button;
	public sure: eui.Button;
	public closeBtn1: eui.Button;
	public list: eui.List;
	private bgClose: eui.Rect;


	public initUI(): void {
		super.initUI();
		this.skinName = "DailyAwardSkin";
		this.isTopLevel = true;
		this.list.itemRenderer = ItemBase;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn1, this.onTap);
		this.addTouchEvent(this.sure, this.onTap);
		this.addTouchEvent(this.bgClose, this.onTap);
		this.list.dataProvider = new eui.ArrayCollection(GlobalConfig.GuildBattleDayAward[GuildWar.ins().getModel().rewardDay].award);

		if(GuildWar.ins().getModel().getDayReward){
			this.sure.label = `已领取`;
			this.sure.enabled = false;
		} else {
			this.sure.label = `领取`;
			this.sure.enabled = true;
		}
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn1, this.onTap);
		this.removeTouchEvent(this.sure, this.onTap);
		this.removeTouchEvent(this.bgClose, this.onTap);
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn1:
				ViewManager.ins().close(DailyAwardPanel);
				break;
			case this.sure:
				//egret.log("GuildWar.ins().getModel().canGetDay = "+GuildWar.ins().getModel().canGetDay);
				if (GuildWar.ins().getModel().getDayReward) {
					UserTips.ins().showTips("|C:0xf3311e&T:已领取奖励，无法再次领取|");
					return;
				}
				else if (!GuildWar.ins().getModel().canGetDay) {
					UserTips.ins().showTips("|C:0xf3311e&T:仙盟占领仙盟才能领取每日奖励|");
					return;
				}
				GuildWar.ins().requestDayReward(GuildWar.ins().getModel().rewardDay);
				ViewManager.ins().close(DailyAwardPanel);
				break;
			case this.bgClose:
				ViewManager.ins().close(this);
				break;

		}
	}
}

ViewManager.ins().reg(DailyAwardPanel, LayerManager.UI_Main);