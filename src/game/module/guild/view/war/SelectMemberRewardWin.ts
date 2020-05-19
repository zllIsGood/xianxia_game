class SelectMemberRewardWin extends BaseEuiView {

	public rankLabel: eui.Label;
	public list: eui.List;
	public sendReward: eui.Button;
	public bgClose: eui.Rect;

	public dataLen: number[] = [];

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "SelectMemberRewardSkin";
		this.list.itemRenderer = SelectRewardItemRenderer;
	}

	public open(...param: any[]): void {
		GuildWar.ins().requestOwnMyGuildRank();

		this.addTouchEvent(this.bgClose, this.onTap);
		this.addTouchEvent(this.sendReward, this.onTap);
		this.observe(GuildWar.ins().postSendListChange, this.refushList);
		this.refushPanelInfo();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.bgClose, this.onTap);
		this.removeTouchEvent(this.sendReward, this.onTap);
		this.removeObserve();
		ViewManager.ins().open(GuildMap);
	}

	private refushPanelInfo(): void {
		this.rankLabel.text = "本次仙盟争霸仙盟排名：第" + GuildWar.ins().getModel().guildWarRank + "名";
		this.dataLen.length = GuildWar.ins().getModel().getCanSendNumByRank();
		this.refushList();
	}

	private refushList(): void {
		this.list.dataProvider = new eui.ArrayCollection(this.dataLen);
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.bgClose:
				ViewManager.ins().close(SelectMemberRewardWin);
				break;
			case this.sendReward:
				TimerManager.ins().doTimer(100, 1, () => {
						if (GuildWar.ins().getModel().checkISSendAll()) {
							GuildWar.ins().sendFenReward(this.dataLen.length, GuildWar.ins().getModel().sendList);
						}
					},
					this);
				break;
		}
	}
}
ViewManager.ins().reg(SelectMemberRewardWin, LayerManager.UI_Popup);