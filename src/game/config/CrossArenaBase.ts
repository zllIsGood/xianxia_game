/**
 * Created by MPeter on 2018/3/14.
 *  跨服3v3竞技场基础配置
 */
interface CrossArenaBase {
	/*开启天数*/
	openDay: number;
	/*开启等级*/
	openLevel: number;
	/*活动时间(s)*/
	lastTime: number;
	/*采旗需要时间(s)*/
	needGatherTime: number;
	/*旗帜刷新时间(s)*/
	flagRefreshTime: number;
	/*采棋积分*/
	gatherScore: number;
	/*击杀玩家积分*/
	killScore: number;
	/*初始积分*/
	instScore: number;
	/*胜利达标积分*/
	winScore: number;
	/*达到多少分就不扣分*/
	lowestScore: number;
	/*每日参与次数*/
	joinCount: number;
	/*累计最大参与次数*/
	maxJoinCount: number;
	/*巅峰令获得信息*/
	peakCountInfo: KfArenaPeakInfo;
	/*死亡前多少秒内算助攻(s)*/
	assistsTime: number;
	/*复活cd(s)*/
	rebornCd: number;
	/*积分对应的段位*/
	scoreMetal: number[];
	/*巅峰令达标奖励*/
	peakAwards: KfArenaPeakAwards[];
	/*每日段位奖励*/
	everyDayAward: KfArenaEveryDayAwards[];
	/*转生等级要求*/
	zhuanshengLevel: number;
	/*积分相差x分以内的 可以组队*/
	teamScoreRange: number;
	/*旗帜id*/
	flagBossId: number;
	/*排行奖励信息组*/
	rankAward: KfArenaRankAwardInfo[];
	/*出生点数据*/
	readyPos: KfArenaReadyPos[];
	/** 未开启活动的提示语*/
	hintTxt: string;
	/** 等级对应的段位名*/
	scoreMetalName: string[];
	/*达标提示评分*/
	tipScore: number;
	/**段位說明*/
	degreeTpis: string;
}
