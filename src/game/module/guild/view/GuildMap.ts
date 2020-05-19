class GuildMap extends BaseEuiView {

	private closeBtn: eui.Button;
	private rankBg: eui.Image;
	private cityBtn: eui.Button;
	private celebrityBtn: eui.Button;
	private manageBtn: eui.Button;
	private shopBtn: eui.Button;
	private practiseBtn: eui.Button;
	private activityBtn: eui.Button;
	private showBtn: eui.Button;
	private list: eui.List;
	private redPoint0: eui.Image;
	private redPoint1: eui.Image;
	private redPoint2: eui.Image;
	private redPoint3: eui.Image;
	private chatBtn: eui.Button;
	public guildWarEffect2: MovieClip;
	private guildRewardEff: MovieClip;

	private guildBoss: eui.Group;
	private reward: eui.Group;


	constructor() {
		super();
		this.isTopLevel = true;
		this.skinName = "GuildSkin";
	}

	protected childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}


	public init() {
		this.list.itemRenderer = GuildMapMemberItemRender;

		this.guildWarEffect2 = new MovieClip;

		this.guildRewardEff = new MovieClip;
		this.guildRewardEff.touchEnabled = true;

		//this.shopBtn.visible = !GameLogic.IS_OPEN_SHIELD;
	}

	public static openCheck(...param: any[]): boolean {
		return true;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.showBtn, this.onTap);
		this.addTouchEvent(this.manageBtn, this.onTap);
		this.addTouchEvent(this.practiseBtn, this.onTap);
		this.addTouchEvent(this.activityBtn, this.onTap);
		this.addTouchEvent(this.shopBtn, this.onTap);
		this.addTouchEvent(this.celebrityBtn, this.onTap);
		this.addTouchEvent(this.cityBtn, this.onTap);
		this.addTouchEvent(this.chatBtn, this.onTap);
		this.addTouchEvent(this.guildRewardEff, this.onTap);
		this.addTouchEvent(this.guildBoss, this.onTap);
		this.observe(GuildRedPoint.ins().postGuildFire, this.updateRedpoint);
		Guild.ins().sendMyGuildInfo();
		GuildWar.ins().requestGuildRank();
		this.updateRedpoint();
		if (GuildRobber.ins().isUpdateRobber) {
			GuildRobber.ins().isUpdateRobber = false;
			GuildRobber.ins().sendRobberInfo();
		}
		this.observe(GuildWar.ins().postGuildWarStarInfo, this.refushGuildwarEffect);
		this.refushGuildwarEffect();

		this.observe(GuildRedPoint.ins().postSendReward, this.updateSendBtnStatu);
		this.updateSendBtnStatu();
		this.observe(GuildRedPoint.ins().postSczb, this.updateGuildPoint);
		this.updateGuildPoint();
		this.observe(GuildRedPoint.ins().postHhdt, this.hhdtRed);
		this.hhdtRed();
		this.observe(GuildRedPoint.ins().postHanghuiBoss, this.updateBossPoint);
		this.updateBossPoint();
		this.observe(Guild.ins().postGuildMembers, this.updateList);
		this.updateList();
	}

	public close(...param: any[]): void {
		DisplayUtils.removeFromParent(this.guildWarEffect2);
		DisplayUtils.removeFromParent(this.guildRewardEff);
	}

	private hhdtRed(): void {
		this.redPoint0.visible = GuildRedPoint.ins().hhdt;
	}

	private updateRedpoint(): void {
		this.redPoint1.visible = GuildRedPoint.ins().guildFire || GuildRedPoint.ins().liangongRed;//GuildFB.ins().hasbtn();
	}

	private updateGuildPoint(): void {
		this.redPoint2.visible = GuildRedPoint.ins().sczb;
	}

	private updateBossPoint(): void {
		this.redPoint3.visible = GuildRedPoint.ins().hhBoss;
	}

	private updateList(): void {
		this.list.dataProvider = new eui.ArrayCollection(Guild.ins().getGuildMembers(2));
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
				ViewManager.ins().close(GuildMap);
				break;
			case this.showBtn:
				this.list.visible = !this.list.visible;
				this.rankBg.visible = this.list.visible;
				break;
			case this.practiseBtn:
				ViewManager.ins().close(GuildMap);
				ViewManager.ins().open(GuildSkillWin);
				break;
			case this.activityBtn:
				ViewManager.ins().open(GuildActivityWin);
				break;
			case this.manageBtn:
				ViewManager.ins().close(GuildMap);
				ViewManager.ins().open(GuildWin);
				break;
			case this.cityBtn:
				GuildWar.ins().requestWinGuildInfo();
				ViewManager.ins().close(GuildMap);
				ViewManager.ins().open(GuildWarMainWin);
				break;
			case this.celebrityBtn:
				ViewManager.ins().open(GuildBossWin);
				break;
			case this.shopBtn:
				ViewManager.ins().open(GuildBossWin);
				break;
			case this.chatBtn:
				ViewManager.ins().open(ChatWin);
				break;
			case this.guildRewardEff:
				//帮派战奖励分配
				ViewManager.ins().open(SelectMemberRewardWin);
				break;
			case this.guildBoss:
				ViewManager.ins().open(GuildBossWin);
				break;
		}
	}

	private updateSendBtnStatu(): void {
		if (GuildRedPoint.ins().sendReward) {
			this.guildRewardEff.playFile(RES_DIR_EFF + "giftShake", -1);
			this.reward.addChild(this.guildRewardEff);
		} else {
			DisplayUtils.removeFromParent(this.guildRewardEff);
		}
	}

	private refushGuildwarEffect(): void {
		if (GuildWar.ins().getModel().isWatStart) {
			this.guildWarEffect2.playFile(RES_DIR_EFF + "swordSparkEff", -1);
			this.guildWarEffect2.x = 35;
			this.guildWarEffect2.y = 305;
			this.cityBtn.addChild(this.guildWarEffect2);
		} else {
			DisplayUtils.removeFromParent(this.guildWarEffect2);
		}
	}
}

ViewManager.ins().reg(GuildMap, LayerManager.UI_Popup);
