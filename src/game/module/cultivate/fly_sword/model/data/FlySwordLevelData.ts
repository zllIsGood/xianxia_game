class FlySwordLevelData extends CultivateLevelData {
	/** 培养类型 -继承需复写 */
	public type: CultivateType = CultivateType.FlySword;

	public constructor() {
		super();
	}

	/**
	 * 更新战力
	 * @returns void
	 */
	public updatePower(): void {
		let config: ICultivateBaseLevelConfig = this.getCurrLevelConfig();
		if (!config) {
			this.power = 0;
			return;
		}
		let levelPower: number = UserBag.getAttrPower(this.getCurrLevelAttr());

		this.power = Math.floor(levelPower);
	}

	/**
	 * 获取当前品阶消耗的道具数据
	 * @returns ItemData
	 */
	public getCurrCostItemData(): ItemData {
		let itemData: ItemData;
		let config = this.getCommonConfig();
		let levelConfig: ICultivateStarLevelConfig = this.getCurrLevelConfig() as ICultivateStarLevelConfig;
		if (config && levelConfig) {
			itemData = new ItemData();
			itemData.count = levelConfig.itemNum;
			itemData.configID = config.itemId;
		}
		return itemData;
	}

	/**
	 * 根据等级获取品阶配置
	 * -继承需复写
	 * @param  {number} level
	 * @returns ICultivateStarLevelConfig
	 */
	public getLevelConfig(level: number): ICultivateStarLevelConfig {
		return GlobalConfig.FlySwordLevelUpConfig[level];
	}

	/**
	 * 获取所有品阶配置
	 * -继承需复写
	 * @returns ICultivateStarLevelConfig
	 */
	public getAllLevelConfig(): ICultivateStarLevelConfig[] {
		return GlobalConfig.FlySwordLevelUpConfig;
	}

	/**
	 * 获取基础配置
	 * -继承需复写
	 * @returns ICultivateCommonConfig
	 */
	public getCommonConfig(): ICultivateCommonConfig {
		return GlobalConfig.FlySwordCommonConfig;
	}

	/**
	 * 获取购买道具需要消耗金额
	 * -继承需复写
	 * @returns number
	 */
	public getBuyItemPrice(): number {
		return GlobalConfig.FlySwordCommonConfig.rmb * this.getCurrCostItemData().count;
	}

	/**
	 * 根据等级与经验计算培养次数
	 * @param  {number} level
	 * @param  {number} exp
	 * @returns number
	 */
	public getExpCount(level: number, exp: number): number {
		let config: ICultivateStarLevelConfig = this.getLevelConfig(level) as ICultivateStarLevelConfig;
		return config ? Math.floor(exp / config.addExp) : 0;
	}

	/**
	 * 获取当前等级属性
	 * @returns AttributeData
	 */
	public getCurrLevelAttr(): AttributeData[] {
		let attr: AttributeData[] = this.getCurrLevelConfig().attrs;
		let starAttr = this.getCurrStarAttr();
		attr = AttributeData.AttrAddition(attr, starAttr);
		return attr;
	}

	/**
	 * 获取下一级属性
	 * @returns AttributeData
	 */
	public getNextLevelAttr(): AttributeData[] {
		//如果可升级且未达到满级满培养则取下一级属性，否则取当前等级
		if (this.getIsMaxLevelExp())
			return [];

		let b = this.addExpIsUpgrade() && !this.getIsMaxLevelExp();
		let config: ICultivateBaseLevelConfig = b ? (this.getNextLevelConfig() || this.getCurrLevelConfig()) : this.getCurrLevelConfig();
		let attr: AttributeData[] = config && config.attrs || [];
		let starAttr = this.getNextStarAttr();
		attr = AttributeData.AttrAddition(attr, starAttr);
		return attr;
	}

	/**
	 * 当前等级培养一次是否达到升级
	 * @returns boolean
	 */
	public addExpIsUpgrade(): boolean {
		let config = GlobalConfig.FlySwordLevelUpConfig[this.level];
		return config ? this.getIsMaxExp(this.level, this.exp + config.addExp) : false;
	}

	/**
	 * 获取当前培养属性
	 * @returns AttributeData
	 */
	public getCurrStarAttr(): AttributeData[] {
		//只有等级和培养大于0，或者0级才算当前培养属性，否则取上一级满培养属性
		let level: number = this.level;
		let count: number = this.getExpCount(level, this.exp);

		if (level > 1 && count == 0) {
			level--;
			return this.getStarAttr(level, this.getLevelConfig(level).needExp);
		}

		return this.getStarAttr(level, this.exp);
	}

	/**
	 * 获取下一级培养属性
	 * @returns AttributeData
	 */
	public getNextStarAttr(): AttributeData[] {
		let config = GlobalConfig.FlySwordLevelUpConfig[this.level];
		if (!config)
			return [];

		let level = this.level;
		let exp = this.exp + config.addExp;
		return this.getStarAttr(level, exp);
	}

	/**
	 * 根据等级与经验获取培养属性
	 * @param  {number} level
	 * @param  {number} exp
	 * @returns AttributeData
	 */
	public getStarAttr(level: number, exp: number): AttributeData[] {
		let attr: AttributeData[] = [];
		let config = GlobalConfig.FlySwordTrainConfig[level];
		let levelConfig = GlobalConfig.FlySwordLevelUpConfig[level];

		if (!config && !levelConfig)
			return attr;

		//防止溢出
		exp = Math.min(levelConfig.needExp, exp);

		let expCount = this.getExpCount(level, exp);

		if (config && expCount > 0) {
			attr = config.attrs;
			let addCount = expCount - 1;
			if (addCount > 0) {
				let addAttr = AttributeData.getPercentAttr(config.addattrs, addCount - 1);
				attr = AttributeData.AttrAddition(attr, addAttr);
			}
		}
		return attr;
	}

}