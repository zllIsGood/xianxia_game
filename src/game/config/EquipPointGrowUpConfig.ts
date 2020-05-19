/**
 * Created by Administrator on 2016/7/28.
 */
class EquipPointGrowUpConfig {

	/** 装备点id */
	public id: number;
	/** 成长id */
	public growUpId: number;
	/** 显示阶 */
	public rank: number;
	/** 显示级 */
	public level: number;
	/** 显示星 */
	public star: number;
	/** 成长机率 */
	public growUpProbability: number;
	/** 成长状态1为升星2为升级 */
	public growUpState: number;
	/** 成长要的item */
	public growUpItem: RewardData;
	/** 属性 */
	public attrs: AttributeData[];
	/** 需要的等级 */
	public needLevel: number;
}