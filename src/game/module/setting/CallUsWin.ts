/*
    file: src/game/module/setting/CallUsWin.ts
    date: 2019-1-3
    author: solace
    descript: 联系客服
*/
class CallUsWin extends BaseEuiView {

    private bgClose: eui.Rect;

    constructor() {
        super();
        this.skinName = `callCsSkin`;
    }

    open() {
        this.addTouchEvent(this.bgClose, ()=>{ViewManager.ins().close(this);});
    }
}

ViewManager.ins().reg(CallUsWin, LayerManager.UI_Popup);