/**
 * Created by MPeter on 2018/3/27.
 * 简易的图文混排文本组件,支持图片表情和动画表情
 * 原理：通过正则才分出所有的表情，再按位将填充同表情宽度差不多的空格符号，同时在指定位置
 *      添加对应的表情，组成图文混排效果
 * 优点：效率比较高
 * 缺点：在一些低端版本浏览器或者不常用的浏览器可能会出现错位问题，还未验证！
 */
class EmojiText extends egret.Sprite {
	/**消息文本*/
	protected msgTxt: egret.TextField;
	/**表情组*/
	protected emojiArr: any;
	/**当前添加表情的宽*/
	protected emojiW: number;
	/**当前添加表情的高*/
	protected emojiH: number;
	/**表情尺寸 默认1*/
	protected emojiSize: number = 1;
	/**当前高度*/
	protected curHight: number = 0;
	/**自动换行*/
	private _autoWrapLine: boolean = true;
	/**表情对齐方式*/
	private _emojiAlignment: EmojiAlign = EmojiAlign.CENTER;


	/**当前表情id最大值*/
	static EMOJI_MAX_ID: number = 36;
	/**id最大值 只处理100以内的*/
	static MAX_ID: number = 100;
	/**VIP图*/
	static VIP_IMG: string = "#80#";

	/**空格宽度洗漱*/
	private SPACEING_E: number = 0.275;
	/**表情间隔*/
	private EMOJI_INTERVAL: number = 3;
	/**表情所用替代空格符号*/
	private EMOJI_SPACEING: string = " ";
	/**表情的大小,主要记录不规则表情大小*/
	private EMOJI_DATA = {
		//普通表情图
		"0": [46, 46],//规则表情图宽高
		"26": [70, 32],//不规则表情图宽高
		//特殊表现图预留40位做特殊图索引
		"80": [30, 16, "pet_btn_skill_inside_png"],//vip图标
	}


	public constructor(eRemoveEvent?: boolean) {
		super();
		this.emojiArr = {};

		this.msgTxt = new egret.TextField();
		this.msgTxt.x = 0;
		this.msgTxt.y = 0;
		this.msgTxt.lineSpacing = 25;
		this.msgTxt.verticalAlign = `top`;
		this.msgTxt.size = 16;
		this.addChild(this.msgTxt);

		//是否启动移除舞台事件
		if (eRemoveEvent)
			this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
	}

