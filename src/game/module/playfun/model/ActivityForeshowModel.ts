/**
 *  活动预告数据模型
 * Created by Peach.T on 2017/11/16.
 */
class ActivityForeshowModel extends BaseClass {

	public static ins(): ActivityForeshowModel {
		return super.ins() as ActivityForeshowModel;
	}

	public getForeshow(): NewFuncNoticeConfig {
		for (let i in GlobalConfig.NewFuncNoticeConfig) {
			let cfg = GlobalConfig.NewFuncNoticeConfig[i];
			let isIn = this.checkOpenTime(cfg.open, cfg.close);
			if (isIn && Actor.level >= cfg.openLv)return cfg;
		}
		return null;
	}

	private checkOpenTime(openDay: number, closeDay: number): boolean {
		let isIn = (GameServer.serverOpenDay >= openDay && GameServer.serverOpenDay < closeDay);
		return isIn;
	}

	/**
	 * 获取活动开启剩余的秒数
	 * @returns {number}
	 */
	public getRemainTime(): number {
		let remainTime = 0;
		let cfg = this.getForeshow();
		if (cfg) {
			let endDate = new Date(GameServer._serverZeroTime * 1000 + DateUtils.SECOND_2010 * 1000);
			endDate.setDate(endDate.getDate() + cfg.close);
			endDate.setHours(0, 0, 0, 0);
			let endTime = endDate.getTime();
			let currentTime = new Date().getTime();
			remainTime = endTime - currentTime;
			if (remainTime < 0) remainTime = 0;
		}
		remainTime = remainTime / 1000;
		return remainTime;
	}
}
