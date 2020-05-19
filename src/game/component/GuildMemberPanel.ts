class GuildMemberPanel extends BaseComponent {

	private office: eui.Label;
	private totalCon: eui.Label;
	public quitBtn: eui.Button;
	private list: eui.List;
	private dataArr: eui.ArrayCollection;
	public constructor() {
		super();
	}

	public childrenCreated(): void {
		this.init();
	}

	protected init(): void {
		this.list.itemRenderer = GuildMemberItem2Render;
		this.dataArr = new eui.ArrayCollection;
		this.list.dataProvider = this.dataArr;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.quitBtn, this.onTap);
		this.addTouchEvent(this.list, this.onListTouch);
		this.observe(Guild.ins().postMyGuildInfo, this.updateMyInfo);
		this.observe(Guild.ins().postGuildMembers, this.updateMember);
		this.updateMyInfo();
		this.updateMember();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.quitBtn, this.onTap);
		this.removeTouchEvent(this.list, this.onListTouch);

		this.removeObserve();
	}

	private onListTouch(e: egret.TouchEvent): void {
		if (e.target instanceof eui.Button) {
			let item: GuildMemberItem2Render = e.target.parent.parent as GuildMemberItem2Render;
			item.onTap(e.target);
		}
	}

	private updateMember(): void {
		let listData: GuildMemberInfo[] = Guild.ins().getGuildMembers(1);
		// this.list.dataProvider = new eui.ArrayCollection(listData);
		this.dataArr.replaceAll(listData);
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.quitBtn:
				//仙盟战期间  不允许退出仙盟
				if (GuildWar.ins().getModel().isWatStart) {
					WarnWin.show("仙盟战期间,不允许退出仙盟", () => {
					}, this);
					return;
				}
				if (Guild.ins().myOffice == GuildOffice.GUILD_BANGZHU) {
					if (Guild.ins().getMemberNum() > 1) {
						WarnWin.show("需要先进行禅让，才可退出仙盟", () => {
						}, this);
						return;
					}
				}
				WarnWin.show("是否确定退出仙盟，\n退出后贡献值清0。\n仙盟技能继续生效。", () => {
					Guild.ins().sendQuitGuild();
				}, this,null,null,"normal","center");
				break;
		}
	}

	private updateMyInfo(): void {
		this.office.text = GuildLanguage.guildOffice[Guild.ins().myOffice];
		this.totalCon.text = Guild.ins().myTotalCon + "";
	}
}