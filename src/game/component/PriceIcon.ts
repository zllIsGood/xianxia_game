class PriceIcon extends BaseComponent {
	private priceLabel: eui.Label;
	private iconImg: eui.Image;
	private _labelColor: number;

	public constructor() {
		super();

		this.skinName = "PriceIconSkin";
	}

	public childrenCreated(): void {
		this.init();
	}

	public init() {
		this.priceLabel.textColor = 0xFFB92D;
	}

	private _price: number;
	private _type: MoneyConst;

	/**
	 * 价格
	 */
	public getPrice(): number {
		return this._price;
	}

	public setPrice(value: number, value2: number = -1): void {
		if (value == this._price && value2 == -1)
			return;
		this._price = value;
		if (value2 >= 0) {
			// let colorStr: string = "";
			// if (value2 >= value)
			// 	colorStr = "|C:0x35e62d&T:";
			// else
			// 	colorStr = "|C:0xf3311e&T:";
			// this.priceLabel.textFlow = TextFlowMaker.generateTextFlow(colorStr + value2 + "| / " + value);
			let colorStr: string = "";
			if (value2 >= value)
				colorStr = ColorUtil.GREEN_COLOR;
			else
				colorStr = ColorUtil.RED_COLOR;

			this.priceLabel.textFlow = TextFlowMaker.generateTextFlow(`<font color=${colorStr}>${value2}</font><font color=${ColorUtil.WHITE_COLOR}>/${value}</font> `);

		} else {
			this.priceLabel.text = "" + this._price;
		}
	}

	public setText(str: string) {
		this.priceLabel.textFlow = new egret.HtmlTextParser().parser(str);
	}

	public setData(data: Object): void {
		let str: string = "";
		if (data instanceof RewardData) {
			let awards: RewardData = data as RewardData;
			if (awards.type == 0) {
				switch (awards.id) {
					case MoneyConst.exp:
						str = "common1_icon_exp";
						break;
					case MoneyConst.gold:
						str = "com_currency01";
						break;
					case MoneyConst.yuanbao:
						str = "com_currency02";
						break;
					case MoneyConst.fame:
						str = "fame";
						break;
					case MoneyConst.soul:
						str = "soul";
						break
					case MoneyConst.wing:
						str = "wings_icon_material";
						break;
					case MoneyConst.piece:
						str = "500008_png";
						break;
				}
			} else if (awards.type == 1) {
				switch (awards.id) {
					case 200001:
						str = "wings_icon_material";
						break;
					case 200002:
						str = "forge";
						break;
					case 200003:
						str = "gem";
						break;
					case 200004:
						str = "spirit";
						break;
					case 200005:
						str = "vigor";
						break;
					case 200006:
						str = "shield";
						break;
				}
			}
			this._type = awards.id;
			this.setPrice(awards.count);
		} else if (data instanceof ItemData) {
			let itemData: ItemData = data as ItemData;
			switch (itemData.itemConfig.id) {
				case 200001:
					str = "wings_icon_material";
					break;
				case 200002:
					str = "com_currency02";
					break;
				case 200003:
					str = "com_currency02";
					break;
				case 200004:
					str = "com_currency02";
					break;
				case 200005:
					str = "com_currency02";
					break;
				case 200006:
					str = "com_currency02";
					break;
			}
			this._type = itemData.itemConfig.id;
			this.setPrice(itemData.count);
		}
		this.iconImg.source = str;
	}

	public getType(): MoneyConst {
		return this._type;
	}

	public setType(value: MoneyConst) {
		if (this._type == value)
			return;
		this._type = value;
		let str: string = "";
		switch (this._type) {
			case MoneyConst.exp:
				str = "exp";
				break;
			case MoneyConst.gold:
				str = "com_currency01";
				break;
			case MoneyConst.yuanbao:
				str = "com_currency02";
				break;
			case MoneyConst.fame:
				str = "fame";
				break;
			case MoneyConst.soul:
				str = "soul";
				break;
			case MoneyConst.wing:
				str = "wings_icon_material";
				break;
		}
		this.iconImg.source = str;
	}

	public get labelColor(): number {
		return this._labelColor;
	}

	public set labelColor(value: number) {
		if (this._labelColor != value) {
			this._labelColor = value;
			this.priceLabel.textColor = this._labelColor;
		}
	}
}


