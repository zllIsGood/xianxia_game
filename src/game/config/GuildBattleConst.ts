class GuildBattleConst {
	/**
	 * 开启等级
	*/
	public openLevel: number;
	/**
	 * 天盟霸主 奖励
	 */
	public occupationAwardShow: RewardData[];
	/**
	 * 天盟霸主 帮主奖励
	 */
	public occupationAward: RewardData[];
	/**
	 * 采集倒计时
	 */
	public gatherTime: number;
	/**
	 * 活动开启时间
	 */
	public openServer: {day:number,hours:number,min:number};//活动开启时间（开服几天和时间）
	public continueTime:number;//活动持继时间(秒)
	public hefuOpen:{day:number,hours:number,min:number}[];//合服天盟争霸开启时间
	public hefuAward: { leader: { award: {id:number,type:number,count:number}[][], context: string, title: string}, normal: { award: {id:number,type:number,count:number}[][], context: string, title: string}};
}