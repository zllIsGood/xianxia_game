/**
 * Created by hrz on 2017/10/19.
 */

class NewBossJiangliView extends BaseEuiView {
    private closeBtn:eui.Rect;
    private giveUp:eui.Image;
    private belongItem:ItemBase;
    private endItem0:ItemBase;
    private endItem1:ItemBase;
    private joinItem:ItemBase;

    constructor(){
        super();
        this.skinName = `wpkBossJiangLiTishiSkin`;
    }

    open(){
        this.addTouchEvent(this.closeBtn, this.onTap);
        this.addTouchEvent(this.giveUp, this.onTap);
        this.initView();
    }

    private initView(){
        let reward = GlobalConfig.NewWorldBossBaseConfig.showDrows;
        this.endItem0.data = reward[0];
        this.endItem1.data = reward[1];

        this.belongItem.data = GlobalConfig.NewWorldBossRankConfig[1][1].reward[0];
        this.joinItem.data = GlobalConfig.NewWorldBossRankConfig[1][4].reward[0];

        this.endItem0.isShowName(false);
        this.endItem1.isShowName(false);

        this.belongItem.isShowName(false);
        this.joinItem.isShowName(false);
    }

    private onTap(e:egret.TouchEvent) {
        let tar = e.currentTarget;
        if (tar == this.closeBtn || tar == this.giveUp) {
            ViewManager.ins().close(this);
        }
    }

    close(){

    }
}

ViewManager.ins().reg(NewBossJiangliView, LayerManager.UI_Popup);