/**
 * 培养
 */
class CultivateModel {
	public static TYPE_NAMES: string[] = [`飞剑`];
	public static TRAIN_TYPE_NAMES: string[] = [`品阶`, `潜能`, `飞升`];

	public constructor() {
	}

	/**
	 * 根据培养类型获取类型名称
	 * @param  {CultivateType} type
	 * @returns string
	 */
	public static getTypeName(type: CultivateType): string {
		let str: string = ``;
		if (type != undefined && type < this.TYPE_NAMES.length) {
			str = this.TYPE_NAMES[type];
		}
		return str;
	}

	/**
	 * 根据培养培养获取类型名称
	 * @param  {CultivateDanType} type
	 * @returns string
	 */
	public static getTrainTypeName(type: CultivateDanType): string {
		let str: string = ``;
		if (type != undefined && type < this.TRAIN_TYPE_NAMES.length) {
			str = this.TRAIN_TYPE_NAMES[type];
		}
		return str;
	}

}

/** 功能类型 */
enum CultivateType {
	/** 飞剑 */
	FlySword
}

/** 培养类型 */
enum CultivateDanType {
	/** 品阶 */
	Level,
	/** 资质 */
	Qualification,
	/** 成长 */
	Growth,
	/** 长度 */
	Length
}