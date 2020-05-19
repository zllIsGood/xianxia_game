/**
 * 锻造格子转圈（宝石）
 */
class CircleRunGemView extends BaseView {

	private itemList: ForgeItem[];
	public curRole: number;

	private _type: number;

	public constructor() {
		super();
		this.skinName = "CircleRunGemSkin";
		this.itemList = [];
		let n: number = CircleRunView.EQUIP_COUNT;
		while (n--) {
			this.itemList[n] = this['item' + n];
		}

		this["item0"].item.source = "forge_00_png";
		this["item1"].item.source = "forge_01_png";
		this["item2"].item.source = "forge_02_png";
		this["item3"].item.source = "forge_03_png";
		this["item4"].item.source = "forge_04_png";
		this["item5"].item.source = "forge_05_png";
		this["item6"].item.source = "forge_06_png";
		this["item7"].item.source = "forge_07_png";
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
				case 1:
					num = model.getEquipByIndex(i).gem;
					break;
			}
			this.itemList[i].setValue(num);
		}
	}

	public turnItem(pos: number): void {
		this.setItemSelect(pos);
	}
	//设置装备选中
	private setItemSelect(pos: number): void {
		let len: number = this.itemList.length;
		for (let i: number = 0; i < len; i++) {
			if (i == pos)
				this.itemList[i].isSelectEff(true);
			else
				this.itemList[i].isSelectEff(false);
		}
	}

}
