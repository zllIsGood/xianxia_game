/**帮派积分排行 */
class GuildInteRankInfo extends BaseView {

	public list: eui.List;
	public data: eui.ArrayCollection;
	public guildName: eui.Label;
	public infoDesc: eui.Label;
	public lastName: eui.Label;
	public lastNameJie: eui.Label;
	private model: GuildWarModel;

	constructor() {
		super();
		this.skinName = "GuildInteRankSkin";
		this.name = "仙盟排行";
		this.list.itemRenderer = GuildInteRankItemRenderer;
		this.data = new eui.ArrayCollection([]);
		this.model = GuildWar.ins().getModel();
		this.lastName.text = this.model.isWatStart ? '本届排行' : '上届排行';
		this.lastNameJie.text = this.model.isWatStart ? '本届攻城结果' : '上届攻城结果';
	}

	public open(...param: any[]): void {
		this.list.dataProvider = this.data;
		this.observe(GuildWar.ins().postRankInfo, this.refushList);
		GuildWar.ins().requestGuildRank();
	}

	public close(...param: any[]): void {
		this.removeObserve();
	}

	public refushList(): void {
		// this.guildName.text = this.model.guildRankList[0].guildName;
		this.data.replaceAll(this.model.guildRankList);
		if (this.model.guildRankList.length > 0) {
			this.guildName.text = this.model.guildRankList[0].guildName;
			// let str: string = "无";
			// switch (this.model.upReason) {
			// 	case 0:
			// 		str = "无";
			// 		break;
			// 	case 1:
			// 		str = "活动结束仙盟积分排名第一";
			// 		break;
			// 	case 2:
			// 		str = "活动期间成功采集天盟旗帜";
			// 		break;
			// }
			// this.infoDesc.text = str;
		} else {
			this.guildName.text = "虚位以待";
			// this.infoDesc.text = "无";
		}
	}


}