class GuildListItemRender extends BaseItemRender {

	private nameLab: eui.Label;
	private president: eui.Label;
	private member: eui.Label;
	private applyBtn: eui.Button;
	private numLab: eui.Label;
	public attrLabel: eui.Label;

	public constructor() {
		super();
		this.skinName = "ApplyItemSkin";
	}

	public onTap(): void {
		//仙盟战期间  不允许申请加入仙盟
		if( GuildWar.ins().getModel().isWatStart ){
			WarnWin.show("仙盟战期间,不允许申请加入仙盟", () => {
			}, this);
			return;
		}
		let info: GuildListInfo = this.data;
		if (Guild.ins().applyGuilds.indexOf(info.guildID) == -1) {
			if (this.data.attr > Actor.power) {
				UserTips.ins().showTips("|C:0xf3311e&T:战斗力过低|");
				return;
			}
			this.applyBtn.enabled = false;
			this.applyBtn.label = "已申请";
			Guild.ins().applyGuilds.push(info.guildID);
			Guild.ins().sendJoinGuild(info.guildID);
		}
	}

	protected dataChanged(): void {
		if (this.data instanceof GuildListInfo) {
			let info: GuildListInfo = this.data;
			let gc: GuildConfig = GlobalConfig.GuildConfig;

			if (info && gc) {
				this.numLab.text = info.guildRank + "";
				this.nameLab.textFlow = (new egret.HtmlTextParser()).parser(info.guildName + `<font color='#0FEE27'>(Lv.${info.guildLevel})</font>`);
				this.president.text = info.guildPresident;
				this.member.textColor = info.guildMember < gc.maxMember[info.guildLevel - 1] ? 0x4FBFE2 : 0xf3311e;
				this.member.text = info.guildMember + "/" + gc.maxMember[info.guildLevel - 1];
				let powers:number = CommonUtils.overLength(info.attr);
				this.attrLabel.visible = powers?true:false;
				if( powers )
					this.attrLabel.text = "战力要求：" + powers;
				if (Guild.ins().applyGuilds.indexOf(info.guildID) > -1) {
					this.applyBtn.enabled = false;
					this.applyBtn.label = "已申请";
				}
				else {
					this.applyBtn.enabled = true;
					this.applyBtn.label = "申请";
				}
			}
		}
	}

	public destruct(): void {
	}
}