/**转生BOSS管理类 */
class ZsBoss extends BaseSystem {
    /**BOSS列表*/
    private bossInfoList: BossInfoData[];
    /**已激活的boss 数量 */
    public aliveBossNum: number;
    //活动是否开启
    public acIsOpen: boolean;
    //参加活动的剩余次数
    public remainTime: number;
    //复活剩余的cd时间
    private _reliveTime: number;
    /** 转生boss数据*/
    public constructor() {
        super();

        this.sysId = PackageID.ZsBoss;
        this.regNetMsg(1, this.postBossList);
        this.regNetMsg(2, this.postBossOpen);
        this.regNetMsg(3, this.postRrmainTime);
        this.regNetMsg(4, this.postRankInfo);
        this.regNetMsg(5, this.postLotteryInfo);
        //this.regNetMsg(6, this.postBuyCdResult);
        this.regNetMsg(7, this.postChallengeResult);
        this.regNetMsg(8, this.postHudunPoint);
        this.regNetMsg(9, this.postWinResult);
        this.regNetMsg(11, this.doGetMyPoint);
        this.regNetMsg(12, this.doTalkMaxPoint);
    }

    public static ins(): ZsBoss {
        return super.ins() as ZsBoss;
    }

    /**
    *  1  请求boss 列表
    */
    public sendGetBossList(): void {
        this.sendBaseProto(1);
    }

	/**
	 *  3  请求挑战
	 */
    public sendRequstChallenge(): void {
        this.sendBaseProto(3);
    }

	/**
	 *  4  查看伤害排行榜
	 */
    public sendRequstBossRank(bossId: number): void {
        let bytes: GameByteArray = this.getBytes(4);
        bytes.writeInt(bossId);
        this.sendToServer(bytes);
    }

	/**
	 *  5  参与抽奖
	 */
    public sendJoinChoujiang(): void {
        this.sendBaseProto(5);
    }

	/**
	 *  6  购买cd
	 */
    public sendBuyCd(): void {
        this.sendBaseProto(6);
    }

    //boss 列表
    public postBossList(bytes: GameByteArray): void {
        let len: number = bytes.readShort();
        this.bossInfoList = [];
        for (let i: number = 0; i < len; i++) {
            this.bossInfoList.push(new BossInfoData(bytes))
        }
        this.aliveBossNum = bytes.readShort();
    }

    /**
    * 获取BOSS列表长度
    */
    public getBossListLength(): number {
        let result: number = 0;
        if (this.bossInfoList != null) {
            result = this.bossInfoList.length;
        }

        return result;
    }

    /**
     * 获取BOSS信息（通过索引）
    * @param index
    */
    public getBossInfoByIndex(index: number): BossInfoData {
        let result: BossInfoData = null;
        if (this.bossInfoList != null) {
            if (index >= 0 && index < this.bossInfoList.length) {
                result = this.bossInfoList[index];
            }
        }

        return result;
    }

    //活动是否开启
    public postBossOpen(bytes: GameByteArray): void {
        this.acIsOpen = bytes.readBoolean();
        if (!this.acIsOpen) {
            this.reliveTime = 0;
        } else {
            let userBoss = UserBoss.ins();
            if (UserZs.ins().lv > 0) {
                if (userBoss.worldBossLeftTime[UserBoss.BOSS_SUBTYPE_WORLDBOSS]) {
                    userBoss.postBossData(true, this.canPlayBossName());
                }
            }
        }
    }

    //boss 剩余参加次数
    public postRrmainTime(bytes: GameByteArray): void {
        this.remainTime = bytes.readShort();
        this.reliveTime = bytes.readShort();
    }

    //boss 伤害排行
    public postRankInfo(bytes: GameByteArray): void {
        this.parseBossRankList(bytes);
    }

    //抽奖信息
    public postLotteryInfo(bytes: GameByteArray): void {
        this.lotteryItemId = bytes.readInt();
        ViewManager.ins().open(ZSBossLotteryWin);
    }

    public promptList: string[] = ["", "你今天已经参加过1次活动了，请明天再来", "挑战CD中", "转生BOSS已经被击杀", "没有符合条件的boss",
        "活动未开启", "在副本中"]
    /** 处理挑战结果*/
    public postChallengeResult(bytes: GameByteArray): void {
        let index: number = bytes.readByte();
        if (index > 0) {
            UserTips.ins().showTips(ZsBoss.ins().promptList[index]);
        } else if (index == 0) {
            ViewManager.ins().close(BossWin);
        }
    }

    /**护盾剩余百分比 */
    public postHudunPoint(bytes: GameByteArray): void {
        this.hudun = bytes.readInt();
    }

    /**胜利结算 */
    public postWinResult(bytes: GameByteArray): void {
        let infoArr: any[] = [bytes.readString(), bytes.readString(), bytes.readShort()];
        let len: number = bytes.readShort();
        let list: RewardData[] = [];
        let item: RewardData;
        for (let i: number = 0; i < len; i++) {
            item = new RewardData();
            item.parser(bytes);
            list.push(item);
        }
        ViewManager.ins().open(ZsBossResultWin, infoArr, list);
    }

    public set reliveTime(num: number) {
        if (this._reliveTime != num) {
            this._reliveTime = num;
            let tms = TimerManager.ins();
            tms.remove(this.timeClock, this);
            tms.doTimer(1000, this._reliveTime, this.timeClock, this);
        }
    }

