/**
 * 培养技能
 */
class CultivateSkillData {
	public id: number;
	public type: number = 0;
	public level: number = 0;
	public isOpen: boolean = false;

	public constructor(id: number, type: number, level: number, isOpen: boolean = true) {
		this.id = id;
		this.type = type;
		this.level = level;
		this.isOpen = isOpen;
	}

	public getConfig(): ICultivateBaseLevelConfig {
		let config: ICultivateBaseLevelConfig
		switch (this.type) {
			case CultivateType.FlySword:
				config = GlobalConfig.FlySwordLevelUpConfig[this.level];
				break;
		}
		return config;
	}

}