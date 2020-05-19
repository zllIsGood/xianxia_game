/**
 * 章节奖励配置
 */
class ChaptersRewardConfig {
	public id: number;
	/** 要求关卡数 */
	public needLevel: number;
	/** 奖励 */
	public rewards: RewardData[];
	/** 章节名字 */
	public name:string;
	/** 金币效率 */
	public goldEff: number;
	/** 经验效率 */
	public expEff: number;
}