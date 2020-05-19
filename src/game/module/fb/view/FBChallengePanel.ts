import assert = egret.assert;
class FBChallengePanel extends BaseView {
    public static RunType: number = 3;//指定品质的处理
    public list: eui.List;
    public iconList: eui.List;//随机符文
    public iconList0: eui.List;//符文精华
    public openDesc: eui.Label;
    public itemicon: ItemBase;
    public challengeBtn: eui.Button;
    public challengeBtn0: eui.Button;
    public limit: eui.Label;
    public rollbar: eui.Scroller;
    public nameLabel: eui.Label;
    public endImg: eui.Image;
    public redPoint0: eui.Image;
    public nowrawed: eui.Label;//通关X层
    public dailyGift: eui.Label;//每日奖励宝箱下面的提示
    public runeLock: eui.Group;//解锁新类型
    public noOpenTF: eui.Label;//解锁新类型描述
    public randomRune: ItemBase;
    public jinghuaRune: ItemBase;
    public unlock: eui.Label;
    public topGroup: eui.Group;
    public buttomGroup: eui.Group;
    public expText: eui.Label;
    private jump: eui.Label;
    public choujiang: eui.Button;
    public redPoint1: eui.Image;
    public dailyGift0:eui.Label;

    constructor() {
        super();
        this.name = "通天塔";
        // this.skinName = "chuangtianguan";
    }

    protected childrenCreated() {
        this.init();
    }

    public init(): void {
        this.list.itemRenderer = SkyItemRenderer;
        this.iconList.itemRenderer = ItemBase;
        this.iconList0.itemRenderer = ItemBase;
        // this.iconList.visible = true;
        // this.iconList0.visible = false;
        // this.randomRune.visible = false;
        // this.jinghuaRune.visible = true;
    }

    public open(...param: any[]): void {
        this.addTouchEvent(this.challengeBtn, this.challenge);
        this.addTouchEvent(this.challengeBtn0, this.getDayRewward);
        this.addTouchEvent(this.jump, this.onClick);
        this.addTouchEvent(this.choujiang, this.lotto);
        this.refushPanelInfo();

        this.observe(FbRedPoint.ins().postTabs, this.updateRedPoint);

        this.observe(UserFb2.ins().postGetReward, this.updateReward);
        this.observe(Rank.ins().postRankingData, this.initRanking);
        this.observe(UserFb2.ins().postUpDataInfo, this.updateRedPointStyle);//原来接口，当要显示红点状态不变不会派发事件，所以单独加一个更新红点显示的接口
        Rank.ins().sendGetRankingData(RankDataType.TYPE_COPY);
        this.updateRedPoint(2);
        // this.nowrawed.visible = false;
        this.showRewwardLabel();
    }

    private updateRedPointStyle(): void {
        this.redPoint0.visible = SkyLevelModel.ins().cruLevel > 1 && SkyLevelModel.ins().dayReward == 1;
        this.redPoint1.visible = SkyLevelModel.ins().lotteryRemainTimes > 0;
        this.updateTowerState();
    }

    private lotto(e: egret.TouchEvent): void {
        if (SkyLevelModel.ins().cruLevel == 0 && SkyLevelModel.ins().rewardTimes == 0) {
            UserTips.ins().showTips("已全部通关");
        }
        else {
            ViewManager.ins().open(BabelLotteryWin);
        }
    }

    public destructor(): void {
        this.removeObserve();
        this.removeTouchEvent(this.challengeBtn, this.challenge);
        this.removeTouchEvent(this.challengeBtn0, this.getDayRewward);
        this.removeTouchEvent(this.jump, this.onClick);
    }

    /**获取每日奖励后刷新对应文字 */
    private updateReward() {
        this.showRewwardLabel();
    }

    /**请求通天塔排行榜信息*/
    private rankModel: RankModel;

    public initRanking(model: RankModel) {
        this.rankModel = model;
        let rankDataList: any[] = model.getDataList();
        for (let i = 1; i <= 3; i++) {
            let rankdata = rankDataList[i - 1];
            if (rankdata) {
                this[`name` + (i - 1)].text = rankdata.player;
                let info: FbChallengeConfig = GlobalConfig.FbChallengeConfig[rankdata.count];
                if(!Assert(info, `排行榜数据，爬塔异常：id(${rankdata.count})`)) {
                    this[`num` + (i - 1)].text = `${info.group}重${info.layer}层`;
                } else {
                    this[`num` + (i - 1)].text = ``;
                }
                // let nameCfg: FbChNameConfig = GlobalConfig.FbChNameConfig[info.group];
            } else {
                this[`rankImg` + (i - 1)].visible = this[`name` + (i - 1)].visible = this[`num` + (i - 1)].visible = false;
            }
        }
        let tet = this.jump.text;
        this.jump.textFlow = TextFlowMaker.generateTextFlow1(`|U:&T:${tet}`);
    }

