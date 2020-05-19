class GuildListItem2Render extends BaseItemRender {

	private nameLab: eui.Label;
	private president: eui.Label;
	private member: eui.Label;
	private numLab: eui.Label;
	public numImg: eui.Image;
	public member0: eui.Label;
	public attrLab:eui.Label;
	public constructor() {
		super();
		this.skinName = "GuildListItemSkin";
	}
	protected dataChanged(): void {
		if (this.data instanceof GuildListInfo) {
			let info: GuildListInfo = this.data;
			let gc: GuildConfig = GlobalConfig.GuildConfig;
			if (info && gc) {
				if (info.guildRank < 4)
				{
					this.numImg.source = "guildshop_json.guildpaihang" + info.guildRank;
					this.numLab.visible = false;
					this.numImg.visible = true;
				}
				else
				{
					this.numLab.text = info.guildRank + "";
					this.numLab.visible = true;
					this.numImg.visible = false;
				}
				this.nameLab.textFlow = (new egret.HtmlTextParser()).parser(info.guildName);
				this.member0.text = "" + info.guildLevel;
				this.president.text = info.guildPresident;
				// this.member.textColor = info.guildMember < gc.maxMember[info.guildLevel - 1] ? 0x4FBFE2 : 0xf3311e;
				this.member.text = info.guildMember + "/" + gc.maxMember[info.guildLevel - 1];
				this.attrLab.text = ""+info.attr;
			}
		}
	}
}