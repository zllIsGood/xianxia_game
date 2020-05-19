/**
 * Created by hrz on 2017/10/14.
 * 综合聊天
 */
class ChatListItemRenderer3 extends BaseItemRender {
   	public textGroup: eui.Group;
	public showHead: eui.Label;
	public chatVip: eui.Image;
	public showText: eui.Label;
	public showChannel: eui.Label;


	private emojiTxt: EmojiText;

	constructor() {
		super();

		// this.skinName = "ChatItemSkin2";
		this.emojiTxt = new EmojiText();
		this.emojiTxt.x = 0;
		this.emojiTxt.textColor = 0xD1C28F;
		this.addChild(this.emojiTxt);
	}


	public dataChanged(): void {

		this.showHead.visible = false;
		this.showText.visible = false;
		this.chatVip.visible = false;
		this.showChannel.visible = false;

		let _data: any = this.data;
		// let maxWidth = 0;
		// if (this.$parent) {
		// 	 maxWidth = this.$parent.$getExplicitWidth();
		// }

		let channel = "", msg = "", vip = "", playName = "";
		//公会
		if (_data instanceof GuildMessageInfo) {
			channel = "|C:0xD1C28F&T:[仙盟]|";
			msg = _data.content;
			vip = _data.vipLevel ? EmojiText.VIP_IMG : "";
		}
		//阵营
		else if (_data instanceof ChatCampData) {
			channel = "|C:0xD1C28F&T:[阵营]|";
			msg = _data.content;
		}
		else if (_data instanceof ChatSystemData) {
			channel = "|C:0xD1C28F&T:[系统]|";
			msg = _data.str;
		}
		else {
			let world: string = Chat.ins().getWorldStr();
			channel = `|C:0xD1C28F&T:[${world}]|`;
			msg = _data.str;
			vip = _data.vip ? EmojiText.VIP_IMG : "";
		}

		if (_data.name) {
			playName = "|C:0x16B2FF&T:[" + _data.name + "]|";
		}
		let strDesc = "|C:0xDFD1B5&T:" + msg + "|";


		this.emojiTxt.textWidth = this.textGroup.width;
		// this.emojiTxt.autoWrapLine = false;
		this.emojiTxt.richText = `${channel}${vip}${playName} ${strDesc}`;
		this.height = this.emojiTxt.uHeight + 14;
	}
}