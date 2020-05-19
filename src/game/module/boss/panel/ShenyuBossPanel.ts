/**
 * Created by hrz on 2017/10/16.
 */

/**
 * name
 */
class ShenyuBossPanel extends BaseView {
    private list: eui.List;
    /** 挑战次数 */
    private challengeCountTxt: eui.Label;
    /** 恢复次数剩余时间 */
    private timeTxt: eui.Label;
    /** boss提醒设置 */
    private setting: eui.Label;

    /** 提升按钮 */
        // private ascensionBtn: eui.Button;

    private listData: eui.ArrayCollection;

    /** 是否开始计时，防止重复注册计时器 */
    private isStartTime: boolean = false;

    private type: number = 0;

    // private vipGroup: eui.Group;
    // private tipTxt: eui.Label;
    public buyBtn: eui.Button;
    private bossScroller: eui.Scroller;
    private showBossId: number;
    private juan:eui.Group;
    private jcount:eui.Label;
    private jicon:eui.Image;
    constructor() {
        super();
        // this.skinName = `ShenYuBossSkin`;
    }

    public childrenCreated(): void {
        this.init();
    }

    public init(): void {

        this.list.itemRenderer = BossItem;

        this.setting.textFlow = (new egret.HtmlTextParser).parser(`<a href="event:"><u>${this.setting.text}</u></a>`);
        this.setting.touchEnabled = true;

        this.listData = new eui.ArrayCollection();
        this.list.dataProvider = this.listData;

        // this.vipGroup.touchEnabled = false;
        // this.tipTxt.touchEnabled = false;
        // this.tipTxt.textFlow = TextFlowMaker.generateTextFlow(`挑战次数不足，首充开启神域BOSS，|C:0xf3311e&T:BOSS不限次数无限刷!|`);
    }

    public open(...param: any[]): void {
        this.type = UserBoss.BOSS_SUBTYPE_SHENYU;
        this.observe(UserBoss.ins().postWorldBoss, this.setData);
        this.observe(UserBoss.ins().postWorldBoss, this.calljoinPulbicChallenge);
        this.observe(UserBag.ins().postItemCountChange,this.UseToItem);
        this.setting.addEventListener(egret.TextEvent.LINK, this.onLink, this);
        this.addTouchEvent(this.buyBtn, this.onTap);
        this.addTouchEvent(this, this.onTap);
        this.setData();
        this.showBossId = param[0];
    }

