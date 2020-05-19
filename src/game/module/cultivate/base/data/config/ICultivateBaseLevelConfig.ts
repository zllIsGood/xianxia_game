interface ICultivateBaseLevelConfig {
	/** 等级 */
	level: number;
	/** 消耗道具 */
	costItems: RewardData[];
	/** 属性 */
	attrs: AttributeData[];
	/** 技能 */
	pasSkillId: number;
	/** 资质等级上限 */
	qualificationLevelCap: number;
	/** 成长等级上限 */
	growthLevelCap: number;
	/** 外观配置ID */
	appearanceId: number;
}