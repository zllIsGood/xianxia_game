class CultivateLevelData {
	/** 培养类型 -继承需复写 */
	public type: CultivateType = 0;
	/** 等级 */
	private _level: number = 0;
	/** 经验 */
	private _exp: number = 0;
	/** 祝福值 */
	public blessingValue: number = 0;
	/** 祝福值失效时间 */
	public blessingValueEndTime: number = 0;
	/** 战力 */
	public power: number = 0;

	public constructor() {
	}

	public get level(): number {
		return this._level;
	}

	public set level(value: number) {
		if (this._level == value)
			return;

		this._level = value;
		this.updatePower();
	}

	public get exp(): number {
		return this._exp;
	}

	public set exp(value: number) {
		if (this._exp == value)
			return;

		this._exp = value;
		this.updatePower();
	}

	/**
	 * 获取祝福值失效剩余时间
	 * @param  {number} endTime
	 * @returns number
	 */
	public static getBlessingValueEndTime(endTime: number): number {
		return Math.ceil((DateUtils.formatMiniDateTime(endTime) - GameServer.serverTime) / DateUtils.MS_PER_SECOND);
	}

	/**
	 * 获取祝福值说明文本
	 * @param  {number} endTime
	 * @param  {boolean=true} isClear
	 * @returns string
	 */
	public static getBlessingValueEndTimeStr(endTime: number, isClear: boolean = true): string {
		let str: string = ``;

		if (isClear) {
			str = `|C:${ColorUtil.RED}&T:`
			str += endTime > 0 ? `剩余${DateUtils.getFormatTimeByStyle(endTime, DateUtils.STYLE_1)}|` : `本阶祝福值会清空|`
		}
		else {
			str = `|C:${ColorUtil.GREEN}&T:本阶祝福值不清空|`;
		}

		return str;
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
		let levelPower: number = UserBag.getAttrPower(config.attrs);
		this.power = Math.floor(levelPower);
	}

	/**
	 * 获取当前品阶配置
	 * @returns ICultivateBaseLevelConfig
	 */
	public getCurrLevelConfig(): ICultivateBaseLevelConfig {
		return this.getLevelConfig(this.level || 1);
	}

	/**
	 * 获取下一级品阶配置
	 * @returns ICultivateBaseLevelConfig
	 */
	public getNextLevelConfig(): ICultivateBaseLevelConfig {
		return !this.getIsLevelCap() ? this.getLevelConfig(this.level + 1) : null;
	}

	/**
	 * 是否可升阶
	 * @returns boolean
	 */
	public getIsUpgrade(): boolean {
		if (this.getIsMaxLevelExp())
			return false;

		let costItemData: ItemData = this.getCurrCostItemData();
		return costItemData ? this.getBagUpgradeItemCount() >= costItemData.count : false;
	}

	/**
	 * 获取购买道具需要消耗金额
	 * -继承需复写
	 * @returns number
	 */
	public getBuyItemPrice(): number {
		return 0;
	}

	/**
	 * 根据等级获取品阶配置
	 * -继承需复写
	 * @param  {number} level
	 * @returns ICultivateBaseLevelConfig
	 */
	public getLevelConfig(level: number): ICultivateBaseLevelConfig {
		return null;
	}

	/**
	 * 获取所有品阶配置
	 * -继承需复写
	 * @returns ICultivateBaseLevelConfig
	 */
	public getAllLevelConfig(): ICultivateBaseLevelConfig[] {
		return [];
	}

	/**
	 * 获取基础配置
	 * -继承需复写
	 * @returns ICultivateCommonConfig
	 */
	public getCommonConfig(): ICultivateCommonConfig {
		return null;
	}

	/**
	 * 获取当前品阶是否达到上限
	 * @returns boolean
	 */
	public getIsLevelCap(): boolean {
		return this.level >= this.getCommonConfig().lvMax;
	}

	/**
	 * 获取当前品阶是否达到上限且满经验
	 * @returns boolean
	 */
	public getIsMaxLevelExp(): boolean {
		if (!this.getIsLevelCap())
			return false;

		let config = this.getCurrLevelConfig() as ICultivateStarLevelConfig;
		return this.exp >= config.needExp;
	}

	/**
	 * 获取指定等级和经验是否达到升级
	 * @param  {number} level
	 * @param  {number} exp
	 * @returns boolean
	 */
	public getIsMaxExp(level: number, exp: number): boolean {
		let levelConfig = this.getLevelConfig(level) as ICultivateStarLevelConfig;
		return levelConfig ? exp >= levelConfig.needExp : false;
	}

	/**
	 * 获取当前品阶消耗的道具数据
	 * @returns ItemData
	 */
	public getCurrCostItemData(): ItemData {
		let itemData: ItemData;
		let levelConfig: ICultivateBaseLevelConfig = this.getCurrLevelConfig();
		if (levelConfig && levelConfig.costItems && levelConfig.costItems.length > 0) {
			itemData = new ItemData();
			itemData.count = levelConfig.costItems[0].count;
			itemData.configID = levelConfig.costItems[0].id;
		}
		return itemData;
	}

	/**
	 * 获取背包里升级材料数量
	 * @returns number
	 */
	public getBagUpgradeItemCount(): number {
		let count: number = 0;
		let costItemData: ItemData = this.getCurrCostItemData();

		if (costItemData) {
			count = UserBag.ins().getItemCountById(UserBag.BAG_TYPE_OTHTER, costItemData.configID);
		}

		return count;
	}

	/**
	 * 获取还缺少多少升阶的道具数量
	 * @returns number
	 */
	public getLackCostItemCount(): number {
		let count: number = 0;
		let costItemData: ItemData = this.getCurrCostItemData();

		if (costItemData) {
			count = Math.max(costItemData.count - this.getBagUpgradeItemCount(), 0);
		}

		return count;
	}

	/**
	 * 获取是否可使用直升丹
	 * @returns boolean
	 */
	public getCanUseLevelDan(): boolean {
		let b: boolean = false;
		if (!this.getIsLevelCap()) {
			let config: ICultivateCommonConfig = this.getCommonConfig();
			if (config) {
				b = UserBag.ins().getItemCountById(UserBag.BAG_TYPE_OTHTER, config.levelItemID) > 0;
			}
		}
		return b;
	}

}