    public close(): void {
        this.setting.removeEventListener(egret.TextEvent.LINK, this.onLink, this);
        this.removeObserve();

        TimerManager.ins().remove(this.updateTime, this);
        this.isStartTime = false;
    }
    /**新提示语*/
    private isUse:boolean;
    private showTips():boolean{
        let count: number = UserBoss.ins().worldBossLeftTime[this.type];
        if( count > 0 ){
            return true;
        }
        UserTips.ins().showTips(`|C:0xff0000&T:挑战次数不足,无法挑战`);
        return false;

        // let tipText = "";
        // let item:ItemData = UserBag.ins().getBagGoodsByTypeAndId(UserBag.BAG_TYPE_OTHTER,ItemConst.PUBLICBOSS);
        // if( item ){
        //     tipText = `确定使用1个<font color='#FFB82A'>野外boss</font>道具进入挑战？\n`;
        //
        //     WarnWin.show(tipText, function () {
        //         this.isUse = true;
        //         UserBag.ins().sendUseItem(item.configID,1);
        //     }, this);
        // }else{
        //     let vipConfig: VipConfig = GlobalConfig.VipConfig[UserVip.ins().lv];
        //     if (!vipConfig) {
        //         UserTips.ins().showTips(`|C:0xf3311e&T:成为VIP可购买挑战次数|`);
        //         return false;
        //     }
        //     if (!vipConfig.boss2buy) {
        //         UserTips.ins().showTips(`|C:0xf3311e&T:VIP等级不足，提升VIP等级可购买挑战次数|`);
        //         return false;
        //     }
        //     let currentUse: number = UserBoss.ins().worldChallengeTime[this.type];
        //
        //     //购买次数
        //     if ( count <= 0 && currentUse >= vipConfig.boss2buy) {
        //         UserTips.ins().showTips(`|C:0xff0000&T:挑战次数不足,无法挑战`);
        //         return;
        //     }
        //
        //     if (Actor.yb < GlobalConfig.WorldBossBaseConfig.buyCountPrice[this.type - 1]) {
        //         UserTips.ins().showTips(`|C:0xf3311e&T:元宝不足|`);
        //         return false;
        //     }
        //     tipText = `确定花费<font color='#FFB82A'>${GlobalConfig.WorldBossBaseConfig.buyCountPrice[this.type - 1]}元宝</font>购买1次挑战次数吗？\n` +
        //         `今日已购买：${currentUse}/${vipConfig.boss2buy}`
        //
        //     WarnWin.show(tipText, function () {
        //         UserBoss.ins().sendBuyChallengeTimes(this.type);
        //     }, this);
        // }
        //
        // return false;
    }
    //使用道具返回
    private UseToItem(){
        if( this.isUse ){
            this.isUse = false;
            UserBoss.ins().sendWorldBossInfo(this.type);
        }
    }
    private isJoin:boolean;
    private config:any;
    private eId:number;
    private onTap(e: egret.TouchEvent): void {
        switch (e.currentTarget) {
            case this.buyBtn:
                if( !this.showTips() ) return;
                break;
            default:
                if (e.target instanceof eui.Button) {
                    let config = e.target.parent['config'];
                    switch (e.target.name) {
                        //全民boss挑战
                        case "shenyuChallenge":
                            this.isJoin = true;
                            this.config = config;
                            this.eId = (<BossItem>e.target.parent).data.id;
                            if( !this.showTips() ) return;
                            if( !this.joinPulbicChallenge(config) )
                                return;
                            break;
                    }
                    ViewManager.ins().close(LimitTaskView);
                }
                break;
        }
    }
    private calljoinPulbicChallenge(){
        if( !this.joinPulbicChallenge(this.config) )
            return;
        ViewManager.ins().close(LimitTaskView);
    }
    private joinPulbicChallenge(config:any):boolean{
        if( !config )return false;

        if( !this.isJoin )return false;
        this.isJoin = false;
        if (UserFb.ins().checkInFB()) return false;
        if (UserBoss.ins().worldBossLeftTime[this.type] <= 0) {
            UserTips.ins().showTips("挑战次数不足");
        }
        else if (config.zsLevel <= UserZs.ins().lv && config.level <= Actor.level) {
            // UserBoss.ins().sendChallenge((<BossItem>e.target.parent).data.id);
            if (UserBag.ins().getSurplusCount() < UserBag.BAG_ENOUGH) {
                ViewManager.ins().open(BagFullTipsWin, UserBag.BAG_ENOUGH);
            } else {
                let endTime = Math.ceil((UserBoss.ins().worldBossCd[this.type] - egret.getTimer()) / 1000);
                if (endTime > 0) {
                    UserTips.ins().showTips(`|C:0xf3311e&T:冷却中，${endTime}秒后可进行挑战|`);
                    return false;
                }
                // UserBoss.ins().sendChallengWorldBoss((<BossItem>e.target.parent).data.id, UserBoss.BOSS_SUBTYPE_QMBOSS);
                UserBoss.ins().sendChallengWorldBoss(this.eId, this.type);
                // ViewManager.ins().close(this);
            }
        }
        else {
            UserTips.ins().showTips("|C:0xf3311e&T:等级不足，无法挑战|");
        }
        return true;
    }

    /** 更新恢复次数剩余时间计时 */
    private updateTime(): void {
        if (this.timeTxt == undefined) return;
        let time: number = this.restoreTime - egret.getTimer();
        if (time <= 0) {
            //移除计时器
            TimerManager.ins().remove(this.updateTime, this);
            this.isStartTime = false;
            //挑战次数满了隐藏计时文本，否则请求计时数据
            if (UserBoss.ins().worldBossLeftTime[this.type] >= GlobalConfig.WorldBossBaseConfig.dayCount[this.type - 1])
                this.timeTxt.visible = false;
            else {
                UserBoss.ins().sendWorldBossInfo(this.type);
            }
        } else {
            if (!this.timeTxt.visible) this.timeTxt.visible = true;
        }
        // let timeStr: string = DateUtils.getFormatTimeByStyle(Math.floor(time / 1000), DateUtils.STYLE_4);
        let timeStr: string = DateUtils.getFormatBySecond(Math.floor(time / 1000), DateUtils.TIME_FORMAT_12)
        this.timeTxt.text = `（${timeStr}恢复）`;
    }
    private showJuan(itemData:ItemData){
        if( !itemData ){
            this.juan.visible = false;
            return;
        }
        this.juan.visible = true;
        this.jicon.source = itemData.itemConfig.icon + "_png";
        this.jcount.text = itemData.count + "";
    }

