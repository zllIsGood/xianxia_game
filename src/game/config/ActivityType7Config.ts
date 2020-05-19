/**
 * 合服击杀Boss活动配表
 */

class ActivityType7Config {
	public Id: number;   //活动序号
    public index: number;   //奖励序号
    public score: number;   //需要积分
    public rewards: RewardData[];   //奖励
    public count:number;//个人可兑换次数
    public scount:number;//全服可兑换次数
    public title:number;//标签分页
    public showType:number;//显示类型
    public itemId:number; //消耗材料
    public itemCount:number; // 消耗材料数量
    public dailyCount:number;//每天兑换次数
    public items:{id:number,count:number};//多个兑换物
}
