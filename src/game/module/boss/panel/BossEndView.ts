/**
 * Created by hrz on 2017/11/20.
 */

class BossEndView extends BaseEuiView {
    private endGroup: eui.Group;
    private leftTime: eui.Label;
    private winnerName: eui.Label;
    constructor(){
        super();
        this.skinName = `BossEndSkin`;
    }

    open() {
        this.observe(UserBoss.ins().postWorldBossEndTime, this.worldBossEnd);
        this.worldBossEnd();
    }

    private worldBossEnd(){
        this.winnerName.text = `最终归属者是：${UserBoss.ins().winner}`;
        let time: number = Math.ceil((UserBoss.ins().worldBossEndTime - egret.getTimer()) / 1000);
        this.leftTime.text = DateUtils.getFormatTimeByStyle(time, DateUtils.STYLE_4);

        TimerManager.ins().removeAll(this);
        TimerManager.ins().doTimer(1000, time, () => {
            time--;
            this.leftTime.text = DateUtils.getFormatTimeByStyle(time, DateUtils.STYLE_4);
            if (time == 0) {
                UserFb.ins().sendExitFb();
            }
        }, this);
    }
}

ViewManager.ins().reg(BossEndView, LayerManager.Main_View);