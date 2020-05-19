
/**
 * 效果类型
 * 1 附加伤害 {a=系数,t=施法者属性类型,b=附加值} 
 * 2 加血 {a=系数,t=施法者属性类型,b=附加值} 
 * 3 附加属性 {a=系数,t1=施法者属性类型,b=附加值, t2=附加属性类型}
 * 4 附加状态
 * 5 召唤 {怪物1id,怪物2id，怪物3id…}
 * 6 未知 
 * 7 开启最高承受伤害上限 {a=系数}
 * 8 免疫眩晕
 */
enum SkillEffType {
	/** 附加伤害 */
	AdditionalDamage = 1,
	/** 加血 */
	AddBlood,
	/** 附加属性 */
	AdditionalAttributes,
	/** 附加状态 */
	AdditionalState,
	/** 召唤 */
	Summon,
	/** 其他 */
	Other,
	/** 宿主有效的附加属性 */
	HostAddAttributes,
	/** 霸体免疫眩晕 */
	SuperArmor,
}