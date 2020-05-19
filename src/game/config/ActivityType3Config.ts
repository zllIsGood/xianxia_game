interface ActivityType3Config {
	Id: number;   //活动序号
	index: number;   //奖励序号
	type: number;   //活动小类
	day: number;   //天数
	val: number;//充值数量
	rewards: RewardData[];   //奖励
	showType:number;//面板类型
	expAttr:string[];//扩展配置资源
	activityID:number[];//嵌套类型
}