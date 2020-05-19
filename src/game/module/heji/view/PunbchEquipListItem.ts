class PunchEquipListItem extends eui.ItemRenderer {
	public nameTxt: eui.Label;
	public attr1: eui.Label;
	public attr2: eui.Label;
	public changeBtn: eui.Button;
	public now: eui.Group;
	public constructor() {
		super();
		this.skinName = 'PunchEquipChangeSkinItem';
	}

	protected dataChanged(): void {
		if (!this.data || !this.data.itemConfig)
			return;
		let itemdata: ItemData = this.data as ItemData;
		let att: AttributeData[] = itemdata.att;
		let equipConfig = GlobalConfig.EquipConfig[itemdata.configID];

		let str1: string = "";
		let str2: string = "";
		this.now.visible = false;
		let i: number = 0;
		for (let k in AttributeData.translate) {
			if (!equipConfig[k] || equipConfig[k] <= 0) continue;
			let tempAtt: AttributeData = new AttributeData(AttributeData.translate[k], equipConfig[k])
			let attrStr = "";
			attrStr = AttributeData.getAttStrByType(tempAtt, 0, "  ");
			if (i % 2 == 0) {
				str1 += StringUtils.complementByChar(attrStr, 32);
			} else {
				str1 += attrStr + "\n";
			}
			i++;
		}

		this.attr1.textFlow = new egret.HtmlTextParser().parser(str1);
		if (equipConfig.baseAttr) {
			str2 = AttributeData.getAttStrByType(equipConfig.baseAttr, 1, "");
		} else {
			str2 = AttributeData.getExtAttStrByType(equipConfig.exAttr1, 1, "");
		}
		this.attr2.text = str2;
		this.changeBtn.visible = true;
		this.nameTxt.text = itemdata.itemConfig.name;
	}

	public setBtnStatu(): void {
		this.changeBtn.visible = false;
		this.now.visible = true;
	}
}

