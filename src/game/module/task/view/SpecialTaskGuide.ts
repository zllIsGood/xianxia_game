/*
    file: src/game/module/awake/SpecialTaskGuide.ts
    date: 2018-9-10
    author: solace
    descript: 任务特殊引导
*/

class SpecialTaskGuide extends BaseEuiView {
	/** 控件 */
    private Name: eui.Label;
    private Icon: eui.Image;
    private word: eui.Image;

    /** 传入的配置参数 */
    private config: SpecialGuideConfig;

	constructor() {
		super();
		this.skinName = "SpecialNoticeSkin";
	}

	public initUI(): void {
		super.initUI();

        this.addTouchEvent(this,this.touchClose);
	}

	public open(...param: any[]): void {
        this.config = param[0];

        if (this.config){
            this.Name.text = this.config.name;
            this.Icon.source = this.config.icon;
            this.word.source = this.config.word;
        }

        egret.Tween.get(this).wait(2000).call(function () {
            this.touchClose();
        })
	}

    public close(...param: any[]): void {
	}

    private touchClose(): void{
        egret.Tween.removeTweens(this);
        if (this.config){
            let flyIcon: eui.Image = new eui.Image(this.config.icon);
            let p: egret.Point = this.Icon.localToGlobal();
            flyIcon.x = p.x;
            flyIcon.y = p.y;
            let view: BaseEuiView = ViewManager.ins().getView(UIView2);
            view.addChildAt(flyIcon,10);

            egret.Tween.get(flyIcon)
                .to({x:view[this.config.posTarget].localToGlobal().x,y:view[this.config.posTarget].localToGlobal().y},1000,egret.Ease.sineInOut)
                .call(function () {
                    egret.Tween.removeTweens(flyIcon);
                    DisplayUtils.removeFromParent(flyIcon);
                });
        }

        this.closeWin();
    }

}
ViewManager.ins().reg(SpecialTaskGuide, LayerManager.UI_Main);
