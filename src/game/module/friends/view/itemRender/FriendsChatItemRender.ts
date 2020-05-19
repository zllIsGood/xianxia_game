class FriendsChatItemRender extends BaseItemRender {
	public label_msg: eui.Label;
	public group_bubble: eui.Group;
	public imgBg:eui.Image;
	public label_date:eui.Label;

	private emojiTxt: EmojiText;

	public constructor() {
		super();
	}

	public childrenCreated(): void {
		super.childrenCreated();
		this.init();

		if (this.label_msg) {
			this.label_msg.wordWrap = false;
		}
		this.label_msg.visible = false;

		this.emojiTxt = new EmojiText();
		this.emojiTxt.x = 17;
		this.emojiTxt.y = 2;
		this.group_bubble.addChild(this.emojiTxt);
	}


	public init() {
		if (this.label_msg) {
			this.label_msg.text = "";
			this.label_msg.wordWrap = false;
		}
	}

	protected dataChanged(): void {
		super.dataChanged();
		let data: ChatData = this.data;
		let nameColor;
		let textColor;
		if (data.fromActor.id == Actor.actorID) {
			data.fromActor.name = Actor.myName;
			nameColor = `0xE5B613`;
			textColor = `0xE5B613`;
		} else {
			nameColor = data.fromActor.sex ? `0xBC8787` : `0x318ECE`;
			textColor = `0xFFFFFF`;
		}
		this.label_date.text = data.dateStr;
		let str = `|C:${nameColor}&T:${data.fromActor.name}|:|C:${textColor}&T:${data.msg}|`;
		//this.label_msg.textFlow = TextFlowMaker.generateTextFlow1(str);

		// this.emojiTxt.textWidth = this.group_bubble.width;
		this.emojiTxt.textWidth = 400;
		this.emojiTxt.richText = str;
		this.emojiTxt.textColor = textColor;
		this.height = this.emojiTxt.uHeight + 14;
	}
}