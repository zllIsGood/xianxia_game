class GuildInteRewardItemRenderer extends BaseItemRender{

	public list:eui.List;
	public rankLabel:eui.Label;
    public numImg:eui.Image;

	constructor() {
        super();
        this.skinName = "GuildInteRewardItemSkin";
		this.list.itemRenderer = ItemBase;
    }

	public dataChanged():void
    {   
        if(this.itemIndex < 3)
        {
            this.numImg.visible = true;
            this.rankLabel.visible = false;
            this.numImg.source = "kaifu_icon_rank"+(this.itemIndex+1);
        }else
        {
            this.numImg.visible = false;
            this.rankLabel.visible = true;
            this.rankLabel.text = `第${(this.itemIndex+1)}名`;
        }
        if(this.data.rank){
            this.list.dataProvider = new eui.ArrayCollection(this.data.award);
        }else{
            this.list.dataProvider = new eui.ArrayCollection(GuildWar.ins().getModel().creatGuildRankReward(this.data));
        }
    }
}