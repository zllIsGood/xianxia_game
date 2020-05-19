/**
 * 称号信息
 */
class TitleInfo {

	/** 到期时间（小于0表示未拥有） */
	public endTime: number;

	/** 配置 */
	public config: TitleConf;

	/** 是否已展开 */
	// public expand:Boolean;

	/**
	 * 状态：
	 * 0 = 未穿戴
	 * 1 = 当前角色已穿戴
	 * 2 = 其他角色已穿戴
	 */
	// public state:number;

	/** 战斗力 */
	public power: number;

	/** 属性文字 */
	private _attrsText: eui.ArrayCollection;

	/** 已获得的总属性 */
	public attrsTotal: eui.ArrayCollection;

	public constructor(config: TitleConf) {
		this.config = config;
	}

	/**
	 * 获取属性文本
	 */
	public get attrsText(): eui.ArrayCollection {
		if (!this._attrsText) {
			//第一个是稀有度
			let attrs: any[] = [];
			//属性文字
			let n: number = this.config.attrs.length;
			while (n--) {
				attrs[n] = TitleInfo.formatAttr(this.config.attrs[n].type, this.config.attrs[n].value);
			}
			this._attrsText = new eui.ArrayCollection(attrs);
			//战斗力
			this.power = UserBag.getAttrPower(this.config.attrs);
		}
		return this._attrsText;
	}

	/**
	 * 格式属性
	 */
	public static formatAttr(type: number, value: number): any {
		//皮肤里的富文本读取格式
		// let e = new egret.EventDispatcher();
		// e['h'] = AttributeData.getAttrStrByType(type) + '：';
		// e['t'] = String(value);
		// e['textColor'] = 0x35e62d;
		// return e;
		return {
			h: AttributeData.getAttrStrByType(type) + '：',
			t: String(value),
			textColor: 0x35e62d
		}
	}
}
