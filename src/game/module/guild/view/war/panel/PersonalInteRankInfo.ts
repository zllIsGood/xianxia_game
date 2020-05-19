/**个人积分排行 */
class PersonalInteRankInfo extends BaseView {

	public list: eui.List;
	public data: eui.ArrayCollection;

	constructor() {
		super();
		this.skinName = "PersonalInteRankSkin";
		this.name = "个人排行";
		this.list.itemRenderer = GuildInteRankItemRenderer;
		this.data = new eui.ArrayCollection([]);
	}

	public open(...param: any[]): void {
		this.list.dataProvider = this.data;
		this.observe(GuildWar.ins().postGuildPersonalRank, this.refushList);
		GuildWar.ins().requestOwnGuildRank();
	}

	public close(...param: any[]): void {
		this.removeObserve();
	}

	public refushList(list: RankGuildInfo[]): void {
		this.data.replaceAll(list);
	}
}