/**
 * Created by MPeter on 2018/3/3.
 *
 */
interface DevilBossBase {
	rebornCd: number;
	startTime: number[];
	rebornCost: number;
	/**开启天数限制*/
	openDay: number;
	/**cd时间*/
	cdTime: number;
	/**归属者奖励*/
	belongAwards: { [day: number]: RewardData[] };
	/**归属者拍卖奖励*/
	belongSaleAwards: { [day: number]: RewardData[] };
	/**参与者奖励*/
	partAwards: { [day: number]: RewardData[] };
	/**参与者拍卖奖励*/
	partSaleAwards: { [day: number]: RewardData[] };
	/**合服开启天数限制*/
	hefuTimeLimit: number;
}