class ChatGuildItemRender extends BaseItemRender {

	public textGroup: eui.Group;
	public showHead: eui.Label;
	public chatVip: eui.Image;
	public showText: eui.Label;

	private emojiTxt: EmojiText;

	public constructor() {
		super();
		this.emojiTxt = new EmojiText();
		this.emojiTxt.x = 0;
		this.emojiTxt.textColor = 0xD1C28F;
		this.addChild(this.emojiTxt);
	}

	public dataChanged(): void {

		this.showHead.visible = false;
		this.showText.visible = false;
		this.chatVip.visible = false;
		if (this.data instanceof GuildMessageInfo) {
			let _data = this.data as GuildMessageInfo;

			let info: GuildMessageInfo = this.data;
			let office = "", vip = "", playerName = "", msg = "";

			if (info.type == 1) {
				//会长
				if (info.office) {
					office = "|C:0x" + GuildLanguage.guildOfficeColor[info.office] + "&T:[" + GuildLanguage.guildOffice[info.office] + "]|";
				}

				//vip图片
				vip = info.vipLevel > 0 ? EmojiText.VIP_IMG : "";

				//名字
				if (info.name) {
					playerName = "|C:0x16B2FF&T:[" + info.name + "]|";
				}
				msg = "|C:0xDFD1B5&T:" + info.content + "|";
			} else {
				msg = "|C:0xDFD1B5&T:" + info.content + "|";
			}

			this.emojiTxt.textWidth = this.textGroup.width;
			// this.emojiTxt.autoWrapLine = false;
			this.emojiTxt.richText = `${office}${vip}${playerName} ${msg}`;
			this.height = this.emojiTxt.uHeight + 14;
		}
	}
}