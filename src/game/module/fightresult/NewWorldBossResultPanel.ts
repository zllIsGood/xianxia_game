/**
 * Created by hrz on 2017/10/16.
 */

class NewWorldBossResultPanel extends BaseEuiView{
    private myrank:eui.Label;
    private ranktxt:eui.Label;
    private weidao:eui.Label;
    private time:eui.Label;
    private lucky:eui.Group;
    private luckyName:eui.Label;
    private luckyGift:eui.Label;
    private closeBtn:eui.Button;
    private rankList:eui.List;
    private s:number;
    private effGroup: eui.Group;
    private winnerEff: MovieClip;
    constructor() {
        super();
        this.skinName = "wpkResultSkin";
    }
    public initUI(): void {
        super.initUI();
        this.init();
    }

    public init(): void {
        this.winnerEff = new MovieClip;
        this.winnerEff.x = 41;
        this.winnerEff.y = 41;
        this.winnerEff.touchEnabled = false;
    }

    public open(...param: any[]) {
        this.addTouchEvent(this.closeBtn, this.onTap);

        this.initView();
    }
    private initView(){
        if (!this.winnerEff.parent)
            this.effGroup.addChild(this.winnerEff);
        this.winnerEff.playFile(RES_DIR_EFF + "yanhuaeff", 1);


        this.s = 20;

        let data = UserBoss.ins().newWorldBossData;

        this.myrank.text = data.rank ? data.rank+"" : "没上榜";

        this.rankList.itemRenderer = NewWorldBossResultRender;
        this.rankList.itemRendererSkinName = `wpkResultRenderSkin`;

        let rankData = data.rankList.concat();
        rankData.length > 3 ? rankData.length = 3 : null;
        for (let i = 0; i < rankData.length; i++) {
            rankData[i].rank = i+1;
        }
        this.rankList.dataProvider = new eui.ArrayCollection(rankData);

        this.time.text = DateUtils.getFormatBySecond(data.totalTime,DateUtils.TIME_FORMAT_10);

        this.weidao.text = data.lastKillRoleName;
        if (data.randomRoleName && data.randomAwards && data.randomAwards.length) {
            this.lucky.visible = true;
            this.luckyName.text = data.randomRoleName;
            this.luckyGift.text = GlobalConfig.ItemConfig[data.randomAwards[0].id].name;
        } else {
            this.lucky.visible = false;
        }

        this.updateBtn();
        TimerManager.ins().doTimer(1000, this.s, this.updateCloseBtnLabel, this);
        UserFb.ins().isQuite = true;
    }

    private onTap(e:egret.Event) {
        ViewManager.ins().close(this);
        UserFb.ins().sendExitFb();
    }

    private updateCloseBtnLabel(): void {
        this.s > 0 && this.s--;
        if (this.s <= 0) {
            ViewManager.ins().close(this);
            UserFb.ins().sendExitFb();
        }
        this.updateBtn();
    }

    private updateBtn() {
        this.closeBtn.label = `离开(${this.s}s)`;
    }

    public close(...param: any[]) {
        this.removeTouchEvent(this.closeBtn, this.onTap);
        TimerManager.ins().removeAll(this);

    }
}

ViewManager.ins().reg(NewWorldBossResultPanel, LayerManager.UI_Popup);