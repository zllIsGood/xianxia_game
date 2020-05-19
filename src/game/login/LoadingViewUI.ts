/*
    file: src/game/login/LoadingViewUI.ts
    date: 2018-9-10
    author: solace
    descript: loading界面
*/

class LoadingViewUI extends BaseEuiView {
	/** 控件 */
    private loadingBar: eui.ProgressBar;

	constructor() {
		super();
		this.skinName = "LoadingViewSkin";
	}

	public initUI(): void {
		super.initUI();
        let time: number = 3;
        this.loadingBar.minimum = 0;
        this.loadingBar.maximum = time*1000;
        this.loadingBar.value = 0;
        
        let timer: egret.Timer = new egret.Timer(20,(time+1)*1000/20);
        timer.addEventListener(egret.TimerEvent.TIMER,function () {
            if (this.loadingBar.value < this.loadingBar.maximum) {
                this.loadingBar.value += 20;
            }
        },this);
        timer.addEventListener(egret.TimerEvent.TIMER_COMPLETE,function () {
            timer = null;
            this.closeWin();
        },this);
        timer.start();
	}

}
ViewManager.ins().reg(LoadingViewUI, LayerManager.UI_LOADING);