	private onAddToStage(e: egret.Event): void {
		this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
		this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemoveFromStage, this);

	}

	private onRemoveFromStage(): void {
		this.removeEventListener(egret.Event.REMOVED_FROM_STAGE, this.onAddToStage, this);
		this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
		this.reset();
	}

	public set richText(value: string) {
		this.reset();
		if (!value) return;

		let msgDt = this.splitFace(value);
		//没有表情则直接赋值
		if (!msgDt.emojis) {
			this.msgTxt.lineSpacing = 10;
			this.msgTxt.textFlow = TextFlowMaker.generateTextFlow1(msgDt.msgs[0]);
			return;
		}
		this.msgTxt.lineSpacing = 25;
		let len = msgDt.msgs.length;
		for (let i: number = 0; i < len; i++) {
			this.appendText(msgDt.msgs[i]);
			// let s = this.msgTxt.text;
			//清空前后空格
			// if (s.replace(/^\s*$/, "").length > 0)
			// 	this.msgTxt.textFlow = TextFlowMaker.generateTextFlow1(StringUtils.trimSpace(this.msgTxt.text));
			if (msgDt.emojis[i]) this.insertEmoji(msgDt.emojis[i]);
		}
	}

	/**插入表情
	 * @param emChar [string] 表情符号
	 * */
	private insertEmoji(emChar: string): void {
		let emojiId = emChar.replace(RegExpUtil.CHAT_EMOJI_ID, "");
		let emojiInfo = this.getEmojiInfo(+emojiId);
		//不符合解析条件的，自动排除
		// if (isNaN(+emojiId) || (+emojiId >= EmojiText.EMOJI_MAX_ID && !this.EMOJI_DATA[emojiId]) || +emojiId >= EmojiText.MAX_ID) {
		if (!emojiInfo) {
			this.appendText(emChar);
			return;
		}


		let emojiSoure = emojiInfo.soure ? emojiInfo.soure : `emoji_${emojiId}_png`;
		if (EmojiText.VIP_IMG == emChar) emojiInfo.width = 30;

		this.emojiW = emojiInfo.width * this.emojiSize;
		this.emojiH = emojiInfo.height * this.emojiSize;
		let emoji = this.addEmoji(emojiSoure);
		this.emojiArr[emoji.hashCode] = emoji;
	}

	/**添加表情
	 * @param resStr [string] 表情资源路径值
	 * */
	protected addEmoji(resStr: string): Emoji {
		let emoji = ObjectPool.pop("Emoji");
		emoji.setData(resStr);
		emoji.scaleX = emoji.scaleY = this.emojiSize;
		this.addChildAt(emoji, 0);

		//计算表情的坐标
		let line = this.msgTxt.numLines;
		let linesArr = this.msgTxt.$getLinesArr();
		let lineW = line > 0 ? linesArr[line - 1].width : 0;
		if (this._autoWrapLine) {
			//越宽，则换行
			if (lineW + this.emojiW > this.msgTxt.width) {
				this.appendText("\n");
				emoji.x = 0;
			}
			else {
				emoji.x = lineW + this.EMOJI_INTERVAL;
			}
			emoji.y = this.getEmojiY();
		}
		else {
			emoji.x = lineW + this.EMOJI_INTERVAL;
			emoji.y = this.getEmojiY();
		}


		//计算当前组件的高度
		this.curHight = this.curHight > emoji.y + this.emojiH ? this.curHight : emoji.y + this.emojiH;

		//插入表情替换符
		let emojiSpacing = "";
		let spaceN: number = 0;
		let size = this.SPACEING_E * this.msgTxt.size;
		while (this.emojiW > size * spaceN) {
			emojiSpacing += this.EMOJI_SPACEING;
			spaceN++;
		}
		//最加表情所用的替换空格替换符
		this.appendText(emojiSpacing);

		return emoji;
	}

	/**是否自动换行（表情）*/
	public set autoWrapLine(value: boolean) {
		this._autoWrapLine = value;
	}

	/**设置表情对齐方式*/
	public set emojiAlignment(value: EmojiAlign) {
		this._emojiAlignment = value;
	}

	/**设置文本颜色*/
	public set textColor(value: number) {
		this.msgTxt.textColor = value;
	}

	/**设置文本尺寸*/
	public set size(value) {
		this.msgTxt.size = value;
	}

	public set textWidth(value: number) {
		this.width = value;
		this.msgTxt.width = value;
	}

	public set textheight(value: number) {
		this.height = value;
		this.msgTxt.height = value;
	}

	/**设置文本间隔*/
	public set lineSpacing(value) {
		this.msgTxt.lineSpacing = value;
	}

	/**获取当前组件的高度，包含表情在内的高度*/
	public get uHeight(): number {
		return this.curHight > this.msgTxt.textHeight ? this.curHight : this.msgTxt.textHeight;
	}

	/**设置表情尺寸（缩放大小）
	 * @param value[number] 值
	 * */
	public setEmojiSize(value: number): void {
		this.emojiSize = value;
	}

	/**重置*/
	public reset(): void {
		this.curHight = 20;
		this.msgTxt.text = "";
		this.removeAllEmoji();
	}

	/**移除所有表情*/
	public removeAllEmoji(): void {
		for (let key in this.emojiArr) {
			let emoji = this.emojiArr[key];
			DisplayUtils.removeFromParent(emoji);
			ObjectPool.push(emoji);
		}
		this.emojiArr = {};
	}

	/**获取表情图的固定属性 */
	protected getEmojiInfo(id): ChatEmojiConfig {
		if (GlobalConfig.ChatEmojiConfig[id]) {
			return GlobalConfig.ChatEmojiConfig[id];
		}
		return null;
	}

	/**信息文本组件追加文本*/
	protected appendText(value: string): void {
		this.msgTxt.textFlow = this.msgTxt.textFlow.concat(TextFlowMaker.generateTextFlow1(value));
	}

	/**获取当前表情的y坐标*/
	protected getEmojiY(): number {
		let emY: number = 0;
		let linesArr = this.msgTxt.$getLinesArr();
		for (let i: number = 0; i < this.msgTxt.numLines; i++) {
			if (i > 0) emY += linesArr[i].height + this.msgTxt.lineSpacing;
		}

		switch (this._emojiAlignment) {
			case EmojiAlign.UP:
				return emY;
				break;
			case EmojiAlign.CENTER:
				return emY - (this.emojiH - this.msgTxt.size >> 1) * this.emojiSize;
				break;
			case EmojiAlign.DOWN:
				return emY - (this.emojiH - this.msgTxt.size) * this.emojiSize;
				break;
			default:
				return emY - (this.emojiH - this.msgTxt.size >> 1) * this.emojiSize;
		}

	}

	/**解析字符串，拆分表情*/
	private splitFace(msg: string): { emojis: string[], msgs: string[] } {
		return {emojis: msg.match(RegExpUtil.CHAT_EMOJI), msgs: msg.split(RegExpUtil.CHAT_EMOJI)};
	}
}

/**表情类*/
class Emoji extends BaseView {
	/**表情动画对象*/
	private emojiMc: MovieClip
	/**表情图片对象*/
	private emojiImg: eui.Image;

	public constructor() {
		super();
	}

	/** 赋值数据 （支持两种模式）
	 * @param source [string] 资源
	 * @param isMc [boolean] 是否为动画
	 * */
	public setData(source: string, isMc: boolean = false): void {
		if (!isMc) {
			if (!this.emojiImg) {
				this.emojiImg = new eui.Image();
				this.addChild(this.emojiImg);
			}
			this.emojiImg.source = source;
		}
		else {
			if (!this.emojiMc) this.emojiMc = new MovieClip;
			this.emojiMc.playFile(RES_DIR_EFF + source, -1);
			this.addChild(this.emojiMc);
		}
	}

	/**重置*/
	public reset(): void {
		if (this.emojiImg) this.emojiImg.source = "";
		else if (this.emojiMc) {
			this.emojiMc.stop();
		}
	}

	/**销毁*/
	public dispose(): void {
		this.reset();
		if (this.emojiMc) {
			DisplayUtils.removeFromParent(this.emojiMc);
		}
	}
}

/**表情对其方式*/
enum EmojiAlign {
	/**向上对齐*/
	UP = 1,
	/**居中对齐*/
	CENTER = 2,
	/**向下对齐*/
	DOWN = 3,
}
