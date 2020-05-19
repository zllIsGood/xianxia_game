/**
 * 称号属性列表项
 */
class TitleAttrItem extends BaseItemRender{
	public attrName:eui.Label;
	public attrNum:eui.Label;

	public constructor() {
		super();
	}

	public dataChanged():void
	{
		this.attrName.text = this.data.h
		this.attrNum.text = this.data.t
		this.attrNum.textColor = this.data.textColor
	}
}