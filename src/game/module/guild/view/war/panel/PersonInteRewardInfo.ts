/**个人奖励 */
class PersonInteRewardInfo extends BaseView {

	public list:eui.List;
	public list1:eui.List;

	public dataList:GuildBattlePersonalAward[];
	public dataArr:eui.ArrayCollection;

	public dataList1:GuildBattlePersonalRankAward[];
	public dataArr1:eui.ArrayCollection;

	constructor() {
        super();
        this.skinName = "PersonInteRewardSkin";
		this.name = "个人奖励";

		this.list.itemRenderer = PersonRewardRenderer;
		this.list1.itemRenderer = GuildInteRewardItemRenderer;

		this.dataArr = new eui.ArrayCollection();
		this.dataArr1 = new eui.ArrayCollection();
	}

	public open(...param: any[]): void {
		if(!this.dataList)
		{
			this.dataList = [];
			var data:any = GlobalConfig.GuildBattlePersonalAward;
			for(var str in data)
			{	
				this.dataList.push(data[str]);
			}
		}
		this.dataArr.source = this.dataList;
		this.list.dataProvider = this.dataArr;

		if(!this.dataList1)
		{
			this.dataList1 = [];
			var data:any = GlobalConfig.GuildBattlePersonalRankAward;
			for(var str in data)
			{	
				this.dataList1.push(data[str]);
			}
		}
		this.dataArr1.source = this.dataList1;
		this.list1.dataProvider = this.dataArr1;
    }

    public close(...param: any[]): void {
	}
}