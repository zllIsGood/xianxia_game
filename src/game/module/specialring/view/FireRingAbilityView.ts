/**
 * 火焰戒指 能力显示窗口
 * Created by Peach.T on 2017/11/2.
 */
class FireRingAbilityView extends BaseEuiView {
    public colorCanvas: eui.Rect;
    public anigroup: eui.Group;
    public title: eui.Label;
    public list: eui.List;

    public constructor() {
        super();
        this.skinName = `LYRAbilitySkin`;
        this.isTopLevel = true;//设为1级UI
    }

    public open(...param: any[]): void {
        this.list.itemRenderer = FireRingAbilityItem;
        this.addTouchEndEvent(this.colorCanvas, this.otherClose);
        let ary: number[] = [];
        for (let i in GlobalConfig.ActorExRingAbilityConfig) {   
            ary.push(parseInt(i));
        }
        this.list.dataProvider = new ArrayCollection(ary);
    }

    private otherClose(evt: egret.TouchEvent) {
        ViewManager.ins().close(this);
    }
}

ViewManager.ins().reg(FireRingAbilityView, LayerManager.UI_Popup);

