/**
 * Created by Administrator on 2017/6/24.
 */
class SkillData {

	private _id: number;
	public config: SkillsConfig;

	private _specialCD:number = 0;

	private _preId:number;//前置技能id

	constructor(id: number) {
		this.configID = id;
	}

	/** 等级 */
	get lv(): number {
		return this._id % 1000;
	}

	get job(): number {
		return Math.floor(this._id % 100000 / 10000);
	}
	/**第几个技能 针对角色的技能 */
	get index(): number {
		return Math.floor(this._id / 1000 % 10);
	}

	/** id */
	get id(): number {
		return Math.floor(this._id / 1000) * 1000;
	}

	get icon(): string {
		return `${this.id}_png`
	}

	set configID(id: number) {
		this._id = id;
		this.config = GlobalConfig.SkillsConfig[id];
		this._preId = NaN;
	}

	/** 配置id */
	get configID(): number {
		return this._id;
	}

	set preId(id:number) {
		this._preId = id;
	}

	get preId():number {
		return this._preId;
	}

	/** 1级的id */
	get lv1ConfigID(): number {
		return this.id + 1;
	}

	/** 施法目标 */
	get castType(): number {
		return isNaN(this.config.castType) ? 2 : this.config.castType;
	}

	/** 作用目标 */
	get targetType(): number {
		return isNaN(this.config.targetType) ? 2 : this.config.targetType;
	}

	/** 描述 */
	get desc(): string {
		let levelConfig = this.config || GlobalConfig.SkillsConfig[this.lv1ConfigID];
		if (Assert(levelConfig, `技能id:${this.configID}找不到配置`)) {
			return ``;
		}
		let config = GlobalConfig.SkillsDescConfig[levelConfig.desc];
		let str = config ? config.desc : ``;
		if (!str.length || !levelConfig.desc_ex) return str;
		let len = levelConfig.desc_ex.length;
		for (let i = 0; i < len; i++) {
			str = str.replace("%s%", levelConfig.desc_ex[i] + "");
		}
		return str;
	}

	/** 作用范围大小 */
	get affectRange(): number {
		return isNaN(this.config.affectRange) ? 1 : this.config.affectRange;
	}

	/** 作用个数 */
	get affectCount(): number {
		return isNaN(this.config.affectCount) ? 1 : this.config.affectCount;
	}

	/** 伤害类型 */
	get calcType(): number {
		return isNaN(this.config.calcType) ? 1 : this.config.calcType;
	}

	/** 群攻对怪物伤害降低比例*/
	get herdMonRate(): number {
		let config = GlobalConfig.SkillsDescConfig[this.descID];
		return config ? (isNaN(config.herdMonRate) ? 100 : config.herdMonRate) : 100;
	}

	/** 群攻对人物伤害降低比例*/
	get herdPlayerRate(): number {
		let config = GlobalConfig.SkillsDescConfig[this.descID];
		return config ? (isNaN(config.herdPlayerRate) ? 10 : config.herdPlayerRate) : 10;
	}

	get cd(): number {
		if (this._specialCD)
			return this._specialCD;

		let config = GlobalConfig.SkillsDescConfig[this.descID];
		return config ? config.cd : 0;
	}

	/** 设置特殊CD（需要计算的CD） */
	set specialCD(value:number)
	{
		this._specialCD = value;
	}

	/** 是否被动技能 */
	get isPassive(): boolean {
		return !!this.config.passive;
	}

	/** 触发几率 */
	get rate(): number {
		return this.config.passive && this.config.passive.rate || 0;
	}

	/** 主动触发(0)还是被动触发(1) */
	get cond(): number {
		return this.config.passive && this.config.passive.cond || 0;
	}

	/** 施法距离(按格子) */
	get castRange(): number {
		let config = GlobalConfig.SkillsDescConfig[this.descID];
		return config ? config.castRange : 0;
	}

	/** 最短施法距离(按格子) */
	get minRange(): number {
		let config = GlobalConfig.SkillsDescConfig[this.descID];
		return config ? (config.minRange || 0) : 0;
	}

	/** 附加击退（距离） */
	get repelDistance(): number {
		return this.config.repelDistance;
	}

	/** 自身是否位移（0否1是） */
	get teleport(): number {
		return this.config.teleport;
	}

	/** 动作类型 */
	get actionType(): string {
		let config = GlobalConfig.SkillsDescConfig[this.descID];
		return config ? config.actionType : ``;
	}

	get tarEff(): number[] {
		return this.config.tarEff;
	}

	get otarEff(): number[] {
		return this.config.otarEff;
	}

	get selfEff(): number[] {
		return this.config.selfEff;
	}

	get canUse(): boolean {
		return this.config && !!this.lv;
	}

	get name(): string {
		let config = GlobalConfig.SkillsDescConfig[this.descID];
		return config ? config.name : ``;
	}

	get args(): { b: number, a: number, c: number } {
		return this.config.args;
	}

	get wordEff(): string {
		let config = GlobalConfig.SkillsDescConfig[this.descID];
		return config ? config.wordEff : ``;
	}

	get effType(): number {
		return this.config.effType;
	}

	get otherSkills():number[] {
		return this.config.otherSkills;
	}

	get effectId(): number {
		let config = GlobalConfig.SkillsDescConfig[this.descID];
		return config ? config.effectId : 0;
	}

	get sound(): string {
		let config = GlobalConfig.SkillsDescConfig[this.descID];
		return config ? config.sound : '';
	}

	static getSkillByJob(job: number, index: number = 1, lv: number = 1): SkillData {
		return new SkillData(job * 10000 + index * 1000 + lv);
	}

	private get descID(): number {
		let config = GlobalConfig.SkillsConfig[this.configID] || GlobalConfig.SkillsConfig[this.lv1ConfigID];
		return config ? config.desc : 0;
	}
}