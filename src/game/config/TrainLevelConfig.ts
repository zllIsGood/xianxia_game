/**
 * 历练等级配置
 */
class TrainLevelConfig {
	/** 等级 */
	public level: number;
	/** 升级所需经验 */
	public exp: number;
	/** 奖励列表 */
	public itemAward: RewardData[];
	/** 奖励属性list */
	public attrAward: AttributeData[];
	public power: number;
	public trainlevel: number;
	public type: number;
	public trainName: string = "";
}
