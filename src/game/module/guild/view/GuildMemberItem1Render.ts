class GuildMemberItem1Render extends BaseItemRender {

	private nameLab: eui.Label;
	private office: eui.Label;
	private conLab: eui.Label;
	private labVip: eui.BitmapLabel;
	private monthcard: eui.BitmapLabel;
	private vipTitle: eui.BitmapLabel;
	public zuncard: eui.BitmapLabel;

	public constructor() {
		super();
		this.skinName = "MemberItemSkin";
	}
	public dataChanged(): void {
		if (this.data instanceof GuildMemberInfo) {
			let info: GuildMemberInfo = this.data;
			if (!info) return;
			this.nameLab.text = info.name;
			this.office.text = GuildLanguage.guildOffice[info.office];
			this.conLab.text = info.contribution + "";
			this.monthcard.visible = info.monthCard == 1;
			this.vipTitle.visible = info.vipLevel > 3;
			// this.labVip.text = info.vipLevel.toString();
			this.labVip.visible = false;
		}
	}
}