/**
 * Created by MPeter on 2018/3/5.
 * 魔界入侵数据逻辑管理类
 */
class DevildomBossModel extends BaseClass {
	public constructor() {
		super();
	}

	public getCurBossIdByIndex(index: number): number {
		let range = GlobalConfig.DevilBossConfig[index].openBossList;
		// for (let day in range) {
		// 	if (GameServer.serverOpenDay + 1 >= +day) {
		// 		return +range[day];
		// 	}
		// }
		return range[0] || range[1];
	}

	/**计算获取当前可进入副本索引
	 * 已选中了，则每次进入都选择当前已选中副本，未选择，则在可击杀的副本中随机一个
	 * */
	public getCurFbIndex(): number {
		let devSys = DevildomSys.ins();
		if (devSys.historyId) {
			return devSys.historyId - 1;
		}

		let idList = [];
		for (let id in devSys.killedState) {
			if (!devSys.killedState[id]) idList.push(id);
		}

		if (idList.length > 0)return idList[MathUtils.limit(0, idList.length) >> 0] - 1;

		return MathUtils.limit(0, 3) >> 0;
	}
}
