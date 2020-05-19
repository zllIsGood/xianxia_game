class GuildWarMainWin extends BaseEuiView {

	public closeBtn0: eui.Button;
	public redBag: eui.Button;
	public closeBtn: eui.Button;
	public help: eui.Button;
	public play: eui.Button;
	public guildName: eui.Label;
	public guildOwn: eui.Label;
	public openDesc: eui.Label;
	public none: eui.Group;

	private redEff: MovieClip;
	private enterEff: MovieClip;
	private titleEff: MovieClip;

	public practiseBtn2: eui.Button;
	public practiseBtn1: eui.Button;
	public practiseBtn: eui.Button;
	public practiseBtn0: eui.Button;
	public redPoint0: eui.Image;
	public titleGroup: eui.Group;

	private roleEff: MovieClip;
	private roleBodyImg: eui.Image;
	private roleWeaponImg: eui.Image;
	private player: eui.Group;

	constructor() {
		super();
	}


	public initUI(): void {
		super.initUI();
		this.isTopLevel = true;
		this.redEff = new MovieClip;

		this.enterEff = new MovieClip;

		this.titleEff = new MovieClip();

		this.skinName = "GuildWarMainSkin";

		// this.roleEff = new MovieClip;
		this.roleBodyImg = new eui.Image;
		this.roleWeaponImg = new eui.Image;
		// this.player.addChild(this.roleEff);
		this.player.addChild(this.roleWeaponImg);
		this.player.addChild(this.roleBodyImg);

		// this.setSkinPart("roleSelect", new RoleSelectPanel());
	}

	public open(...param: any[]): void {

		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.practiseBtn, this.onTap);
		this.addTouchEvent(this.redBag, this.onTap);
		this.addTouchEvent(this.play, this.onTap);
		this.addTouchEvent(this.practiseBtn2, this.onTap);
		this.addTouchEvent(this.practiseBtn0, this.onTap);
		this.addTouchEvent(this.help, this.onTap);
		this.addTouchEvent(this.practiseBtn1, this.onTap);
		this.observe(GuildWar.ins().postDayRewardInfo, this.refushRewardStatu);
		this.observe(GuildWar.ins().postGuildRedPointChange, this.refushRewardStatu);
		this.observe(GuildWar.ins().postJoinPlayBack, this.refushStartEffect);
		this.practiseBtn1.visible = (GuildWar.ins().getModel().guildRankList.length > 0 && !GuildWar.ins().getModel().isWatStart);
		this.refushPanelInfo();
		this.refushStartEffect();
		this.refushTitleEffect();

		this.observe(GuildRedPoint.ins().postRedBag, this.updateRedBag);
		this.observe(GuildRedPoint.ins().postDayReward, this.updateRedBag);
		this.updateRedBag();
	}

	private updateRedBag(): void {
		this.redBag.visible = GuildRedPoint.ins().redBag;
		this.redPoint0.visible = GuildRedPoint.ins().dayReward;
	}

	public close(...param: any[]): void {
		ViewManager.ins().open(GuildMap);
	}

	private refushPanelInfo(): void {
		if (GuildWar.ins().getModel().isWatStart)
			this.openDesc.text = "";
		else
			this.openDesc.text = GuildWar.ins().getModel().setOpenDesc();

		this.refushRewardStatu();
		this.refushWinGuild();
	}

	private refushStartEffect(): void {
		if (GuildWar.ins().getModel().isWatStart) {
			this.enterEff.playFile(RES_DIR_EFF + "chargeff1", -1);
			this.enterEff.x = this.play.width >> 1;
			this.enterEff.y = (this.play.height >> 1) + 2;
			// this.enterEff.scaleX = this.enterEff.scaleY = 0.8;
			this.play.addChild(this.enterEff);
		} else {
			DisplayUtils.removeFromParent(this.enterEff);
		}
	}

	private refushTitleEffect(): void {
		this.titleEff.playFile(RES_DIR_EFF + "ch_41", -1);
		this.titleGroup.addChild(this.titleEff);
	}

	private refushRewardStatu(): void {
		if (GuildWar.ins().getModel().canSend || GuildWar.ins().getModel().canRod) {
			this.redEff.playFile(RES_DIR_EFF + "actIconCircle", -1);
			this.redEff.x = 32;
			this.redEff.y = 40;
			this.redBag.addChild(this.redEff);
		} else {
			DisplayUtils.removeFromParent(this.redEff);
		}
	}

	private refushWinGuild(): void {
		let show: boolean = GuildWar.ins().getModel().winGuildInfo.guildId > 0;
		this.guildOwn.visible = show;
		this.guildName.visible = show;
		this.roleBodyImg.visible = show;
		this.roleWeaponImg.visible = show;
		// this.roleEff.visible = show;
		this.none.visible = !show;
		if (show) {
			let data: WinGuildInfo = GuildWar.ins().getModel().winGuildInfo;
			this.guildName.text = data.guildName;
			this.guildOwn.text = data.guildOwnName;

			// let effstr: string = data.guildOwnSex == 1 ? "junzhunv" : "junzhunan";
			// this.roleEff.playFile(RES_DIR_EFF + effstr, -1);
			let job: number = data.guildOwnJob;
			let sex: number = data.guildOwnSex;
			this.roleBodyImg.source = `body${job}10_${sex}_c_png`;
			this.roleWeaponImg.source = `weapon${job}10_${sex}_c_png`;
		}
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(GuildWarMainWin);
				break;
			case this.practiseBtn:
				ViewManager.ins().open(GuildWarRewardWin);
				break;
			case this.redBag:
				if (GuildWar.ins().getModel().canRod || GuildWar.ins().getModel().canSend)
					ViewManager.ins().open(RedBagWin);
				else
					ViewManager.ins().open(RedBagDetailsWin);
				break;
			case this.play:
				if (!GuildWar.ins().getModel().isWatStart) {
					UserTips.ins().showTips("|C:0xf3311e&T:活动未开启|");
					return;
				}
				ViewManager.ins().close(GuildMap);
				ViewManager.ins().close(GuildWarMainWin);
				GuildWar.ins().requestJoinAc();
				break;
			case this.practiseBtn0:
				ViewManager.ins().open(DailypresidentAwardPanel);
				break;
			case this.practiseBtn2:
				ViewManager.ins().open(DailyAwardPanel);
				break;
			case this.help:
				ViewManager.ins().open(ZsBossRuleSpeak, 8);
				break;
			case this.practiseBtn1:
				ViewManager.ins().open(GuildWarRewardWin, 0, 1);
				break;
		}
	}
}

ViewManager.ins().reg(GuildWarMainWin, LayerManager.UI_Main);