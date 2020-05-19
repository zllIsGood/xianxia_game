/**
 * 全民boss配置
 */
class PublicBossConfig {
	/** 限制等级 */
	public level: number;
	/** 限制转生等级 */
	public zsLevel: number;
	/** 刷新时间 */
	public refreshTime: number;
	/** boss怪物id */
	public bossId: number;
	/** 掉落物 */
	public desc: number[];
	/** 副本id */
	public fbId: number;
	/** 奖励描述 */
	public rewardsDesc: string = "";
}