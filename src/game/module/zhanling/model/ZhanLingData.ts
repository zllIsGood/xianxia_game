/**
 * 天仙数据
 */
class ZhanLingData {
	private _id: number;//皮肤编号(理解为天仙id编号)
	private _level: number;//天仙等级
	private _exp: number;//当前天仙经验
	private _items: number[];//天仙装备itemId(索引+1即部位索引)
	private _talentLv: number;//天赋等级
	private _drugs: { itemId: number, count: number }[];//丹药数据{物品id,使用个数}
	constructor(id?: number) {
		this._id = id ? id : 0;
		this._level = 0;
		this._exp = 0;
		this._items = [];
		for (let i = 0; i < GlobalConfig.ZhanLingConfig.equipPosCount; i++) {
			this._items.push(0);//初始化N个部位道具穿戴状况
		}
		this._talentLv = 0;

		this._drugs = [];
		for (let i in GlobalConfig.ZhanLingConfig.upgradeInfo) {
			this._drugs.push({itemId: Number(i), count: 0})//初始化丹药使用情况
		}
	}

	public get id() {
		return this._id;
	}

	public set id(value: number) {
		this._id = value;
	}

	public get level() {
		return this._level;
	}

	public set level(value: number) {
		this._level = value;
	}

	public get exp() {
		return this._exp;
	}

	public set exp(value: number) {
		this._exp = value;
	}

	public get items(): number[] {
		return this._items;
	}

	public set items(value: number[]) {
		this._items = value;
	}

	public get talentLv(): number {
		return this._talentLv;
	}

	public set talentLv(value: number) {
		this._talentLv = value;
	}

	public get drugs(): { itemId: number, count: number }[] {
		return this._drugs;
	}

	public set drugs(value: { itemId: number, count: number }[]) {
		this._drugs = value;
	}

}

/**天仙装备部位索引*/
enum ZLPOS{
	ITEM1 = 1,
	ITEM2 = 2,
	ITEM3 = 3,
	ITEM4 = 4,
}
