/**
 * 送鲜花鲜花信息子项
 * @author wanghengshuai
 * 
 */
class FlowerTargetItemrender1 extends BaseItemRender{
	public nameTxt:eui.Label;

	public constructor() {
		super();
		this.skinName = "flowerTargetType";
		this.touchChildren = false;
		this.touchEnabled = true;
	}

	public dataChanged():void
	{
		let itemData = GlobalConfig.ItemConfig[this.data];
		this.nameTxt.text = itemData.name;
	}
}