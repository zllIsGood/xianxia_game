class GuildBattleDistributionAward {
	/**
	 * 排名
	*/
	public rank:number;
	/**
	 * id
	*/
	public id:number;
	/**
	 * 奖励
	*/
	public award:RewardData[];
	/**
	 * 份数
	*/
	public count:number;
	/**
	 * 份数
	*/
	public awardShow:RewardData[];
	/**
	 * 是否活动奖励标识0:日常 1:合服 2:开服
	 */
	public rewardFlag:number;
}