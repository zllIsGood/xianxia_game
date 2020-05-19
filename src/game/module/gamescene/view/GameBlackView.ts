/**
 * Created by hrz on 2017/10/9.
 */

class GameBlackView extends BaseEuiView {
    private black:eui.Rect;
    constructor(){
        super();
    }

    initUI(){
        super.initUI();
        this.black = new eui.Rect();
        this.black.fillColor = 0x24201f;
        this.black.left = 0;
        this.black.right = 0;
        this.black.top = 0;
        this.black.bottom = 0;
        this.addChild(this.black);
    }

    destoryView(){}
}

ViewManager.ins().reg(GameBlackView, LayerManager.Game_Main);