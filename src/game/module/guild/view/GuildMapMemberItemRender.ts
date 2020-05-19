class GuildMapMemberItemRender extends BaseItemRender {
	private nameLab: eui.Label;
	private office: eui.Label;
	private conLab: eui.Label;

	public constructor() {
		super();
		this.skinName = "gongxianitemSkin";
	}
	protected dataChanged(): void {
		if (this.data instanceof GuildMemberInfo) {
			let info: GuildMemberInfo = this.data;
			if (info) {
				// this.conLab.textColor = this.office.textColor = this.nameLab.textColor =  0xffffff;
				this.nameLab.text = info.name;
				this.office.text = GuildLanguage.guildOffice[info.office];
				this.conLab.text = info.curContribution + "";
			}
		}
	}
}