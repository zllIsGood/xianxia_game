/**
 * 合服boss副本模块控制中心
 * @author wangzhong
 */
class HefuBossCC extends BaseSystem {

    /** 是否合服boss副本内 */
    isInHefuBoss: boolean;

    /**副本内的bossID 0表示没有boss */
    hefuBossId: number = 0;
    hefuBossHandle: number = 0;
    /**2和平模式 1全体模式 */
    private attStatue: number = 2;

    /** BOSS 击杀次数信息 */
    public bossKillNumData: { [id: number]: [number, number, number] } = {};

    public enterCD: number;

    /**护盾剩余百分比 */
    public hudun: number;

    public huDunMax: number;

    /**是否点击挑战按钮，进场景清除状态 */
    public isChallenge: boolean;

    constructor() {
        super();

        this.sysId = PackageID.HefuBoss;
        this.enterCD = 0;

        this.observe(GameLogic.ins().postEnterMap, () => {
            if (GameMap.fbType == UserFb.FB_TYPE_HEFUBOSS)
                this.postEnterHefuBoss();
            if (this.isInHefuBoss && GameMap.fbType != UserFb.FB_TYPE_HEFUBOSS)
                this.postEscHefuBoss();
        });

        this.regNetMsg(1, this.postHefuBossBelong);
        this.regNetMsg(2, UserBoss.ins().doBossChallengeResult);
        this.regNetMsg(3, this.postBossInfo);
        this.regNetMsg(4, this.postHefuBossId);
        this.regNetMsg(5, this.postRemainTime);
        this.regNetMsg(6, this.postHudunPoint);
        this.regNetMsg(7, this.postEnterCD);
    }

    public getBossList(): eui.ArrayCollection {
        let ary: eui.ArrayCollection;
        let ids: Array<number> = new Array<number>();
        for (let i in GlobalConfig.HefuBossConfig) {
            let cfg: HefuBossConfig = GlobalConfig.HefuBossConfig[i];
            if (ids.indexOf(cfg.bossId) == -1 && cfg.killBossId > 999) {//过滤掉合服boss
                ids.push(cfg.bossId);
            }
        }
        ary = new eui.ArrayCollection(ids);
        return ary;
    }

    public getHefuBossConfig(bossId: number): HefuBossConfig {
        let cfg: HefuBossConfig;
        for (let i in GlobalConfig.HefuBossConfig) {
            if (GlobalConfig.HefuBossConfig[i].bossId == bossId && GlobalConfig.HefuBossConfig[i].killBossId > 999) {
                cfg = GlobalConfig.HefuBossConfig[i];
                break;
            }
        }
        return cfg;
    }

    /** 根据BOSSID 获取KILLBOSS击杀次数 */
    public getKillBossNum(bossId: number): number {
        let hefuBoss: HefuBossConfig = HefuBossCC.ins().getHefuBossConfig(bossId);
        let killBossId: number = hefuBoss.killBossId;
        let killNum: number = 0;
        if (HefuBossCC.ins().bossKillNumData[killBossId] != undefined) {
            killNum = HefuBossCC.ins().bossKillNumData[killBossId][0];
        }
        let needKillNum: number = this.getNeedKillBossNum(bossId);
        if (bossId == this.hefuBossId || killNum > needKillNum) {
            killNum = needKillNum;
        }
        return killNum;
    }

    /** 根据BOSSID 获取KILLBOSS击杀次数 */
    public getNeedKillBossNum(bossId: number): number {
        let hefuBoss: HefuBossConfig = HefuBossCC.ins().getHefuBossConfig(bossId);
        let killBossId: number = hefuBoss.killBossId;
        let appearNum: number = 0;
        if (HefuBossCC.ins().bossKillNumData[killBossId] != undefined) {
            appearNum = HefuBossCC.ins().bossKillNumData[killBossId][1];
        }
        if (appearNum >= hefuBoss.killCount.length) {
            appearNum = hefuBoss.killCount.length - 1;
        }
        return hefuBoss.killCount[appearNum];
    }

    public getRefreshTime(bossId: number): String {
        let hefuBoss: HefuBossConfig = HefuBossCC.ins().getHefuBossConfig(bossId);
        let killBossId: number = hefuBoss.killBossId;
        let time: number = 0;
        if (HefuBossCC.ins().bossKillNumData[killBossId] != undefined) {
            time = HefuBossCC.ins().bossKillNumData[killBossId][2];
        }
        let format: string;
        if (time == 0) {
            format = "";
        }
        else {
            time = DateUtils.formatMiniDateTime(time);
            if (DateUtils.checkTime(time, 7) || time == 0) {
                format = "";
            }
            else {
                format = DateUtils.formatFullTime(time);
            }
        }
        return format;
    }

    private postBossInfo(bytes: GameByteArray) {
        let count: number = bytes.readShort();
        for (let i: number = 0; i < count; i++) {
            let id: number = bytes.readInt();
            let num: number = bytes.readInt();
            let appearNum = bytes.readInt();
            let refeshTime = bytes.readInt();
            this.bossKillNumData[id] = [num, appearNum, refeshTime];
        }
    }

    private postHefuBossId(bytes: GameByteArray) {
        UserBoss.ins().monsterID = this.hefuBossId = bytes.readInt();
        UserBoss.ins().bossHandler = this.hefuBossHandle = bytes.readDouble();
        this.changeFunView();

    }

