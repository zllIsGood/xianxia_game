/**
 * SkillsConfig
 */
interface SkillsConfig {

	id: number;
	/** 名字 */
	skinName: string;
	/** 被动技能参数 */
	passive: { rate: number, cond: number, p1: number };

	/** 描述id */
	desc: number;

	/** 描述扩展数字 */
	desc_ex: number[];

	/**
	 * 施法目标类型
	 * 1、友方
	 * 2、敌方
	 * 3、自己
	 */
	castType: number;

	/**
	 * 作用目标类型
	 * 1、友方
	 * 2、敌方
	 */
	targetType: number;
	/**
	 * 作用范围大小
	 * 按格子
	 * 0、单攻
	 * 1、目标周围1格
	 */
	affectRange: number;
	/** 最大作用个数 */
	affectCount: number;
	/**
	 * 伤害计算类型
	 * 0、没有伤害
	 * 1、造成伤害
	 * 2、加血
	 */
	calcType: number;
	/**
	 * 参数列表
	 */
	args: { b: number, a: number, c: number };
	/**
	 * 目标附加效果
	 */
	tarEff: number[];

	/**
	 * 次要目标附加效果 对人物有效
	 */
	otarEff: number[];

	/**
	 * 自身附加效果
	 */
	selfEff: number[];

	/** 自身是否位移（0否1是） */
	teleport: number;
	/** 附加击退（距离） */
	repelDistance: number;
	/** 特效播放类型 */
	effType: number;

	/**关联其他技能*/
	otherSkills:number[];
}