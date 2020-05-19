/**
 * Created by hrz on 2017/12/5.
 */

class GwBossChallengeView extends BaseEuiView {
    private bgClose:eui.Rect;
    private zwHunt:eui.Group;
    private yuanbao:eui.Label;
    private num:eui.Label;
    private title:eui.Label;
    private leftCDText:eui.Label;
    private notBtn:eui.Button;
    private challengeBtn:eui.Button;
    // private redPoint:eui.Image;
    private reward:eui.List;
    private ticket:eui.Image;

    private _bossData:WorldBossItemData;

    constructor(){
        super();
        this.skinName = `GwBossChallengeSkin`;
    }

    protected childrenCreated(){
        this.init();
    }

	public init() {
        this.reward.itemRenderer = ItemBase;

	}

    open(...param) {
        this.addTouchEvent(this.notBtn,this.onTap);
        this.addTouchEvent(this.bgClose,this.onTap);
        this.addTouchEvent(this.challengeBtn,this.onTap);

        this._bossData = param[0];

        this.initView();
    }

    private initView() {
        let data = this._bossData;
        let config = GlobalConfig.WorldBossConfig[data.id];
        this.title.text = config.showName;
        this.reward.dataProvider = new eui.ArrayCollection(config.showReward);

        let needYb = GlobalConfig.WorldBossBaseConfig.challengeItemYb[config.type-1];
        this.yuanbao.text = `${needYb}`;

        let itemId = GlobalConfig.WorldBossBaseConfig.challengeItem[config.type-1];
        this.ticket.source = `${itemId}_png`;
        let item = UserBag.ins().getItemByTypeAndId(0, itemId);
        let count = 0;
        if (item)
            count = item.count;
        this.num.text = `${count}`;
        if(count)
            this.num.textColor = ColorUtil.GREEN_COLOR_N;
        else
            this.num.textColor = ColorUtil.RED_COLOR_N;

        // if (data.canChallenge && (count || Actor.yb >= needYb)) {
        //     this.redPoint.visible = true;
        // } else {
        //     this.redPoint.visible = false;
        // }

        let endTime = Math.ceil((UserBoss.ins().worldBossCd[config.type] - egret.getTimer()) / 1000);
        if(endTime > 0) {
            this.leftCDText.visible = true;
            this.updateCDTime(endTime);
        } else {
            this.leftCDText.visible = false;
        }
    }

    private _cdTime:number = 0;
    private updateCDTime( cd ) {
        this._cdTime = cd;
        TimerManager.ins().remove(this.updateBtnLabel, this);
        if(cd > 0)
            TimerManager.ins().doTimer(1000, cd, this.updateBtnLabel, this);
        this.updateBtnLabel();
    }
    private updateBtnLabel() {
        this.leftCDText.text = `挑战CD：${this._cdTime}秒`;
        this._cdTime -= 1;
        if (this._cdTime <= 0)
            this.leftCDText.text = ``;
    }

    private onTap(e:egret.TouchEvent) {
        let tar = e.currentTarget;
        if (tar == this.notBtn || tar == this.bgClose) {
            ViewManager.ins().close(this);
        } else if (tar == this.challengeBtn) {
            this.onChallenge();
        }
    }

    private onChallenge(){
        if (UserFb.ins().checkInFB()) return false;
        let config = GlobalConfig.WorldBossConfig[this._bossData.id];
        if (this._bossData.canInto) {
            if(this._bossData.isDie) {
                UserTips.ins().showTips(`BOSS未复活`);
            }
            else if (UserBag.ins().getSurplusCount() < UserBag.BAG_ENOUGH) {
                ViewManager.ins().open(BagFullTipsWin, UserBag.BAG_ENOUGH);
            } else {
                let endTime = Math.ceil((UserBoss.ins().worldBossCd[config.type] - egret.getTimer()) / 1000);
                if (endTime > 0) {
                    UserTips.ins().showTips(`|C:0xf3311e&T:冷却中，${endTime}秒后可进行挑战|`);
                    return false;
                }

                let needYb = GlobalConfig.WorldBossBaseConfig.challengeItemYb[config.type-1];
                let itemId = GlobalConfig.WorldBossBaseConfig.challengeItem[config.type-1];
                let item = UserBag.ins().getItemByTypeAndId(0, itemId);
                if ((!item || !item.count) && Actor.yb < needYb) {
                    UserTips.ins().showTips(`元宝不足`);
                    ViewManager.ins().close(this);
                    return false;
                }

                UserBoss.ins().sendChallengWorldBoss(this._bossData.id, config.type);
                ViewManager.ins().close(this);
                return true;
            }
        }
        else {
            UserTips.ins().showTips("|C:0xf3311e&T:等级不足，无法挑战|");
        }
        return false;
    }

    close() {

    }
}

ViewManager.ins().reg(GwBossChallengeView, LayerManager.UI_Popup);