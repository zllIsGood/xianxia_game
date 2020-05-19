/**
 * Created by hrz on 2017/9/4.
 */

class VipGiftItemView extends BaseView {
    private reward: eui.List;
    private getBtn: eui.Button;
    private already: eui.Label;

    private ggtxt: eui.Image;
    private txt: eui.Image;
    private tu: eui.Image;
    private redPoint: eui.Image;

    public curId: number;
    private mc: MovieClip;

    constructor() {
        super();
        this.skinName = `VipGiftItemSkin`;
    }

    protected childrenCreated() {
        super.childrenCreated();
        this.init();
    }

    public init(): void {
        this.reward.itemRenderer = ItemBase;
        this.tweenGG();
    }

    public tweenGG() {
        egret.Tween.removeTweens(this.tu);
        let t: egret.Tween = egret.Tween.get(this.tu);
        this.tu.verticalCenter = 12;
        let y1 = this.tu.verticalCenter - 20;
        let y2 = this.tu.verticalCenter;
        t.to({ "verticalCenter": y1 }, 1500).to({ "verticalCenter": y2 }, 1500).call(this.tweenGG, this);
    }

    open(...param: any[]) {
        this.curId = param[0] || 1;
        this.updateData();

        this.close();
        this.addTouchEvent(this.getBtn, this.onGet);
        this.observe(UserVip.ins().postVipGiftBuy, this.updateData);
    }

    close() {
        this.removeTouchEvent(this, this.onGet);
        this.removeObserve();
    }

    public $onClose() {
        super.$onClose();
        egret.Tween.removeTweens(this.tu);
    }

    private onGet() {
        let config = GlobalConfig.VipGiftConfig[this.curId];
        if (UserVip.ins().lv < config.vipLv) {
            UserTips.ins().showTips(`VIP等级不足`);
            return;
        }
        if (Actor.yb < config.needYb) {
            UserTips.ins().showTips(`元宝不足`);
            return;
        }
        UserVip.ins().sendGetVipGift(this.curId);
    }

    updateData() {
        let config = GlobalConfig.VipGiftConfig[this.curId];
        let awards = config.awards;
        this.reward.dataProvider = new eui.ArrayCollection(awards.concat());

        this.ggtxt.source = config.adImg;
        this.txt.source = config.nameImg;
        this.tu.source = config.bgImg;

        this.getBtn.visible = UserVip.ins().getVipGiftCanBuy(this.curId) && !UserVip.ins().getVipGiftIsBuy(this.curId);
        this.getBtn.label = config.needYb + "元宝";
        if (this.getBtn.visible) {
            this.mc = this.mc || new MovieClip;
            this.mc.x = 79.5;
            this.mc.y = 26;
            this.getBtn.addChild(this.mc);
            this.mc.playFile(`${RES_DIR_EFF}chargebtn`, -1);
        }
        else {
            if (this.mc) {
                this.mc.stop();
                DisplayUtils.removeFromParent(this.mc);
            }
        }

        this.redPoint.visible = UserVip.ins().getVipGiftRedPoint(this.curId);

        this.already.visible = UserVip.ins().getVipGiftIsBuy(this.curId);
    }
}