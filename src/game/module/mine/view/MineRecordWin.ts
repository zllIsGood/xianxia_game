/**
 * Created by hrz on 2017/8/10.
 */

class MineRecordWin extends BaseEuiView {
    private bgClose:eui.Rect;
    private record:eui.List;
    constructor(){
        super();
        this.skinName = `PlunderRecordSkin`;
    }

    public initUI(){
        super.initUI();
        this.record.itemRenderer = MineRecordRender;
    }

    open(){
        this.addTouchEvent(this.bgClose,this.onTap);
        this.observe(Mine.ins().postMineRecord, this.update);
        Mine.ins().sendGetRecord();
        this.update();
    }

    private update(){
        this.record.dataProvider = new eui.ArrayCollection(Mine.ins().mineRecords);
    }

    private onTap(){
        ViewManager.ins().close(this);
    }
}

ViewManager.ins().reg(MineRecordWin, LayerManager.UI_Popup);