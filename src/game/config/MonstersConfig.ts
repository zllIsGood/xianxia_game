/**
 * MonstersConfig
 */
class MonstersConfig {

	public id: number;
	/** 名字 */
	public name: string;
	/** 等级 */
	public level: number;
	/** 血量 */
	public hp: number;
	/** 攻击 */
	public atk: number;
	/** 防御 */
	public def: number;
	/** 法防 */
	public res: number;
	/** 暴击 */
	public crit: number;
	/** 抗暴 */
	public tough: number;
	/** 攻击速度 */
	public as: number;
	/** 移动速度 */
	public ms: number;
	/** 形象文件名 */
	public avatar: string;
	/** 头像 */
	public head: string;
	/** 放大倍率 */
	public scale: number;
	/** 怪物类型 */
	public type:number;

	public effect: number;

	public attrange: number = 0;

	public wanderrange: number = 0;

	public wandertime: number;

	public dir: number;

	public sound:string;
	//怪物方向个数 默认只有2个方向
	public dirNum:number = 2;
}

/**怪物类型 */
enum MonsterType{
	/**普通怪物 0*/
	Monster,
	/**BOSS 1*/
	Boss,
	/**术士召唤怪 3*/
	Summon = 3,
	/**烈焰戒指 4*/
	Ring = 4,
}