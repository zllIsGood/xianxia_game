/**
 * 培养祝福值等级
 */
interface ICultivateBlessLevelConfig extends ICultivateBaseLevelConfig {
	/** 起效祝福值 */
	validBlessingValue: number;
	/** 最高祝福值 */
	maxBlessingValue: number;
	/** 成功概率 */
	possible: number;
	/** 是否清空 */
	isClear: boolean;
	/** 清空时间 */
	clearTime: number;
	/** 升阶奖励 */
	awardItems: RewardData[];
	/** 失败奖励 */
	failRewards: RewardData[];
}