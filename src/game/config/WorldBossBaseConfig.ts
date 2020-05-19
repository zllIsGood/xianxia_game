class WorldBossBaseConfig {
	/** 刷新时间 */
	refreshHour: number = 0;
	/** 刷新时间 */
	refreshMinute: number = 0;
	/** 刷新公告 */
	notice: string;
	/** 等级提升时间 */
	levelUpTime: number = 0;
	/** 挑战cd */
	challengeCd: number = 0;
	/** 伤害转金币比率 */
	convertRate: number = 0;
	/** 金币上限 */
	maxGold: number = 0;
	/** 清除cd价格 */
	clearCdCost: number[] = [];
	/**抽奖时间*/
	lotteryTime: number = 0;

	dayCount:number [] = [];

	buyCountPrice:number [] = [];

	rebornItem:number = 0;
	//神域boss开启--开服天数
	shenyuOpenDay:number;
	//合服

	//挑战需要道具
	challengeItem:number[];
	//挑战需要元宝
	challengeItemYb:number[];
}