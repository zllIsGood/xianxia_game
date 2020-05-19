/**
 * 挑战副本
 * @author hepeiye
 *
 */
class FbChallengeConfig {
	public id: number = 0;   //关卡id
	public group: number = 0;
	public layer: number = 0;
	public zsLevelLimit: number = 0;//要求转生等级
	public levelLimit: number = 0;//要求等级
	public fbId: number = 0;   //副本id
	public describe: string = "";//解锁描述
	public showIcon: number = 0;
	public equipPos: number = 0; //开启的符文槽位置
	public clearReward: RewardData[] = []; //通关奖励
	public dayReward: RewardData[] = []; //每日奖励
	public lotteryCount: number = 0;
}
