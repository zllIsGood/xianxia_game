/**
 * 通天塔抽奖界面
 * Created by Peach.T on 2017/10/20.
 */
class BabelLotteryWin extends BaseEuiView {
    public bgClose: eui.Rect;
    public item0: BabelLotteryItem;
    public item1: BabelLotteryItem;
    public item2: BabelLotteryItem;
    public item3: BabelLotteryItem;
    public item4: BabelLotteryItem;
    public item5: BabelLotteryItem;
    public item6: BabelLotteryItem;
    public item7: BabelLotteryItem;
    public item8: BabelLotteryItem;
    public item9: BabelLotteryItem;
    public num: eui.Label;
    public tttzhi: eui.Image;
    public choujiangBtn: eui.Button;
    public closeBtn: eui.Button;

    private rolling: boolean;

    constructor() {
        super();
        this.isTopLevel = true;
        this.skinName = "tttZhuanpan";
    }

    public open(...param: any[]): void {
        this.addCustomEvent();
        this.updateView();
    }

    private addCustomEvent(): void {
        this.addTouchEvent(this.choujiangBtn, this.getLottery);
        this.addTouchEvent(this.closeBtn, this.close);
        this.observe(UserFb2.ins().postLotteryReward, this.onGetRewards);
        this.observe(UserFb2.ins().postUpDataInfo, this.refreshView);
    }

    private getLottery(): void {
        if (SkyLevelModel.ins().lotteryRemainTimes == 0) {
            UserTips.ins().showTips("没有抽奖次数，每通关10层可抽取1次");
        }
        else if (this.rolling) {
            UserTips.ins().showTips("正在抽奖，请稍候");
        }
        else {
            UserFb2.ins().sendBeginLottery();
        }
    }

    private onGetRewards(): void {
        this.beginLottery(SkyLevelModel.ins().lotteryAwardIndex);
    }

    private refreshView(): void {
        if (SkyLevelModel.ins().lotteryUseTimes % 10 == 0) {//抽完10次的整数倍，要停留2S再刷新奖励
            egret.setTimeout(() => {
                this.updateView();
            },this, 2000);
        }
        else {
            this.updateView();
        }
    }

    private beginLottery(index: number): void {
        let rotat: number = 360 * 4 + (index - 1) * 36;
        let tween: egret.Tween = egret.Tween.get(this.tttzhi);
        this.rolling = true;
        tween.to({"rotation": rotat}, 4000, egret.Ease.circOut).call(() => {
            UserFb2.ins().sendGetReward();
            this.flyItem(this["item" + (index - 1)] as BabelLotteryItem);
            egret.setTimeout(() => {
                this.rolling = false;
                this.refreshView();
            },this, 2000);
        }, this);
    }

    private flyItem(item: BabelLotteryItem): void {
        var itemBase: ItemBase = new ItemBase();
        itemBase.x = item.x;
        itemBase.y = item.y;
        itemBase.data = item.itemIcon.data;
        itemBase.anchorOffsetX = itemBase.width / 2;
        itemBase.anchorOffsetY = itemBase.height / 2;
        item.parent.addChild(itemBase);
        GameLogic.ins().postFlyItemEx(itemBase);
    }

    private updateView(): void {
        this.num.text = SkyLevelModel.ins().lotteryRemainTimes.toString();
        let index = SkyLevelModel.ins().lotteryUseTimes;
        let m = parseInt((index / 10).toString()) * 10 + 10;
        let cfg: FbChallengeLotteryConfig = GlobalConfig.FbChallengeLotteryConfig[m];
        let count: number = cfg.group.length;
        for (let i: number = 0; i < count; i++) {
            let item: BabelLotteryItem = this["item" + i] as BabelLotteryItem;
            item.itemIcon.data = cfg.group[i];
            let isGet: boolean = SkyLevelModel.ins().isGetLotteryAward(i + 1);
            item.rewardState(isGet);
        }
    }
}

ViewManager.ins().reg(BabelLotteryWin, LayerManager.UI_Main);