/**
 * 任务--成就配置
 */
class AchievementTaskConfig {
	/** 索引 */
	public index: number;
	/** 成就id */
	public achievementId: number;
	/** 任务id */
	public taskId: number;
	/** 任务显示对象类型 */
	public showType: number;
	/** 成就目标 */
	public target: number;
	/** 成就名字 */
	public name: string;
	/** 成就描述 */
	public desc: string;
	/** 职业奖励 */
	public jobawardList: RewardData[][];
	/** 成就奖励 */
	public awardList: RewardData[];
	/** 操作类型 */
	public control: GuideType;
	/** 操作对象 */
	public controlTarget: any[];
	/** 成就类型 */
	public achievementType: number;
	/** 成就积分 */
	public score: number;
	/** 任务类型 */
	public type: number;
	/** 成就长描述 */
	public longdesc: string = "";
	/** 成就未完成提醒 **/
	public startwarning:string;
	/** 成就完成提醒 **/
	public finishwarning:string;

}