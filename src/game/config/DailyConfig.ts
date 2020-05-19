/**
 * 每日任务配置
 */
class DailyConfig {
	/** 索引 */
	public id:number;
	/** 任务名字 */
	public name:string;
	/** 任务描述 */
	public desc:string;
	/** 任务目标 */
	public target:number;
	/** 活跃度奖励 */
	public activeValue:number;
	/** 历练值奖励 */
	public trainExp: number;
	/** 奖励列表 */
	public awardList:RewardData[];
	/** 操作类型 */
	public control: number;
	/** 操作对象 */
	public controlTarget: number[];
	
	
	
}