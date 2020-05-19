/**
 * 世界表
 */
interface WorldRewardConfig {
	id: number;
	/** 要求关卡数 */
	needLevel: number;
	/** 奖励 */
	rewards: RewardData[];
	/** 大地图章节组id */
	groupId: number
}