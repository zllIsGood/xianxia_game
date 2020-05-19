class ActivityType4ItemRenderer extends BaseItemRender {

	public list:eui.List;
	public rankImg:eui.Image;
	public rankName:eui.Label;
	public value:eui.Label;

	constructor() {
		super();
		this.skinName = "ActraceSkinson";

		this.list.itemRenderer = ItemBase;
	}

	public dataChanged(): void {
		let config: ActivityType4Config = this.data;
		if(this.data.ranking>0)
		{
			this.rankImg.source = "rankDabiao_" + this.data.ranking;
		}else{
			this.rankImg.source = "rankDabiao_" + this.data.rankType + "_" + this.data.ranking;
		}

		this.list.dataProvider = new eui.ArrayCollection(config.rewards);

		let rankData:DabiaoData = Activity.ins().getrankInfoListByIndex(this.itemIndex);
		if(rankData)
		{
			this.y = 21;
			this.rankName.text = rankData.name;
			this.value.visible = true;
			let str:string;
			switch(this.data.rankType)
			{
				case RankDataType.TYPE_LEVEL://等级
					if(rankData.zsLevel>0)
					{
						str = rankData.zsLevel +"转"+rankData.level+"级";
					}else{
						str = rankData.level+"级";
					}
				break;
				case RankDataType.TYPE_POWER://战力
				case RankDataType.TYPE_WING://翅膀
				case RankDataType.TYPE_HEART_POWER://心法
				case RankDataType.TYPE_JOB_ZS://战士
				case RankDataType.TYPE_JOB_FS://法师
				case RankDataType.TYPE_JOB_DS://术士
				case RankDataType.TYPE_EXRING_POWER://灵戒
				case RankDataType.TYPE_HUANSHOU_POWER://宠物
				case RankDataType.TYPE_MEIREN://美人
				case RankDataType.TYPE_FLYSWORD_POWER://飞剑
					str = CommonUtils.overLength(rankData.numType);
				break;
				case RankDataType.TYPE_BAOSHI://宝石
					str = rankData.numType+"级";
				case RankDataType.TYPE_ZS://转生
					str = rankData.zsLevel +"转";
				break;
			}
			this.value.text = str;
		}else{
			this.y = 33;
			this.rankName.text = "暂无";
			this.value.visible = false;
		}
	}
}