class GuildBossInfoConfig {
	//关卡
	public id: number = 0;
	//副本ID
	public fbId: number = 0;
	//Boss配置
	public boss: Object;
	//通关奖励
	public passAwards: RewardData[];
	//排名奖励
	public rankAwards: RewardData[];
	//挑战奖励
	public enterAwards: number = 0;
	//击杀奖励
	public killerAwards: RewardData[];
	//资源
	public ShowImg:string;
}