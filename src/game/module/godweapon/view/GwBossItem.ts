/**
 * Created by hrz on 2017/11/17.
 */

class GwBossItem extends BaseItemRender {
    private bg:eui.Image;
    private bg0:eui.Image;
    private killImg:eui.Image;
    private fbname:eui.Label;
    private levelNeed:eui.Label;
    private timeTxt:eui.Label;
    private states = ['cannot','already','havetime'];
    constructor(){
        super();
        this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemove, this);
    }

    dataChanged() {
        let data = this.data as WorldBossItemData;
        let config = GlobalConfig.WorldBossConfig[data.id];
        this.fbname.text = config.showName;

        if(this.selected)
            this.bg0.visible = true;
        else
            this.bg0.visible = false;

        this.enabled = true;

        TimerManager.ins().remove(this.updateTime, this);
        if(data.canChallenge) {
            // this.killImg.visible = true;
            // this.killImg.source = `zdbosskejisha2`;
            // this.timeTxt.text = "已刷新";

            this.currentState = this.states[1];
        }
        else if(data.isDie && data.canInto) {
            // this.killImg.visible = false;
            this.updateTime();
            TimerManager.ins().doTimer(1000, 0, this.updateTime, this);

            this.currentState = this.states[2];
        }
        else {
            // this.timeTxt.text = "";
            // this.killImg.visible = true;
            // this.killImg.source = `zdbossweikaiqi`;
            this.enabled = false;

            this.currentState = this.states[0];
        }

        this.levelNeed.text = `(${config.zsLevel[0]}转-${config.zsLevel[1]}转)`;

    }

    private updateTime(): void {
        let time: number = this.data.relieveTime - egret.getTimer();
        this.timeTxt.text = `${DateUtils.getFormatBySecond(Math.floor(time / 1000), 1)}`;
        if (time <= 0) {
            TimerManager.ins().remove(this.updateTime, this);
            this.timeTxt.text = ``;
        }
    }

    private onRemove(e) {
        TimerManager.ins().remove(this.updateTime, this);
    }
}