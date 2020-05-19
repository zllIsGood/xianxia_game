/**
 * 飞剑外观数据
 */
class FlySwordAppearanceData extends CultivateAppearanceDataBase {

	public constructor(id?: number, ...param: any[]) {
		super(id, ...param);
	}

	/**
	 * 获取是否激活
	 * @returns boolean
	 */
	public getIsActivation(): boolean {
		if (!this.getIsLevel()) {
			return this.getEndTime() > 0 || this.endTime == -1;
		}

		return FlySword.ins().getIsActivation(this.roleId) && this.getCurrLevelAppearanceConfig().level >= this.getLevelConfig().level;
	}

	/**
	 * 根据id获取外观配置
	 * -继承需复写
	 * @param  {number} id
	 * @returns ICultivateTypeConfig
	 */
	protected getConfigById(id: number): ICultivateTypeConfig {
		return GlobalConfig.FlySwordTypeConfig[id];
	}

	/**
	 * 获取所有等级配置
	 * -继承需复写
	 * @returns FlySwordLevelUpConfig
	 */
	protected getAllLevelConfig(): FlySwordLevelUpConfig[] {
		return GlobalConfig.FlySwordLevelUpConfig;
	}

	/**
	 * 获取已激活品阶的外形配置
	 * -继承需复写
	 * @returns ICultivateBaseLevelConfig
	 */
	public getCurrLevelAppearanceConfig(): ICultivateBaseLevelConfig {
		let data = FlySword.ins().getLevelData(this.roleId);
		return data ? data.getCurrLevelConfig() : undefined;
	}

}