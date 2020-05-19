/**
 * 天阶配置
 */
class KnighthoodConfig {
	public level: number;				//等级
	public achievementIds: TaskIdConfig[]; //任务id集合
	public attrs: AttributeData[];	//属性集
	public exattrs: AttributeData[];	//额外属性
	public desc: string;				//名字
	public type: string;		//类型
	public effid: number = 0;
}

class TaskIdConfig {
	public achieveId: number = 0;
	public taskId: number = 0;
}

