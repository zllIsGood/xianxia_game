/**
 * Created by MPeter on 2018/3/29.
 *
 */
class ChatEmojiWin extends BaseEuiView {
	public emoji: eui.Group;
	public closeBg: eui.Rect;

	private chatInput: eui.EditableText;

	public constructor() {
		super();
		this.skinName = "EmojiPanelSkin"
	}


	public open(...param): void {
		this.addTouchEvent(this.emoji, this.onChooseEmoji);
		this.addTouchEvent(this.closeBg, this.onTouch);

		this.chatInput = param[0];
	}

	public close(): void {
		this.chatInput = null;
	}


	private onChooseEmoji(e: egret.TouchEvent): void {
		if (e.target instanceof eui.Image) {
			if (!this.chatInput) {
				ViewManager.ins().close(this);
				return;
			}

			let name = (<eui.Image>e.target).name;
			let id = name.replace(/emoji_/g, "");
			if (this.chatInput.text == "点击输入聊天内容") {
				this.chatInput.text = `#${id}#`;
			}
			else {
				this.chatInput.text = this.chatInput.text.concat(`#${id}#`);
			}


			ViewManager.ins().close(this);
		}
	}

	private onTouch(e: egret.TouchEvent): void {
		ViewManager.ins().close(this);
	}
}
ViewManager.ins().reg(ChatEmojiWin, LayerManager.UI_Popup);
