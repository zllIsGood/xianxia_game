/**
 * 培养基础配置
 */
interface ICultivateCommonConfig {
	/** 系统开启开服天数 */
	dayLimit: number;
	/** 系统开启等级限制 */
	levelLimit: number;
	/** 飞剑进阶丹 */
	itemId: number;

	/** 直升丹道具 */
	levelItemID: number;
	/** 直升丹使用阶上限 */
	levelDanUseLimit: number;
	/** 超过阶数转换经验数量 */
	levelExpChange: number;

	/** 一个材料对应元宝数量 */
	rmb: number;
	/** 等级上限 */
	lvMax: number;
	/** 成长丹道具 */
	growthItemID: number;
	/** 资质丹道具 */
	qualificationItemID: number;
}