    setData() {
        let leftTime: number = UserBoss.ins().worldBossLeftTime[this.type];
        this.buyBtn.visible = false;
        let itemData: ItemData = UserBag.ins().getBagItemById(ItemConst.SHENYUBOSS);
        this.showJuan(itemData);
        this.challengeCountTxt.text = leftTime + "/" + GlobalConfig.WorldBossBaseConfig.dayCount[this.type - 1];

        let tempArr: WorldBossItemData[] = UserBoss.ins().worldInfoList[this.type].slice();
        let bossInfos: WorldBossItemData[] = [];

        let remindArr: WorldBossItemData[] = [];
        let remindDieArr: WorldBossItemData[] = [];
        let noRemindArr: WorldBossItemData[] = [];
        let noRemindDieArr: WorldBossItemData[] = [];

        let canNotPlayArr: WorldBossItemData[] = [];

        let roleLv: number = UserZs.ins().lv * 1000 + Actor.level;
        // this.buyBtn.visible = leftTime >= GlobalConfig.WorldBossBaseConfig.dayCount[this.type - 1];
        for (let i: number = 0; i < tempArr.length; i++) {
            let isDie: boolean = (tempArr[i].relieveTime - egret.getTimer()) / 1000 > 0 || tempArr[i].hp <= 0;
            let boo: boolean = UserBoss.ins().getBossRemindByIndex(tempArr[i].id,1);

            let bossConfig: WorldBossConfig = GlobalConfig.WorldBossConfig[tempArr[i].id];
            let bossLv: number = bossConfig.zsLevel * 1000 + bossConfig.level;
            if (roleLv >= bossLv) {
                if (boo) {
                    if (isDie) {
                        remindDieArr.push(tempArr[i]);
                    } else {
                        remindArr.push(tempArr[i]);
                    }
                } else {
                    if (isDie) {
                        noRemindDieArr.push(tempArr[i]);
                    } else {
                        noRemindArr.push(tempArr[i]);
                    }
                }
            } else {
                canNotPlayArr.push(tempArr[i]);
            }
        }
        remindArr.sort(this.compareFn);
        remindDieArr.sort(this.compareFn);
        noRemindArr.sort(this.compareFn);
        noRemindDieArr.sort(this.compareFn);
        canNotPlayArr.sort(this.compareFn);
        bossInfos = remindArr.concat(remindDieArr, noRemindArr, canNotPlayArr, noRemindDieArr);
        this.listData.replaceAll(bossInfos);
        //更新恢复次数剩余时间计时
        if (!this.isStartTime) {
            TimerManager.ins().doTimer(1000, 0, this.updateTime, this);
            this.restoreTime = UserBoss.ins().worldBossrestoreTime[this.type];
            this.isStartTime = true;
            this.updateTime();
        }
        this.refushBarList(bossInfos);
    }

    private restoreTime = 0;

    private compareFn(a: WorldBossItemData, b: WorldBossItemData): number {
        let configA: WorldBossConfig = GlobalConfig.WorldBossConfig[a.id];
        let configB: WorldBossConfig = GlobalConfig.WorldBossConfig[b.id];

        if (configA.zsLevel < configB.zsLevel) {
            return 1;
        } else if (configA.zsLevel > configB.zsLevel) {
            return -1;
        }

        if (configA.level < configB.level)
            return 1;
        else if (configA.level > configB.level)
            return -1;
        else
            return 0;
        // }
    }

    private onTouch(): void {
        GameGuider.guidance(egret.getQualifiedClassName(ForgeWin), 2);
    }

    private onLink(): void {
        ViewManager.ins().open(PubBossRemindWin, this.type);
    }

    private refushBarList(wbitems: WorldBossItemData[]): void {
        if (!this.showBossId) {
            this.bossScroller.viewport.scrollV = 0;//默认顶部
            return;
        }
        for (let i = 0; i < wbitems.length; i++) {
            let wcfg: WorldBossConfig = GlobalConfig.WorldBossConfig[wbitems[i].id];
            if (wcfg && this.showBossId == wcfg.bossId) {
                this.bossScroller.viewport.validateNow();
                this.bossScroller.viewport.scrollV = i * 138;
                if (this.bossScroller.viewport.contentHeight - this.bossScroller.viewport.scrollV < this.bossScroller.viewport.height) {
                    this.bossScroller.viewport.scrollV = this.bossScroller.viewport.contentHeight - this.bossScroller.height;
                }
                break;
            }
        }
    }
}