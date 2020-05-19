/**
 * 送鲜花好友信息子项
 * @author wanghengshuai
 * 
 */
class FlowerTargetItemrender extends BaseItemRender{
	public nameTxt:eui.Label;

	public constructor() {
		super();
		this.skinName = "flowerTargetItem";
		this.touchChildren = false;
		this.touchEnabled = true;
	}

	public dataChanged():void
	{
		////FriendData
		this.nameTxt.text = this.data.name;
	}
}