    /**
     * 获取最高进度的boss数据
     * return [bossId, 进度百分比]
     *  */
    public getMaxKillNumBoss(): [number, number] {
        let bossId = 0;
        let tempMax = 0;
        let temp = 0;
        let time = Number.MAX_VALUE;
        let cfg: HefuBossConfig;
        let isFirstZero: boolean = false;
        let zeroBossId = 0;
        for (let i in this.bossKillNumData) {
            if (+i < 999) continue;
            cfg = this.getCfgByKillBossId(parseInt(i));
            let appearNum = cfg.killCount[this.bossKillNumData[i][1]];
            if (appearNum == undefined) {
                appearNum = cfg.killCount[cfg.killCount.length - 1];
            }
            temp = this.bossKillNumData[i][0] / appearNum;

            if (temp >= 1) {
                return [bossId, temp];
            }

            if (!bossId && !isFirstZero && this.bossKillNumData[i][2] == 0) {
                isFirstZero = true;
                zeroBossId = cfg.bossId;
                tempMax = temp;
            }

            if (this.bossKillNumData[i][2] && this.bossKillNumData[i][2] < time) {
                bossId = cfg.bossId;
                time = this.bossKillNumData[i][2];
                tempMax = temp;
            }
        }
        return [bossId || zeroBossId, tempMax];
    }

    /**
     * 获取远古BOSS显示BOSS ID，如果副本有BOSS传入BOSSID,如果副本没有BOSS传入最高进度的boss
     * return [bossId, 进度百分比]
     *  */
    public getShowBossId(): number {
        let bossId: number;
        if (this.hefuBossId > 0) {
            bossId = this.hefuBossId;
        }
        else {
            bossId = this.getMaxKillNumBoss()[0];
        }
        return bossId;
    }

    public getCfgByKillBossId(killBossId: number) {
        for (let i in GlobalConfig.HefuBossConfig) {
            if (GlobalConfig.HefuBossConfig[i].killBossId == killBossId) {
                return GlobalConfig.HefuBossConfig[i];
            }
        }
        return null;
    }

    sendEnter() {
        this.sendBaseProto(1);
    }

    sendStopAI() {
        this.sendBaseProto(2);
    }

    /**复活 */
    sendRevival() {
        this.sendBaseProto(3);
    }

    /**
     * 进入副本
     */
    postEnterHefuBoss() {
        this.isInHefuBoss = true;
        if (this.hefuBossId > 0 && this.isChallenge) {
            this.isChallenge = false;
            TimerManager.ins().doNext(() => {
                let win: BossBelongPanel = ViewManager.ins().getView(BossBelongPanel) as BossBelongPanel;
                win.attrBoss();
            }, this);

        }

        TargetListCC.ins().attackMeHandles.length = 0;
        TargetListCC.ins().canAttackHandles.length = 0;
        this.changeFunView();
        ViewManager.ins().open(HefuBossFunPanel);
    }

    postEscHefuBoss() {

        this.isInHefuBoss = false;
        this.attStatue = 2;

        ViewManager.ins().close(HefuBossFunPanel);

        ViewManager.ins().close(BossBelongPanel);

        ViewManager.ins().close(BossBloodPanel);

        ViewManager.ins().close(TargetPlayerBigBloodPanel);

    }

    postChangeAttStatue(type: number) {
        this.attStatue = type;
        this.changeFunView();
        return type;
    }

    private changeFunView() {
        if (!this.isInHefuBoss) return;
        if (this.attStatue == 2 && this.hefuBossId == 0)
            ViewManager.ins().open(PlayFunView);
        else
            ViewManager.ins().close(PlayFunView);
        if (this.hefuBossId == 0) {
            ViewManager.ins().close(BossBloodPanel);
            ViewManager.ins().close(BossBelongPanel);
        } else {
            ViewManager.ins().open(BossBelongPanel);
            ViewManager.ins().open(BossBloodPanel);
        }
    }

    /**
     * 归属
     * 58-1
     * @param bytes
     */
    private postHefuBossBelong(bytes: GameByteArray): void {
        let oldHandle = bytes.readDouble();
        let handle = bytes.readDouble();
        let oldName: string = "";
        if (oldHandle > 0) {
            let oldChar: CharRole[] = EntityManager.ins().getMasterList(oldHandle);
            if (oldChar && oldChar[0] && oldChar[0].infoModel) {
                oldName = oldChar[0].infoModel.name;
            }
        }
        UserBoss.ins().postBelongChange(handle, oldHandle, oldName);
    }

    /**
     * 玩家复活时间
     * 58-5
     */
    public postRemainTime(bytes: GameByteArray): void {
        UserBoss.ins().reliveTime = bytes.readShort();
        UserBoss.ins().killerHandler = bytes.readDouble();

        if (UserBoss.ins().reliveTime > 0) {
            UserBoss.ins().clearWorldBossList();
            ViewManager.ins().open(WorldBossBeKillWin);
        } else
            ViewManager.ins().close(WorldBossBeKillWin);
    }

    /**护盾 */
    public postHudunPoint(bytes: GameByteArray): void {
        if (!bytes) return;
        this.hudun = bytes.readInt()
        this.huDunMax = bytes.readInt();
        TimerManager.ins().remove(this.hudunPointFun, this);
        if (this.hudun > 0) {
            TimerManager.ins().doTimer(1000, HefuBossCC.ins().hudun, this.hudunPointFun, this);
        }
    }

    private hudunPointFun() {
        HefuBossCC.ins().hudun--;
        this.postHudunPoint(null)
    }


    public postEnterCD(bytes: GameByteArray): void {
        this.enterCD = bytes.readInt();
        TimerManager.ins().remove(this.enterCDFun, this);
        if (this.enterCD > 0) {
            TimerManager.ins().doTimer(1000, this.enterCD, this.enterCDFun, this)
        }
    }

    private enterCDFun() {
        this.enterCD--;
    }

}

namespace GameSystem {
    export let  hefubosscc = HefuBossCC.ins.bind(HefuBossCC);
}