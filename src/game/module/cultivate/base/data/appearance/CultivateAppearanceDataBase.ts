/**
 * 培养外观数据基类
 */
class CultivateAppearanceDataBase {
	public roleId: number = 0;
	/** id */
	public id: number = 0;
	/** 失效时间 -1为永久*/
	public endTime: number = 0;
	/** 是否幻化 */
	protected isAppearance: boolean = false;
	/** 是否属于品阶 */
	protected isLevel: boolean = undefined;
	/** 品阶配置 */
	private levelConfig: ICultivateBaseLevelConfig;

	public constructor(id?: number, ...param: any[]) {
		if (id != undefined) {
			this.id = id;
		}
		this.roleId = param[0] || 0;
	}

	/**
	 * 根据id获取外观配置
	 * -继承需复写
	 * @param  {number} id
	 * @returns ICultivateTypeConfig
	 */
	protected getConfigById(id: number): ICultivateTypeConfig {
		return null;
	}

	/**
	 * 获取所有等级配置
	 * -继承需复写
	 * @returns ICultivateBaseLevelConfig
	 */
	protected getAllLevelConfig(): ICultivateBaseLevelConfig[] {
		return [];
	}

	/**
	 * 获取已激活品阶的外形配置
	 * -继承需复写
	 * @returns ICultivateBaseLevelConfig
	 */
	public getCurrLevelAppearanceConfig(): ICultivateBaseLevelConfig {
		return undefined;
	}

	/**
	 * 获取剩余时间
	 * @returns number
	 */
	public getEndTime(): number {
		return this.endTime > 0 ? Math.ceil((DateUtils.formatMiniDateTime(this.endTime) - GameServer.serverTime) / 1000) : this.endTime;
	}

	/**
	 * 获取外观配置
	 * @returns ICultivateTypeConfig
	 */
	public getConfig(): ICultivateTypeConfig {
		return this.getConfigById(this.id);
	}

	/**
	 * 获取是否激活
	 * @returns boolean
	 */
	public getIsActivation(): boolean {
		return this.getEndTime() >= 0;
	}

	/**
	 * 刷新幻化
	 * @param  {number} id
	 * @returns void
	 */
	public updateAppearance(id: number): void {
		this.isAppearance = id == this.id;
	}

	/**
	 * 获取是否幻化
	 * @returns boolean
	 */
	public getIsAppearance(): boolean {
		return this.isAppearance;
	}

	/**
	 * 获取是否可激活
	 * @returns boolean
	 */
	public getCanActivation(): boolean {
		if (this.getIsActivation())
			return false;

		if (this.getIsLevel()) {
			//临时用已激活品阶的外形id判断当前外形ID
			let data = this.getCurrLevelAppearanceConfig();
			return data ? data.appearanceId >= this.id : false;
		}
		else {
			let itemData: ItemData = this.getCostItemData();
			if (itemData) {
				return UserBag.ins().getItemCountById(UserBag.BAG_TYPE_OTHTER, itemData.configID) >= itemData.count;
			}
		}
		return false;
	}

	/**
	 * 获取需求道具数据
	 * @returns ItemData
	 */
	public getCostItemData(): ItemData {
		let config: ICultivateTypeConfig = this.getConfig();
		if (!config || !config.costItems)
			return undefined;

		let itemData = new ItemData();
		itemData.count = config.costItems.count;
		itemData.configID = config.costItems.id;
		return itemData;
	}

	/**
	 * 是否属于品阶
	 * @returns boolean
	 */
	public getIsLevel(): boolean {
		if (this.isLevel != undefined)
			return this.isLevel;

		let b: boolean = false;
		let config: ICultivateBaseLevelConfig[] = this.getAllLevelConfig();
		if (config) {
			for (let key in config) {
				if (config[key].appearanceId != undefined) {
					b = config[key].appearanceId == this.id;
					if (b) {
						this.levelConfig = config[key];
						break;
					}
				}
			}
		}
		this.isLevel = b;

	}

	/**
	 * 获取等级配置
	 * @returns ICultivateBaseLevelConfig
	 */
	public getLevelConfig(): ICultivateBaseLevelConfig {
		if (!this.levelConfig && this.getIsLevel()) {
			let config: ICultivateBaseLevelConfig[] = this.getAllLevelConfig();
			if (config) {
				for (let key in config) {
					if (config[key].appearanceId && config[key].appearanceId == this.id) {
						this.levelConfig = config[key];
						break;
					}
				}
			}
		}
		return this.levelConfig;
	}

	/**
	 * 获取战力
	 * @returns number
	 */
	public getPower(): number {
		let attrs: AttributeData[] = this.getAttrs();
		return attrs.length ? Math.floor(UserBag.getAttrPower(attrs)) : 0;
	}

	/**
	 * 获取属性
	 * @returns AttributeData
	 */
	public getAttrs(): AttributeData[] {
		let attrs: AttributeData[] = [];
		if (this.getIsLevel()) {
			if (this.getLevelConfig() && this.levelConfig.attrs) {
				attrs = this.levelConfig.attrs;
			}
		}
		else {
			let config: ICultivateTypeConfig = this.getConfig();
			if (config && config.attrs) {
				attrs = config.attrs;
			}
		}
		return attrs;
	}
}