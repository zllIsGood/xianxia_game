/**
 * DailyFubenConfig
 */
class DailyFubenConfig {
	/** 副本id */
	public id: number;
	/** 每日免费次数 */
	public freeCount: number;
	/** 每日可购买次数 */
	public buyCount: number;
	/** 每日vip额外可购买次数 */
	public vipBuyCount: any;
	/** 购买次数价格 */
	public buyPrice: any;
	/** 双倍扫荡价格 */
	public buyDoublePrice: any
	/** 等级限制 */
	public levelLimit: number;
	/** 限制转生等级 */
	public zsLevel: number;
	/** 道具显示 */
	public showItem: {type:number,id:number,count:number}[];
	/** 描述 */
	public des: string;
	/** bossID */
	public bossId: number;
	/** 副本名字 */
	public name: string;

	public ybRec: number = 0;
	/** 月卡限制 */
	public monthcard: number = 0;
	/** 贵族限制 */
	public privilege: number = 0;
	/** 特权限制 */
	public specialCard:number = 0;
}