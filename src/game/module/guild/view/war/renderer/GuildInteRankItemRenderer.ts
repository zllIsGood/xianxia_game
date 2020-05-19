class GuildInteRankItemRenderer extends BaseItemRender{

    public rank:eui.Label;
    public guildName:eui.Label;
    public guildOwn:eui.Label;
    public point:eui.Label;

	constructor() {
        super();

        this.skinName = "GuildInteRankItemSkin";
    }

    public dataChanged():void
    {
        this.rank.text = (this.itemIndex+1)+"";
        this.guildName.text = this.data.guildName;
        this.guildOwn.text = this.data.ownName;
        this.point.text = this.data.guildPoint;
    }
}