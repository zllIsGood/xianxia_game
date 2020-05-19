/**
 * Created by hrz on 2017/6/26.
 */

class TaskEffectView extends egret.DisplayObjectContainer {

    private _effCir:MovieClip;
    private _arrow:GuideArrow2;
    private _effGroup:eui.Group;
    private _arrowGroup:eui.Group;

    private _isShow:boolean;

    constructor(){
        super();
        this.init();
    }

    init(){
        this._effGroup = new eui.Group();
        this.addChild(this._effGroup);

        this._arrowGroup = new eui.Group();
        this.addChild(this._arrowGroup);

        this._effCir = new MovieClip();
        this._effGroup.addChild(this._effCir);

        this._arrow = new GuideArrow2();
        this._arrowGroup.addChild(this._arrow);

        this.touchChildren = false;
        this.touchEnabled = false;
    }

    start() {
        TimerManager.ins().remove(this.update,this);
        TimerManager.ins().doTimer(500,0,this.update,this);
    }

    stop() {
        TimerManager.ins().remove(this.update,this);
        this.hide();
    }

    show(tips) {
        if (!this._isShow) {
            this._isShow = true;
            let view = ViewManager.ins().getView(PlayFunView) as PlayFunView;
            if(!view){
                this.hide();
                return;
            }

            egret.Tween.removeTweens(this);
            this.alpha = 0;
            egret.Tween.get(this).to({alpha:1},300);

            let target = view['taskTraceBtn'];
            // let p = target.localToGlobal(target.x,target.y);

            // this.x = p.x+target.width >> 1;
            // this.y = p.y+target.height >> 1;

            this.x = target.width >> 1;
            this.y = target.height >> 1;

            target.addChild(this);
            this._effCir.visible = true;
            this._arrow.visible = true;
            this._arrow.setDirection(0);
            this._effCir.playFile(`${RES_DIR_EFF}guideff`, -1);
        }
        this._arrow.setTips(tips);
    }

    hide() {
        if (this._isShow) {
            this._isShow = false;
            this._arrow.removeTweens();
            this._arrow.visible = false;
            this._effCir.visible = false;
            // if(this.parent) this.parent.removeChild(this);
        }
    }

    isShow(){
        return this._isShow;
    }

    private update() {
        let taskData = UserTask.ins().taskTrace;
        if (taskData) {
            let config = UserTask.ins().getAchieveConfById(taskData.id);

            //屏蔽窗口
            let noShowWin = ["WelcomeWin"];
            for (let win of noShowWin) {
                if(ViewManager.ins().getView(win)){
                    this.hide();
                    return;
                }
            }

            if (config) {
                if (taskData.state == 0 && config.startwarning) {
                    this.show(config.startwarning);
                } else if (taskData.state == 1 && config.finishwarning ){
                    this.show(config.finishwarning);
                } else {
                    this.hide();
                }
            }
        }
    }
}