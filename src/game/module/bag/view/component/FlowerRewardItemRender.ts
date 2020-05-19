/**
 * 送鲜花记录子项
 * @author wanghengshuai
 * 
 */
class FlowerRewardItemRender extends BaseItemRender{
	
	public playerName:eui.Label;
	public flowerCount:eui.Label;

	public constructor() {
		super();
		this.skinName = "flowerRewardItem";
	}

	public dataChanged():void
	{
		this.playerName.text = this.data.roleName;
		let itemData = GlobalConfig.ItemConfig[this.data.id];
		let text = `被你的魅力折服，送上了|C:${0x00FF00}&T:${this.data.count}|束` + itemData.name;
		this.flowerCount.textFlow = TextFlowMaker.generateTextFlow(text);
	}
}