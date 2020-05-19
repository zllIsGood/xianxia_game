/**仙盟奖励 */
class GuildInteRewardInfo extends BaseView {

	public itemList:eui.List;
	public list1:eui.List;

	private dataArr:eui.ArrayCollection;
	private dataArr1:eui.ArrayCollection;

	constructor() {
        super();
        this.skinName = "GuildInteRewardSkin";
		this.name = "仙盟奖励";

		this.dataArr = new eui.ArrayCollection();
		this.dataArr1 = new eui.ArrayCollection();

		this.itemList.itemRenderer = ItemBase;
		this.list1.itemRenderer = GuildInteRewardItemRenderer;
	}

	public open(...param: any[]): void {
		var data:number[] = GuildWar.ins().getModel().creatGuildRewardList();
		this.dataArr1.source = data;
		this.list1.dataProvider = this.dataArr1;

		var data1:RewardData[] = GlobalConfig.GuildBattleConst.occupationAward;
		this.dataArr.source = data1;
		this.itemList.dataProvider = this.dataArr;
    }

    public close(...param: any[]): void {
		this.dataArr.source = null;
		this.dataArr1.source = null;
	}
}