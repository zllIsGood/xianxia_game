/**
 * Created by MPeter on 2018/3/30.
 *
 */
class EmojiTestRender extends BaseItemRender {
	public textGroup: eui.Group;
	public showHead: eui.Label;
	public chatVip: eui.Image;
	public showText: eui.Label;

	private emojiTxt: EmojiText;

	public constructor() {
		super();
	}

	protected childrenCreated(): void {
		this.showText.visible = false;

		this.emojiTxt = new EmojiText(true);
		this.emojiTxt.textWidth = 438 - 152;
		this.emojiTxt.x = 152;
		this.addChild(this.emojiTxt);
	}

	public dataChanged(): void {
		this.emojiTxt.reset();
		this.emojiTxt.richText = this.data;
		this.height = this.emojiTxt.uHeight;
	}

}
