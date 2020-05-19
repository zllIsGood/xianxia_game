/**
 * 培养丹数据
 */
class CultivateDanData {
	public roleId: number = 0;
	/** 等级 */
	private _level: number = 0;
	/** 培养品阶限制等级上限 */
	public maxLevel: number = 0;
	/** 战力 */
	public power: number = 0;
	/** 培养类型 -继承需复写 */
	public type: CultivateType = 0;
	/** 培养类型 -继承需复写 */
	public trainType: CultivateDanType = 0;
	/** 配置最高等级 */
	public configLevel: number;

	public constructor() {
	}

	public get level(): number {
		return this._level;
	}

	public set level(value: number) {
		if (this._level != value) {
			this._level = value;
			this.updatePower();
		}
	}

	/**
	 * 检查等级是否达到配置上限
	 * @returns boolean
	 */
	public isTopConfigLevel(): boolean {
		return this._level >= this.getConfigMaxLevel();
	}

	/**
	 * 获取配置最高等级
	 * @returns number
	 */
	public getConfigMaxLevel(): number {
		if (!this.configLevel)
			this.configLevel = Object.keys(this.getAllConfig()).length - 1;
		return this.configLevel;
	}

	/**
	 * 检查等级是否达到品阶上限
	 * @returns boolean
	 */
	public isTopLevelMax(): boolean {
		return this.level >= this.maxLevel;
	}

	/**
	 * 检查是否可升级
	 * @returns boolean
	 */
	public isCanUpgrade(): boolean {
		let b: boolean = false;
		if (!this.isTopLevelMax()) {
			let config: ICultivateDanConfig = this.getConfig(this._level);
			if (config && config.items) {
				let haveCount: number = UserBag.ins().getItemCountById(UserBag.BAG_TYPE_OTHTER, config.items.id);
				b = haveCount >= config.items.count;
			}
		}
		return b;
	}

	/**
	 * 检查当前等级是否未满，但达到品阶上限
	 * @returns boolean
	 */
	public isTopMaxNotLevelMax(): boolean {
		return this.isTopLevelMax() && !this.isTopConfigLevel();
	}

	/**
	 * 获取当前等级配置
	 * @returns ICultivateTrainConfig
	 */
	public getCurrConfig(): ICultivateDanConfig {
		return this.getConfig(this._level);
	}

	/**
	 * 获取下一级等级配置
	 * @returns ICultivateTrainConfig
	 */
	public getNextConfig(): ICultivateDanConfig {
		return !this.isTopConfigLevel() ? this.getConfig(this._level + 1) : null;
	}

	/**
	 * 获取配置
	 * -继承需复写
	 * @param  {number} level
	 * @returns ICultivateTrainConfig
	 */
	public getConfig(level: number): ICultivateDanConfig {
		return null;
	}

	/**
	 * 获取所有配置
	 * -继承需复写
	 * @returns ICultivateTrainConfig
	 */
	public getAllConfig(): ICultivateDanConfig[] {
		return [];
	}

	/**
	 * 更新战力
	 * -继承需复写
	 * @returns void
	 */
	public updatePower(): void {

	}

	/**
	 * 获取属性
	 * -继承需复写
	 * @param  {number} level
	 * @returns AttributeData
	 */
	public getAttr(level: number): AttributeData[] {
		let config = this.getConfig(level);
		return config ? config.attrs : [];
	}

}