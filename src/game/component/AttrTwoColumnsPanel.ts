class AttrTwoColumnsPanel extends eui.Component {
	public attrLabel_0: eui.Label;
	public attrLabel_1: eui.Label;

	public constructor() {
		super();
		this.skinName = `AttrTwoColumnsPanelSkin`;
	}

	public showAttr(attrData: AttributeData[], showAttrName: boolean = true): void {
		this.attrLabel_0.text = ``;
		this.attrLabel_1.text = ``;

		if (attrData == undefined) {
			return;
		}

		let len: number = attrData.length;
		if (len > 0) {
			let column: number = 2;
			let att: AttributeData;
			let attr_0: AttributeData[] = [];
			let attr_1: AttributeData[] = [];

			//计算列
			for (let i: number = 0; i < len; i++) {
				att = attrData[i];
				i % column ? attr_0.push(att) : attr_1.push(att);
			}
			//显示属性
			let attrStr: string = ``;
			if (attr_0.length > 0) {
				attrStr = AttributeData.getAttStr(attr_0);
				this.attrLabel_0.textFlow = new egret.HtmlTextParser().parser(attrStr);
			}
			if (attr_1.length > 0) {
				attrStr = AttributeData.getAttStr(attr_1);
				this.attrLabel_1.textFlow = new egret.HtmlTextParser().parser(attrStr);
			}
		}
	}
}