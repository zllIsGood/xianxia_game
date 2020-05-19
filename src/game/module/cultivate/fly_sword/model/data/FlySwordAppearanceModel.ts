/**
 * 飞剑外观数据模块
 */
class FlySwordAppearanceModel extends CultivateAppearanceModelBase {
	/** 外观数据列表 -继承需复写 */
	public dataList: FlySwordAppearanceData[] = [];

	public constructor() {
		super();
	}

	/** 当前幻化ID */
	public set appearanceID(id: number) {
		if (this._appearanceID != id) {
			this._appearanceID = id;
			this.refresh();
		}
	}

	public get appearanceID(): number {
		return SubRoles.ins().roles[this.roleId].flySwordData.id;
	}

	/**
	 * 是否激活功能
	 * @returns boolean
	 */
	public getIsActivation(): boolean {
		return SubRoles.ins().roles[this.roleId].flySwordData.isOpen;
	}

	/**
	 * 获取所有形象配置
	 * -继承需复写
	 * @returns ICultivateTypeConfig
	 */
	protected getAllTypeConfig(): ICultivateTypeConfig[] {
		return GlobalConfig.FlySwordTypeConfig;
	}

}