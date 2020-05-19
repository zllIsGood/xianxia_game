class ChatListItemRenderer extends BaseItemRender {
	
	public textGroup: eui.Group;
	public showHead: eui.Label;
	public chatVip: eui.Image;
	public showText: eui.Label;
	public static HEAD_BG: string[] = [`common1_Quality_000`, `common1_Quality_000`];

	private emojiTxt: EmojiText;

	constructor() {
		super();

		//this.skinName = "ChatItemSkin";
		this.emojiTxt = new EmojiText();
		this.emojiTxt.x = 0;
		this.emojiTxt.textColor = 0xD1C28F;
		this.addChild(this.emojiTxt);
	}

	public dataChanged(): void {

		this.showHead.visible = false;
		this.showText.visible = false;
		this.chatVip.visible = false;


		let _data: any = null;
		if (this.data.type == 7) {
			_data = this.data as ChatInfoData;
		} else if (this.data.type == 3) {
			_data = this.data as ChatSystemData;
		}
		else {
			_data = this.data as GuildMessageInfo;
		}

		let servStr: string = KFServerSys.ins().isKF ? `S${_data.servId}` : "";

		let desc = "";
		let vip = "";
		//公会(世界聊天不显示公会信息)
		let head: string;
		let strDesc: string;
		if (_data.type == 0 || _data.type == 1 || _data.type == 2) {
			// desc = _data.content;
			// vip  = _data.vipLevel;
			return;
			//世界
		} else if (_data.type == 3) {
			desc = _data.str;
			head = "|C:0xDD6717&T:[系统]|";
			strDesc = desc;
		}
		else {
			desc = _data.str;
			vip = _data.vip ? EmojiText.VIP_IMG : "";
			head = `|C:0x16B2FF&T:[${_data.name}${servStr}]|`;
			strDesc = "|C:0xDFD1B5&T:" + desc + "|";
		}

		this.emojiTxt.textWidth = this.textGroup.width;
		// this.emojiTxt.autoWrapLine = false;
		this.emojiTxt.richText = `${vip}${head} ${strDesc}`;
		this.height = this.emojiTxt.uHeight + 14;

	}

}