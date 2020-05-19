/**
 *
 * @author 
 *
 */
class VipConfig {
	/** id */
	public id: number;
	/** 需要元宝数 */
	public needYb: number;
	/** 奖励列表 */
	public awards: any[];
	/** 文本描述 */
	public description: string;
	/**VIP加成 */
	public attrAddition: any[];

	public weekReward: any[];
	/**野外BOSS购买次数*/
	public boss1buy: number = 0;
	/**试炼BOSS购买次数*/
	public boss2buy: number = 0;

	public vipImg:string;
}
