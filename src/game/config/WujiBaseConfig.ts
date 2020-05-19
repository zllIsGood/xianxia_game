/**
 * Created by MPeter on 2017/12/14.
 * 跨服-无极战场-基础配置
 */
interface WujiBaseConfig {
	/**副本ID */
	fbId: number;
	/**可叠加次数上限 */
	maxRwTimes: number;
	/**积分增长提高倍数 */
	scoreIncrease: number;
	addScoreInterval: number;
	/**初始奖励次数 */
	openRwTimes: number;
	/**一血奖励，和结果不影响 */
	firstBloodReward: { id: number, type: number, count: number};
	/**单个队伍人数 */
	memberCnt: number;
	/**MVP额外奖励，获胜、平均、失败 */
	mvpReward: {id:number,type:number,count:number}[];
	/**每局奖励，1=获胜，2=平局，3=失败 */
	endReward: {id:number,type:number,count:number}[][];
	addScore: number[];
	deathBuff: { precent: number, type: number};
	/**正式开启时间 {hour={12,21}, minute=0}*/
	startTime: { hour: number[], minute: number};
	/**旗子名字 */
	flagName: string;
	/**提前获胜积分数 */
	winScore: number;
	/**可叠加上限 */
	deathBuffMax: { precent: number, type: number};
	turnTime: number;
	outTime: number;
	birthPointA: {y:number,x:number}[];
	/**触发提前通知公告时间{hour={11,20}, minute=57} */
	heraldTime: { hour: number[], minute: number};
	specialTime: number;
	/**每周几开启 */
	open: number[];
	/**旗子怪物id（从左到右） */
	monId: number[];
	/**每一场活动持续时间 */
	closeTime: number;
	birthPointB: {y:number,x:number}[];
	dayAddRwTimes: number;
	/**死亡后，在基地等待时间 */
	baseWaitTime: number;
	readyTime: number;
	flagPoint: {y:number,x:number}[];
	reInteVal: number;
    
	/**快速聊天语言组 */
	quickChat:string[];

	/**开启条件=开服多久开启 */
	serverDay: number;
	/**开启条件=转生N级可进入 */
	zsLv: number;
}
