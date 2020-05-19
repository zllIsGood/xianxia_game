/**
 * 锻造格子转圈（强化）
 */
class CircleRunBoostView extends BaseView {

	/** 预览装备 */
	private equip: eui.Image;

	/** 装备名字 */
	private equipSource: string[] =
	[
		"xduanzao_20",
		"xduanzao_21",
		"xduanzao_22",
		"xduanzao_23",
		"xduanzao_24",
		"xduanzao_24",
		"xduanzao_25",
		"xduanzao_25"
	]

	/** 名字背景 */
	private nameBg: string[] =
	[
		"xduanzao_10_png",
		"xduanzao_11_png"
	]

	private itemList: ForgeItem[];
	public curRole: number;

	private _type: number;

	public constructor() {
		super();
		this.skinName = "CircleRunBoostSkin";
		this.itemList = [];
		let n: number = CircleRunView.EQUIP_COUNT;
		while (n--) {
			this.itemList[n] = this['item' + n];
		}

		this["item0"].itemName.source = "xduanzao_12_png";
		this["item1"].itemName.source = "xduanzao_13_png";
		this["item2"].itemName.source = "xduanzao_14_png";
		this["item3"].itemName.source = "xduanzao_15_png";
		this["item4"].itemName.source = "xduanzao_16_png";
		this["item5"].itemName.source = "xduanzao_16_png";
		this["item6"].itemName.source = "xduanzao_17_png";
		this["item7"].itemName.source = "xduanzao_17_png";
	}

	public get type(): number {
		return this._type;
	}

	//格子显示数字类型  0强化 1宝石 2注灵 3突破
	public set type(value: number) {
		this._type = value;
		for (let i: number = 0; i < this.itemList.length; i++) {
			this.itemList[i].setType(this._type);
		}
		this.setValue();
	}

	/**
	 * 格子显示数值
	 */
	public setValue(): void {
		let model: Role = SubRoles.ins().getSubRoleByIndex(this.curRole);
		let n: number = this.itemList.length;
		for (let i: number = 0; i < n; i++) {
			let num = 0;
			switch (this._type) {
				case 0:
					num = model.getEquipByIndex(i).strengthen;
					break;
			}
			this.itemList[i].setValue(num);
		}
	}

	public turnItem(pos: number): void {

		this.equip.source = this.equipSource[pos];
		this.setNameBg(pos);
	}

	//设置装备名字背景
	private setNameBg(pos: number): void {
		let len: number = this.itemList.length;
		for (let i: number = 0; i < len; i++) {
			if (i == pos)
				this.itemList[i].setSource(this.nameBg[1]);
			else
				this.itemList[i].setSource(this.nameBg[0]);
		}
	}
}
