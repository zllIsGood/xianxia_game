/**
 * 活动类型1
 * @author hepeiye
 *
 */
class ActivityType1Config {
    public Id: number;   //活动序号
    public index: number;   //奖励序号
    public level: number;   //等级
    public zslevel: number;   //转生等级
    public wingLv: number;//翅膀
    public zzLv: number;//铸造
    public lhLv: number;//龙印
    public szLv: number;//图鉴
    public tjPower: number;//图鉴总战力
    public equipPower: number;//装备总评分
    public petPower: number;//幻兽战力
    public zlPower: number;//天仙美人战力
    public fsPower: number;//飞剑战力 
    public showType: number;//显示方式
    public total: number;//奖励总分数
    public rewards: RewardData[];   //奖励
    public consumeYuanbao: number;
    /**
     * 火焰戒指达标需要的等级
     */
    public huoyanRingLv: number;

    zhanlingLv: number; //天仙等级

    public ringPower: number; //灵戒战力
    public heartPower:number; //心法战力
}