    public get reliveTime(): number {
        return this._reliveTime;
    }

    private timeClock(): void {
        this._reliveTime--;
        if (this._reliveTime <= 0) {
            TimerManager.ins().remove(this.timeClock, this);
        }
    }

    public bossRankList: BossRankInfo[];

    public parseBossRankList(bytes: GameByteArray): void {
        this.bossRankList = [];
        let bossId: number = bytes.readInt();
        let len: number = bytes.readShort();
        for (let i: number = 0; i < len; i++) {
            this.bossRankList.push(new BossRankInfo(bytes, i + 1))
        }
    }

    //抽奖信息 抽奖的物品id
    public lotteryItemId: number;
    //购买cd的结果
    public buyCdResult: boolean;
    private barList: string[];

    /** 奖励预览的barList */
    public getBarList(): string[] {
        if (this.barList && this.barList.length > 0) {
            return this.barList;
        }
        if (!this.barList) {
            this.barList = [];
        }
        let config: OtherBoss1Config
        for (let i: number = 1; i < 5; i++) {
            config = GlobalConfig.OtherBoss1Config[i];
            this.barList.push(config.llimit + "-" + config.hlimit + "转");
        }
        return this.barList;
    }

    /**护盾剩余百分比 */
    public hudun: number;

    /**是否在转生boss 副本 */
    public isZsBossFb(fbId: number): boolean {
        let config: OtherBoss1Config
        for (let i: number = 1; i < 5; i++) {
            config = GlobalConfig.OtherBoss1Config[i];
            if (fbId == config.fbid) {
                return true;
            }
        }
        return false;
    }

    //秒cd 钱是否足够
    public checkIsMoreMoney(): boolean {
        return Actor.yb >= GlobalConfig.WorldBossBaseConfig.clearCdCost[UserBoss.ins().currBossSubType - 1];
    }

    public firstShowWin: boolean = false;
    /**是否展示通知面板 */
    public checkIsShowNoticeWin(): boolean {
        // if(this.firstShowWin){
        // 	return false;
        // }
        // //活动是否开启
        // if(this.acIsOpen)
        // {
        // 	let data:BossInfoData;
        // 	for(let i:number = 0; i< this.bossInfoList.length; i++)
        // 	{
        // 		data = this.bossInfoList[i];
        // 		if(data.challengeIn)
        // 		{
        // 			return false;
        // 		}
        // 	}
        // 	let serverTime:number = GameServer.serverTime;
        // 	let date:Date = new Date(serverTime);
        // 	if(date.getHours()>=18)
        // 	{
        // 		return false;
        // 	}
        // 	return true;
        // }
        return false;
    }

    /**获取能够打BOSS的索引 */
    public canPlayBossIndex(): number {
        let zsLv: number = UserZs.ins().lv;
        let config: OtherBoss1Config
        for (let i: number = 4; i >= 1; i--) {
            config = GlobalConfig.OtherBoss1Config[i];
            if (zsLv >= config.llimit && zsLv <= config.hlimit) {
                if (this.aliveBossNum >= i) {
                    return i;
                }
            }
        }
        return 0;
    }


    /**获取能够打BOSS的名字 */
    public canPlayBossName(): string {
        let index: number = this.canPlayBossIndex();
        if (index > 0) {
            let config: OtherBoss1Config = GlobalConfig.OtherBoss1Config[index];
            return GlobalConfig.MonstersConfig[config.bossId].name;
        }
        return "转生boss ";
    }


    private _clearOther: boolean = false;
    public canChange: boolean = true;

    public get clearOther(): boolean {
        return this._clearOther;
    }
    /**清除cd */
    public set clearOther(value: boolean) {
        if (this._clearOther != value) {
            this._clearOther = value;
            this.canChange = false;
            TimerManager.ins().doTimer(1000, 10, this.overDealy, this, this.dealyOver, this);
        }
    }

    private dealyOver(): void {
        TimerManager.ins().remove(this.overDealy, this);
        this.canChange = true;
    }

    private overDealy(): void {

    }

    /**自己的抽奖点数 */
    public doGetMyPoint(bytes: GameByteArray): void {
        this.postLotteryPoint(bytes.readShort());
    }
    public postLotteryPoint(n: number) {
        return n;
    }

    /**抽奖最高点数 */
    public doTalkMaxPoint(bytes: GameByteArray): void {
        this.postLotteryMaxPost(bytes.readString(), bytes.readShort());
    }
    public postLotteryMaxPost(str: string, n: number) {
        return [str, n]
    }
}


class BossInfoData {
    public bossId: number;
    public kill: boolean;
    public challengeIn: boolean;

    public constructor(bytes: GameByteArray) {
        this.bossId = bytes.readInt();
        this.kill = bytes.readBoolean();
        this.challengeIn = bytes.readBoolean();
    }
}

class BossRankInfo {
    public id: number;
    public names: string;
    public shanghai: number;
    public rank: number;

    public constructor(bytes: GameByteArray, ranks: number) {
        this.id = bytes.readInt();
        this.names = bytes.readString();
        this.shanghai = bytes.readDouble();
        this.rank = ranks;
    }
}

namespace GameSystem {
    export let  zsBoss = ZsBoss.ins.bind(ZsBoss);
}