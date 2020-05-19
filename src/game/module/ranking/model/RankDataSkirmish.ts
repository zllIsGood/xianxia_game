/**
 * 遭遇排行榜数据类型
 */
class RankDataSkirmish extends RankDataBase{
	
	public money:number;

	public reward:number;

	public constructor() {
		super();
	}

	public parser(bytes: GameByteArray, items:string[]):void
	{
		super.parser(bytes, items);
		for(let i in GlobalConfig.SkirmishRankConfig)
		{
			let config:SkirmishRankConfig = GlobalConfig.SkirmishRankConfig[i];
			if(config.minRank <= this.pos && this.pos <= config.maxRank)
			{
				this.reward = config.rewards[0].count;
				this.money = config.rewards[1].count;
				return;
			}
		};
		this.money = this.reward = 0;
	}
}