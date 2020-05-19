/**
 * 签到配置管理者
 */
class CheckInConfigMgr extends BaseClass {
	public constructor() {
		super();
	}

	/** 重载单例*/
	public static ins(): CheckInConfigMgr {
		return super.ins() as CheckInConfigMgr
	}



	/**
	 * 获取每日签到的月份奖励配置
	 * @param  {number} month
	 * @returns MonthSignConfig
	 */
	private monthListConfig: any;
	public getMonthRewardCfg_Daily(): MonthSignConfig[] {
		if (!this.monthListConfig || this.monthListConfig.length <= 0) {
			this.monthListConfig = [];
			let config: MonthSignConfig[] = GlobalConfig.MonthSignConfig;
			for (let j in config) {
				this.monthListConfig.push(config[j]);
			}
		}
		return this.monthListConfig;
	}



	/**
	 * 获取每日签到的某月单索引奖励配置
	 * @param  {number} month
	 * @param  {number} index
	 * @returns MonthSignConfig
	 */
	public getSingleRewardCfg_Daily(index: number): MonthSignConfig {
		let monthCfg: MonthSignConfig[] = this.getMonthRewardCfg_Daily();
		if (monthCfg) {
			let singleCfg: MonthSignConfig = monthCfg[index - 1];
			if (this.assert(singleCfg, `MonthSignConfig(${index})`)) return null;
			return singleCfg;
		}
		return null;
	}


	/**
	 * 获取每日签到VIP权限配置
	 * @param  {number} vipLevel
	 * @returns MonthSignVipConfig
	 */
	public getVipCfg_Daily(vipLevel: number): MonthSignVipConfig {
		let cfg: MonthSignVipConfig = GlobalConfig.MonthSignVipConfig[vipLevel];
		if (this.assert(cfg, `MonthSignVipConfig(${vipLevel})`)) return null;
		return cfg;
	}

	/**
	 * 断言
	 * @param  {any} value
	 * @param  {string} msg
	 * @returns boolean
	 */
	private assert(value: any, msg: string): boolean {
		return Assert(value, `${msg} is null`);
	}
}