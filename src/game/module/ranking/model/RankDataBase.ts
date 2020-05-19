/**
 * 排行榜基础数据类型
 */
class RankDataBase {
	/** 排位 */
	public pos: number;

	/** 角色名 */
	public player: string;

	/** ID */
	public id: number;

	public constructor() {
	}

	public parser(bytes: GameByteArray, items: string[]) {
		items.forEach(key => {
			this[key] = bytes[RankDataType.readFunc[key]]();
		});
	}
}