class PersonRewardRenderer extends BaseItemRender {
	
	public desc:eui.Label;
	public itemList:eui.List;

	constructor() {
		super();
		this.skinName = "PersonRewardRendererSkin";
		this.itemList.itemRenderer = ItemBase;
	}

	 public dataChanged(): void {
         this.desc.text = + this.data.integral+"";
         this.itemList.dataProvider = new eui.ArrayCollection(this.data.award);
	 }
}