    public refushPanelInfo(): void {

        let dataList: FbChallengeConfig[] = SkyLevelModel.ins().getSkyLevelList();
        this.list.dataProvider = new eui.ArrayCollection(dataList);

        let nameCfg: FbChNameConfig = GlobalConfig.FbChNameConfig[SkyLevelModel.ins().stageLevel];
        this.nameLabel.text = nameCfg ? nameCfg.name : "";

        let model: SkyLevelModel = SkyLevelModel.ins();
        //开启下个槽位的描述
        let nextCfg: FbChallengeConfig = model.getNextOpenLevel();
        if (nextCfg) {
            let nextName: FbChNameConfig = GlobalConfig.FbChNameConfig[nextCfg.group];
            let str = `通关${nextName.name}${nextCfg.layer}层`;//${nextCfg.layer}层
            let des = "";
            //解锁符文类型
            if (nextCfg.equipPos) {
                // this.itemicon.visible = false;
                des = `第${nextCfg.equipPos}个符文槽`;
                this.noOpenTF.text = des;
                this.unlock.text = "开启新符文槽";
                this.itemicon.runeName = des;
                this.itemicon.desc2 = `${nextName.name}${nextCfg.layer}层`;
                this.itemicon.data = nextCfg.showIcon;
            }
            //开启新符文槽
            else {
                this.itemicon.desc = `通关${nextName.name}${nextCfg.layer}层解锁`;//用于显示tips通关描述
                this.itemicon.data = nextCfg.showIcon;
                let cfg: ItemConfig = GlobalConfig.ItemConfig[nextCfg.showIcon];
                let runeType: number = ItemConfig.getQuality(cfg);
                let endstr = "解锁新类型"
                if (runeType == FBChallengePanel.RunType)
                    endstr = `获得`;
                this.unlock.text = endstr;
            }
            this.openDesc.text = str;
            //this.runeLock.visible = !this.itemicon.visible;
        }
        else {
            this.topGroup.visible = false;
            // this.buttomGroup.verticalCenter = 0;
        }

        // 当前关卡需要的等级描述 和  奖励显示
        let info: FbChallengeConfig = GlobalConfig.FbChallengeConfig[model.cruLevel];
        if (info) {
            this.nowrawed.text = `通关第${info.layer}层奖励`;
            let zsstr: string = "";
            let zslevel: number = info.zsLevelLimit;
            if (zslevel)
                zsstr = zslevel ? zslevel.toString() + "转" : "";
            this.limit.text = `${zsstr}${info.levelLimit}级可继续挑战`;
            this.iconList.dataProvider = new eui.ArrayCollection([info.clearReward[0]]);
            this.iconList0.dataProvider = new eui.ArrayCollection([info.clearReward[1]]);
            this.expText.text = info.clearReward[2] ? `${info.clearReward[2].count}` : ``;
            let flag: boolean = Actor.level >= info.levelLimit && UserZs.ins().lv >= info.zsLevelLimit;
            this.limit.visible = !flag;
            this.challengeBtn.visible = flag;

            this.endImg.visible = info.layer <= 4;
        }
    }

    private updateRedPoint(tab: number): void {
        if (tab == 2) {
            this.redPoint0.visible = SkyLevelModel.ins().cruLevel > 1 && SkyLevelModel.ins().dayReward == 1;
            this.redPoint1.visible = SkyLevelModel.ins().lotteryRemainTimes > 0;
            this.updateTowerState();
        }
    }

    private updateTowerState(): void {
        let isShow = true;
        if(SkyLevelModel.ins().cruLevel != 0 && (SkyLevelModel.ins().cruLevel - 1) < GlobalConfig.FbChallengeBaseConfig.LotteryOpenLevel)
        {
            isShow = false;
        }
        this.dailyGift0.visible = isShow;
        this.choujiang.visible = isShow;
    }

    private challenge(): void {
        if (UserFb.ins().checkInFB()) return;
        if (SkyLevelModel.ins().lastPass) {
            UserTips.ins().showTips("当前已全部通关");
            return;
        }
        UserFb2.ins().sendChallenge();
        ViewManager.ins().closeTopLevel();
        // ViewManager.ins().close(FbWin);
        // ViewManager.ins().close(LimitTaskView);
    }

    private getDayRewward(): void {
        if (SkyLevelModel.ins().cruLevel <= 1) {
            UserTips.ins().showTips("通关一层后，明日0点可领取每日奖励，通关层数越高，奖励越好");
            return;
        }
        if (SkyLevelModel.ins().dayReward < 1) {
            UserTips.ins().showTips("今天没有奖励可以领取");
            return;
        } else if (SkyLevelModel.ins().dayReward == 2) {
            UserTips.ins().showTips("明日0点可领取每日奖励，通关层数越高，奖励越好");
            return;
        }
        ViewManager.ins().open(ChallengeDayRewardWin);
    }

    private onClick(e: egret.TouchEvent) {
        switch (e.currentTarget) {
            case this.jump:
                if (this.rankModel)
                    ViewManager.ins().open(FBChallengeRankWin, this.rankModel);
                break;
        }
    }

    /**每日奖励领取文字提示 */
    private showRewwardLabel() {
        let tips = "";
        if (SkyLevelModel.ins().dayReward == 1) {
            tips = "可领取";
        } else {
            tips = "明日0点可领取";
        }
        this.dailyGift.text = tips;
    }

}
