class HuanShouEquipAttrWin extends BaseEuiView {
	private attrName0: eui.Label;
	private attr0: eui.Label;

	public constructor() {
		super();
		this.skinName = `huanShouEquipAttrSkin`;
	}

	public open(...param: any[]): void {
		this.addTouchEndEvent(this, this.closeWin);
		this.updateAttrView();
	}

	public close(...param: any[]): void {

	}

	private updateAttrView(): void {
		let attrs: AttributeData[] = UserHuanShou.ins().equipAttrs;
		let percent_attrs: any = UserHuanShou.ins().equipPercent;

		let equipAttrs = GlobalConfig.HuanShouConf.equipAttrs;
		let equipAttrs2 = GlobalConfig.HuanShouConf.equipAttrs2;
		attrs = AttributeData.AttrChangeAddition(equipAttrs, attrs);//进行排序
		attrs = AttributeData.AttrChangeAddition(attrs, equipAttrs2);//进行排序
		let str: string = "";
		let strName: string = "";
		let len = attrs.length;
		let len2 = equipAttrs.length;
		for (let j = 0; j < len2; j++) {
			let attdata = equipAttrs[j];
			if (isNaN(percent_attrs[attdata.type])) {
				percent_attrs[attdata.type] = 0;
			}
		}
		let isLen: boolean = false;
		for (let i = 0; i < len; i++) {
			if (i == len2 && !isLen) {
				for (let key in percent_attrs) {
					if (percent_attrs.hasOwnProperty(key)) {
						let element = percent_attrs[key];
						str += (element / 100 ) + "%\n";
						strName += AttributeData.getCustomAttName(Number(key), `加成`, ":") + "\n";
					}
				}
				isLen = true;
			}
			str += AttributeData.getExAttrNameByAttrbute(attrs[i]) + "\n";
			strName += AttributeData.getAttrStrByType(attrs[i].type) + ":\n";
		}


		this.attrName0.text = strName;
		this.attr0.text = str;
	}

}

ViewManager.ins().reg(HuanShouEquipAttrWin, LayerManager.UI_Popup);