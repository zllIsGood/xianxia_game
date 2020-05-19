/**
 * Created by MPeter on 2018/3/14.
 *  跨服竞技场数据结构体块
 */

/*跨服竞技场巅峰令奖励结构体*/
class KfArenaPeakAwards {
	public id: number;
	public count: number;
	public award: RewardData[];
	public sortIndex: number;

}
/*跨服竞技场每日奖励结构体*/
class KfArenaEveryDayAwards {
	public metal: number;
	public award: RewardData[];
}
/*跨服竞技场赛季段位邮件结构体*/
class KfArenaMailData {
	public head: string;
	public context: string;
	public tAwardList: RewardData[];
}

/*跨服竞技场巅峰令信息结构体*/
class KfArenaPeakInfo {
	/*胜利*/
	public winCount: number;
	/*失败*/
	public loseCount: number;
	/*首杀额外获得*/
	public firstKillCount: number;
	/*首采额外获得*/
	public firstGatherCount: number;
	/*MVP额外获得*/
	public mvpCount: number;

}

/*跨服竞技场排行奖励结构体*/
class KfArenaRankAwardInfo {
	public rankIdx: string;
	public mail: KfArenaMailData;
}

/*出生点*/
class KfArenaReadyPos {
	/*出生点*/
	public bornPoint: XY;
	/*传送点*/
	public tranferPoint: XY;
}

