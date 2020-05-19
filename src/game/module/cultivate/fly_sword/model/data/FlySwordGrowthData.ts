class FlySwordGrowthData extends CultivateDanData {
	/** 培养类型 -继承需复写 */
	public type: CultivateType = CultivateType.FlySword;
	/** 培养类型 -继承需复写 */
	public trainType: CultivateDanType = CultivateDanType.Growth;

	public constructor() {
		super();
	}

	/**
	 * 更新战力
	 * -继承需复写
	 * @returns void
	 */
	public updatePower(): void {
		let levelConfig = FlySword.ins().getLevelData(this.roleId);
		let levelAttr: AttributeData[] = levelConfig ? levelConfig.getCurrLevelAttr() : [];

		let configAttr: AttributeData[] = this.getAttr(this.level);

		let attr: AttributeData[] = AttributeData.rateTurnAttr(levelAttr, configAttr);
		this.power = Math.floor(UserBag.getAttrPower(attr));
	}

	/**
	 * 获取配置
	 * -继承需复写
	 * @param  {number} level
	 * @returns ICultivateTrainConfig
	 */
	public getConfig(level: number): FlySwordGrowthConfig {
		return GlobalConfig.FlySwordGrowthConfig[1];
	}

	/**
	 * 获取所有配置
	 * -继承需复写
	 * @returns ICultivateTrainConfig
	 */
	public getAllConfig(): FlySwordGrowthConfig[] {
		return GlobalConfig.FlySwordGrowthConfig;
	}

	/**
	 * 获取配置最高等级
	 * @returns number
	 */
	public getConfigMaxLevel(): number {
		if (!this.configLevel) {
			let keys = Object.keys(GlobalConfig.FlySwordLevelUpConfig);
			this.configLevel = GlobalConfig.FlySwordLevelUpConfig[keys.length].growthLevelCap;
		}
		return this.configLevel;
	}

	/**
	 * 获取属性
	 * -继承需复写
	 * @param  {number} level
	 * @returns AttributeData
	 */
	public getAttr(level: number): AttributeData[] {
		return level <= this.getConfigMaxLevel() ? AttributeData.getPercentAttr(this.getConfig(level).attrs, level - 1) : undefined;
	}
}