/**
 * 击杀Boss活动配表
 */

class ActivityType6Config {
	public Id: number;   //活动序号
    public index: number;   //奖励序号
    public bossID: number[][];   //bossId
    public rewards: RewardData[];   //奖励
    public groupName:string;//组名
    public sort:number;//排序id
    public giftName:string;//奖励组名
    public jump:GainWay[];
}
