/**
 * 飞剑
 */
class FlySwordModel {
	/** 角色id */
	public roleId: number = 0;
	/** 是否乘骑 */
	public isRide: boolean = false;
	/** 飞剑品阶等级数据 */
	public levelModel: FlySwordLevelModel = new FlySwordLevelModel();
	/** 飞剑外观数据模型 */
	public appearanceModel: FlySwordAppearanceModel = new FlySwordAppearanceModel();

	public constructor() {
	}

	/**
	 * 解析飞剑数据
	 * 67-1
	 * @param  {GameByteArray} bytes
	 * @returns void
	 */
	public parserData(bytes: GameByteArray): void {
		this.roleId = bytes.readShort();
		this.levelModel.growthData.roleId = this.levelModel.qualificationData.roleId =
			this.appearanceModel.roleId = this.roleId;

		this.levelModel.qualificationData.level = bytes.readInt();
		this.levelModel.growthData.level = bytes.readInt();

		let appearanceCount: number = bytes.readInt();
		for (let i: number = 0; i < appearanceCount; i++) {
			this.appearanceModel.updateData(bytes.readInt(), bytes.readInt());
		}
	}

	/**
	 * 解析升阶
	 * 67-2
	 * @param  {GameByteArray} bytes
	 * @returns {number} 
	 */
	public parserUpgradeLevel(bytes: GameByteArray): boolean {
		let lastLevel: number = this.levelModel.level;
		let lastExp: number = this.levelModel.levelData.exp;
		this.levelModel.level = bytes.readInt();
		this.levelModel.levelData.exp = bytes.readInt();
		return this.levelModel.level > lastLevel;
	}

	/**
	 * 解析资质丹使用结果
	 * 67-5
	 * @param  {GameByteArray} bytes
	 * @returns boolean
	 */
	public parserQualificationDan(bytes: GameByteArray): boolean {
		let upgrade: boolean = bytes.readShort() == 1;
		this.levelModel.qualificationData.level = bytes.readInt();
		return upgrade;
	}

	/**
	 * 解析成长丹使用结果
	 * 67-5
	 * @param  {GameByteArray} bytes
	 * @returns boolean
	 */
	public parserGrowthDan(bytes: GameByteArray): boolean {
		let upgrade: boolean = bytes.readShort() == 1;
		this.levelModel.growthData.level = bytes.readInt();
		return upgrade;
	}

	/**
	 * 解析飞剑激活
	 * 67-3
	 * @param  {GameByteArray} bytes
	 * @returns number
	 */
	public parserActivation(bytes: GameByteArray): number[] {
		let id: number = bytes.readInt();
		let isActivation: boolean = bytes.readByte() == 1;
		let endTime: number = bytes.readInt();
		this.appearanceModel.updateData(id, endTime);
		return [id, this.appearanceModel.getIndexById(id)];
	}

	/**
	 * 获取总战力
	 * @returns number
	 */
	public getTotalCombatPower(): number {
		let power: number = 0;
		if (this.appearanceModel.getIsActivation()) {
			for (let i: number = 0; i < FlySwordCombatPowerType.Length; i++)
				power += this.getCombatPower(i);
		}
		return power;
	}

	/**
	 * 根据战力类型获取战力
	 * @param  {FlySwordCombatPowerType} type
	 * @returns number
	 */
	public getCombatPower(type: FlySwordCombatPowerType): number {
		let power: number = 0;
		switch (type) {
			case FlySwordCombatPowerType.Level:
				power = this.levelModel.levelData.power;
				break;
			case FlySwordCombatPowerType.Growth:
				power = this.levelModel.growthData.power;
				break;
			case FlySwordCombatPowerType.Qualification:
				power = this.levelModel.qualificationData.power;
				break;
			case FlySwordCombatPowerType.Apparance:
				power = this.appearanceModel.getTotalPower();
				break;
		}
		return power;
	}

	public updatePower(): void {
		if (!this.levelModel)
			return;

		if (this.levelModel.levelData)
			this.levelModel.levelData.updatePower();
		if (this.levelModel.growthData)
			this.levelModel.growthData.updatePower();
		if (this.levelModel.qualificationData)
			this.levelModel.qualificationData.updatePower();
	}

}

/** 飞剑战力类型 */
enum FlySwordCombatPowerType {
	/** 品阶 */
	Level,
	/** 成长 */
	Growth,
	/** 资质 */
	Qualification,
	/** 外观 */
	Apparance,
	/** 长度 */
	Length
}

/** 飞剑丹药类型 */
enum FlySwordDanMedicineType {
	/** 品阶 */
	Level,
	/** 成长 */
	Growth,
	/** 资质 */
	Qualification
}

/** 飞剑幻化类型 */
enum FlySwordAppearanceType {
	Unload,
	Equip
}