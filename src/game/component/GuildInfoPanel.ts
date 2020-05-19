class GuildInfoPanel extends BaseComponent {

	private guildName: eui.Label;
	private guildMember: eui.Label;
	private checkJoin: eui.Label;
	private myCon: eui.Label;
	private guildMoney: eui.Label;
	private guildLevel: eui.Label;
	private conBtn: eui.Button;
	private list: eui.List;
	private notice: eui.Label;
	private eff: MovieClip;
	private isInit: boolean = false;
	private userGuild: Guild = Guild.ins();
	public cityBtn: eui.Button;
	public rename: eui.Button;


	public constructor() {
		super();
	}

	public childrenCreated(): void {
		this.init();
	}

	public init(): void {
		this.initUI();
	}

	public initUI(): void {
		this.checkJoin.textFlow = (new egret.HtmlTextParser).parser(`<a href="event:"><u>${this.checkJoin.text}</u></a>`);
		this.checkJoin.touchEnabled = true;
		this.list.itemRenderer = GuildMemberItem1Render;
		this.eff = new MovieClip();
		this.eff.x = this.checkJoin.x + 40;
		this.eff.y = this.checkJoin.y + 10;
		this.isInit = true;
	}

	public open(...param: any[]): void {
		if (!this.isInit) this.initUI();
		this.addTouchEvent(this.checkJoin, this.onLinkApply);
		this.addTouchEvent(this.cityBtn, this.onTap);
		this.addTouchEvent(this.conBtn, this.onTap);
		this.addTouchEvent(this.rename, this.onTap);

		this.observe(Guild.ins().postGuildInfo, this.updateGuild);
		this.observe(Guild.ins().postMyGuildInfo, this.updateMyInfo);
		this.observe(Guild.ins().postChangeNotice, this.updateGuild);
		this.observe(Guild.ins().postGuildMoney, this.updateGuild);
		this.observe(Guild.ins().postApplyInfos, this.updateApplys);
		this.observe(Guild.ins().postJoinGuild, this.updateApplys);
		this.observe(Guild.ins().postGuildMembers, this.updateMember);

		this.updateApplys();
		this.updateMyInfo();
		this.updateGuild();
		this.updateMember();
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.conBtn:
				ViewManager.ins().open(GuildConWin);
				break;
			case this.cityBtn:
				ViewManager.ins().open(GuildNoticeWin);
				break;
			case this.rename:
				ViewManager.ins().open(GuildChangeNameView);
				break;
		}
	}

	private updateMyInfo(): void {
		this.myCon.text = this.userGuild.myCon + "";
		this.checkJoin.visible = this.userGuild.myOffice >= GuildOffice.GUILD_FUBANGZHU;
		this.cityBtn.visible = this.userGuild.myOffice >= GuildOffice.GUILD_FUBANGZHU;
	}

	private updateGuild(): void {
		this.guildName.text = this.userGuild.guildName;
		this.guildLevel.text = this.userGuild.guildLv.toString();
		this.guildMoney.text = this.userGuild.money.toString();
		this.notice.text = this.userGuild.notice;
		//改名
		this.rename.visible = Guild.ins().changeNameNum && this.userGuild.myOffice >= GuildOffice.GUILD_BANGZHU;
	}

	private updateMember(): void {
		let gc: GuildConfig = GlobalConfig.GuildConfig;
		this.guildMember.text = this.userGuild.getMemberNum() + "/" + gc.maxMember[Guild.ins().guildLv - 1];
		this.list.dataProvider = new eui.ArrayCollection(this.userGuild.getGuildMembers(1));
	}

	private onLinkApply(): void {
		ViewManager.ins().open(GuildApplyListWin);
	}

	private updateApplys(): void {
		if (this.userGuild.hasApplys()) {
			this.checkJoin.parent.addChildAt(this.eff, this.getChildIndex(this.checkJoin));
			this.eff.playFile(RES_DIR_EFF + "chargeff1", -1);
			this.eff.scaleX = 0.7;
			this.eff.scaleY = 0.7;
		} else
			DisplayUtils.removeFromParent(this.eff);
	}

}