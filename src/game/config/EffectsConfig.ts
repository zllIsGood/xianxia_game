/**
 * 技能效果配置
 */
class EffectsConfig {

	public id: number;
	/** 是否增益 */
	public isBuff: number;
	/**
	 * 效果类型
	 * 1 附加伤害 {a=系数,t=施法者属性类型,b=附加值}
	 * 2 加血 {a=系数,t=施法者属性类型,b=附加值}
	 * 3 附加属性 {a=系数,t1=施法者属性类型,b=附加值, t2=附加属性类型}
	 * 4 附加状态
	 * 5 召唤 {怪物1id,怪物2id，怪物3id…}
	 */
	public type: SkillEffType;
	/** 效果参数 */
	public args: { a: number, b: number, c: number, d: number, i: number };
	/** 持续时间（毫秒）*/
	public duration: number;
	/** 作用间隔（毫秒）*/
	public interval: number;
	/**
	 * 叠加类型
	 * id相同时的叠加类型：
	 * 0,不叠加，替换
	 * 1，时间延长
	 * 2，独立计算
	 * 3，刷新并延长（没必要且不想做）
	 */
	public overlayType: number;
	public overlayLimit: number;
	/** 分组类型(分组相同的会替换) */
	public group: number;
	/** 特效名字 */
	public effName: string;
	/** 开头特效id */
	public effID: number;

	//联合buff 当前buff移除，联合buff也要移除
	public unionBuff: number;

	//BUFF触发概率
	public probabilityBuff:number;

	static isAddBuff(config: EffectsConfig): boolean {
		return config.type == SkillEffType.AdditionalState ||
			config.type == SkillEffType.AdditionalDamage ||
			config.type == SkillEffType.AdditionalAttributes ||
			config.type == SkillEffType.Summon;
	}
}

const BUFF_GROUP = {
	/**麻痹 */
	NUMB: 51001,
	/**中毒 */
	POISON: 23001,
}