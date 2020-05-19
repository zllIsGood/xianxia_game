/**
 * 培养外观模型基类
 */
class CultivateAppearanceModelBase {
	public roleId: number = 0;
	/** 是否激活 */
	public isActivation: boolean = false;
	/** 当前幻化ID */
	protected _appearanceID: number = 0;
	/** 外观ID列表 */
	public idList: number[] = [];
	/** 外观数据列表 -继承需复写 */
	public dataList: CultivateAppearanceDataBase[] = [];
	/** 列表数据源 */
	public dataCollection: eui.ArrayCollection = new eui.ArrayCollection();

	public constructor() {
	}

	/**
	 * 获取所有形象配置
	 * -继承需复写
	 * @returns ICultivateTypeConfig
	 */
	protected getAllTypeConfig(): ICultivateTypeConfig[] {
		return [];
	}

	/** 当前幻化ID */
	public set appearanceID(id: number) {
		if (this.appearanceID != id) {
			this._appearanceID = id;
			this.refresh();
		}
	}

	public get appearanceID(): number {
		return this._appearanceID;
	}

	/**
	 * 是否激活功能
	 * @returns boolean
	 */
	public getIsActivation(): boolean {
		for (let data of this.dataList) {
			if (data.getIsActivation()) {
				return true;
			}
		}
		return this.isActivation;
	}

	/**
	 * 获取当前幻化ID在数据源的索引
	 * @returns number
	 */
	public getCurrAppearanceIndex(): number {
		return this.getIndexById(this.appearanceID);
	}

	/**
	 * 获取当前幻化的数据
	 * @returns CultivateAppearanceDataBase
	 */
	public getCurrAppearanceData(): CultivateAppearanceDataBase {
		let index: number = this.getCurrAppearanceIndex();
		return index != -1 ? this.dataList[index] : null;
	}

	/**
	 * 获取指定ID数据
	 * @param  {number} id
	 * @returns CultivateAppearanceDataBase
	 */
	public getDataById(id: number): CultivateAppearanceDataBase {
		let index: number = this.idList.indexOf(id);
		return index != -1 ? this.dataList[index] : undefined;
	}

	/**
	 * 根据ID获取索引
	 * @param id
	 * @returns {number}
	 */
	public getIndexById(id: number): number {
		return this.idList.indexOf(id);
	}

	/**
	 * 初始化数据
	 * @returns void
	 */
	public initDataList(obj: { new () }, ...param: any[]): void {
		let configList: ICultivateTypeConfig[] = this.getAllTypeConfig();
		if (!configList)
			return;

		let classStr: string = egret.getQualifiedClassName(obj);
		let data: CultivateAppearanceDataBase;
		let config: ICultivateTypeConfig;
		this.idList = [];
		this.dataList = [];

		for (let key in configList) {
			config = configList[key];
			data = new (HYDefine.getDefinitionByName(classStr))(config.appearanceId, ...param);
			this.idList.push(config.appearanceId);
			this.dataList.push(data);
		}

		this.dataCollection.source = this.dataList;

		this.refresh();
	}

	/**
	 * 更新指定ID时效
	 * @param  {number} id
	 * @param  {number} endTime
	 * @returns void
	 */
	public updateData(id: number, endTime: number): void {
		let index: number = this.idList.indexOf(id);
		if (index != -1) {
			this.dataList[index].endTime = endTime;
			this.sort();
		}
	}

	/**
	 * 获取是否存在可激活形象
	 * @returns boolean
	 */
	public getCanActivation(): boolean {
		let b: boolean = false;

		for (let data of this.dataList) {
			b = data.getCanActivation();
			if (b) {
				break;
			}
		}

		return b;
	}

	/**
	 * 获取所有可激活状态
	 * @returns boolean
	 */
	public getAllCanActivationState(): boolean[] {
		let stateList: boolean[] = [];

		for (let data of this.dataList) {
			stateList.push(data.getCanActivation());
		}

		return stateList;
	}

	/**
	 * 刷新
	 * @returns void
	 */
	public refresh(): void {
		if (!this.dataList)
			return;

		for (let data of this.dataList) {
			data.updateAppearance(this.appearanceID);
		}
		this.sort();
	}

	/**
	 * 排序数据
	 * @returns void
	 */
	public sort(): void {
		if (!this.dataList)
			return;

		this.idList = [];
		this.dataList = this.dataList.sort(this.sortFunc);
		for (let data of this.dataList) {
			this.idList.push(data.id);
		}
		this.dataCollection.replaceAll(this.dataList);
	}

	/**
	 * 排序方法
	 * @param  {CultivateAppearanceDataBase} a
	 * @param  {CultivateAppearanceDataBase} b
	 * @returns number
	 */
	protected sortFunc(a: CultivateAppearanceDataBase, b: CultivateAppearanceDataBase): number {
		let num: number = Algorithm.sortDesc(a.getIsActivation(), b.getIsActivation());
		if (num == 0)
			num = Algorithm.sortAsc(a.getConfig().id, b.getConfig().id);

		return num;
	}

	/**
	 * 获取总战力
	 * @returns number
	 */
	public getTotalPower(): number {
		let power: number = 0;
		for (let data of this.dataList) {
			if (!data.getIsLevel() && data.getIsActivation())
				power += data.getPower();
		}
		return power;
	}
}