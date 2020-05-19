class AttrUpgrade extends eui.Component {
	public attr: eui.Label;
	public arrow: eui.Image;
	public addAttr: eui.Label;

	public constructor() {
		super();
		this.skinName = `AttrUpgradeSkin`;
	}

	public update(attr: AttributeData, newAttr: AttributeData): void {
		this.attr.text = attr ? AttributeData.getAttStr(attr) : ``;
		this.arrow.visible = this.addAttr.visible = newAttr != undefined;
		if (newAttr != undefined)
			this.addAttr.text = `${newAttr.value}`;
	}
}