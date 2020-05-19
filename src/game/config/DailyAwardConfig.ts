
/**
 * 每日活跃度奖励配置
 */
class DailyAwardConfig {
	/** 索引 */
	public id:number;
	/** 要求活跃度 */
	public valueLimit :number;
	/** 奖励列表 */
	public awardList:RewardData[];
}