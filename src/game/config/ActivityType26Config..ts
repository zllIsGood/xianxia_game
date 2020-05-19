/**
 * Created by Administrator on 2016/7/22.
 */

class ActivityType26Config {
    public limitTime:Array<Number>; //限制购买时间
    
	public Id: number;   //活动序号
    public index: number;   //奖励序号
    public items:RewardData[];   //奖励
    public rechargeId:number
    public limit:number;
    public platform: number;
    public prices:number;
    public worth:number;
}
