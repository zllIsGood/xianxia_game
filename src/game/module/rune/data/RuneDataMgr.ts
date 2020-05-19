/**
 * 符文数据管理者
 */
class RuneDataMgr extends BaseClass {

	public constructor() {
		super();
	}

	/** 重载单例*/
	public static ins(): RuneDataMgr {
		return super.ins() as RuneDataMgr
	}

	/**
	 * 获取角色的符文数据集
	 * @param  {number} roleIndex
	 * @returns RuneData
	 */
	public getRoleRune(roleIndex: number): ItemData[] {
		let role: Role = SubRoles.ins().getSubRoleByIndex(roleIndex);
		if (role) {
			return role.runeDatas;
		}
		return null;
	}

	/**
	 * 获取符文数据
	 * @param  {number} roleIndex
	 * @param  {number} pos
	 * @returns RuneData
	 */
	public getRune(roleIndex: number, pos: number): ItemData {
		let runeDatas: ItemData[] = this.getRoleRune(roleIndex);
		if (!runeDatas) return null;
		return runeDatas[pos];
	}

	/**
	 * 替换符文
	 * @param  {number} roleIndex
	 * @param  {number} pos
	 * @param  {number} id
	 * @returns void
	 */
	public replaceRune(roleIndex: number, pos: number, id: number): void {
		let rdList: ItemData[] = this.getRoleRune(roleIndex);
		if (rdList && pos >= 0) {
			rdList[pos].configID = id;
		}
	}
	/**
	 * 获取该角色等级最小符文数据
	 * @param  {number} roleIndex
	 * @param  {boolean} canUp
	 * @returns RuneData
	 */
	public getMinRune(roleIndex: number, canUp: boolean = false): ItemData {
		let runeDatas: ItemData[] = this.getRoleRune(roleIndex);
		if (!runeDatas) return null;//此角色没有开启任何一个符文
		let exitDatas: ItemData[] = [];
		for (let i = 0; i < runeDatas.length; i++) {
			if (runeDatas[i].itemConfig) {
				exitDatas.push(runeDatas[i]);
			}
		}
		exitDatas.sort(function (a: ItemData, b: ItemData): number {
			//优先判断等级
			if ((a.itemConfig.id % 100) < (b.itemConfig.id % 100))
				return -1;
			if ((a.itemConfig.id % 100) > (b.itemConfig.id % 100))
				return 1;
			//判断品质
			let quality1: number = ItemConfig.getQuality(a.itemConfig);
			let quality2: number = ItemConfig.getQuality(b.itemConfig);
			if (quality1 > quality2)
				return -1;
			if (quality1 < quality2)
				return 1;
			return 0;
		});

		//优先选择可升级的
		if (canUp) {
			for (let itemDt of exitDatas) {
				if (RuneRedPointMgr.ins().checkSingleUpgrade(itemDt))
					return itemDt;
			}
		}

		return exitDatas[0];
	}

	public posIsWear: any = null;
}