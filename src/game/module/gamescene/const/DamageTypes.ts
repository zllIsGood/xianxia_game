/**
 * Created by Administrator on 2016/8/15.
 */
enum DamageTypes {
	/** 0不显示 */
	BLANK = 0,
	/** 1命中 */
	HIT = 1,
	/** 2暴击 */
	CRIT = 2,
	/**闪避 */
	Dodge = 4,
	/**幸运一击 */
	Lucky = 8,
	/**必杀 */
	Heji = 16,
	/**附加伤害*/
	Fujia = 32,
	/** 玉佩的威慑 */
	Deter = 64,
	/** 连续伤害多次*/
	Lianji = 128,
	/** 追命伤害*/
	ZhuiMing = 256,
	/**致命一击*/
	ZhiMing = 512,
}