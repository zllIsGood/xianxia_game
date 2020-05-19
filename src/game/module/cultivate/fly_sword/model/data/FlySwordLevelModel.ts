/**
 * 飞剑品阶数据
 */
class FlySwordLevelModel {
	/** 技能数据 */
	public skillData: FlySwordSkillData[] = [];
	/** 品阶数据 */
	public levelData: FlySwordLevelData = new FlySwordLevelData();
	/** 成长数据 */
	public growthData: FlySwordGrowthData = new FlySwordGrowthData();
	/** 资质数据 */
	public qualificationData: FlySwordQualificationData = new FlySwordQualificationData();

	public constructor() {
		this.updateSkills();
	}

	public set level(value: number) {
		if (this.levelData.level == value)
			return;

		this.levelData.level = value;
		this.updateSkills();

		let levelConfig: ICultivateBaseLevelConfig = this.levelData.getCurrLevelConfig();
		if (!levelConfig)
			return;

		this.growthData.maxLevel = levelConfig.growthLevelCap;
		this.qualificationData.maxLevel = levelConfig.qualificationLevelCap;
	}

	public get level(): number {
		return this.levelData.level;
	}

	public updateSkills(): void {
		let configList = GlobalConfig.FlySwordLevelUpConfig;
		if (!configList)
			return;

		this.skillData = [];

		let state: FlySwordSkillType = FlySwordSkillType.Open;

		for (let key in configList) {
			let config = configList[key];
			if (!config.pasSkillId)
				continue;
			let data = new FlySwordSkillData();
			data.id = config.pasSkillId;
			data.level = config.level;

			if (state == FlySwordSkillType.ReadyOpen && this.level < config.level)
				state = FlySwordSkillType.NotOpen;

			if (state == FlySwordSkillType.Open && this.level < config.level)
				state = FlySwordSkillType.ReadyOpen;

			data.state = state;

			this.skillData.push(data);
		}
	}

	/**
	 * 获取激活飞剑功能的初始飞剑ID
	 * @returns number
	 */
	public getActivationFlySwordFuncID(): number {
		return GlobalConfig.FlySwordLevelUpConfig[0].appearanceId;
	}

	/**
	 * 获取当前品阶外形配置
	 * @returns FlySwordTypeConfig
	 */
	public getCurrAppearanceConfig(): FlySwordTypeConfig {
		let levelConfig: ICultivateBaseLevelConfig = this.levelData.getCurrLevelConfig();
		return levelConfig ? GlobalConfig.FlySwordTypeConfig[levelConfig.appearanceId] : undefined;
	}

}