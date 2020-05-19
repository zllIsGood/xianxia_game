/**
 * 培养星级等级配置
 */
interface ICultivateStarLevelConfig extends ICultivateBaseLevelConfig {
	/** 培养一次需要道具数量 */
	itemNum: number;
	/** 培养一次增加经验值 */
	addExp: number;
	/** 升阶需要经验值 */
	needExp: number;
	/** 特殊技能属性 */
	ex_attrs: AttributeData[];
	/** 额外战力 */
	power: number;
}