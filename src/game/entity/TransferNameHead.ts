/**
 * Created by hrz on 2017/8/17.
 */

class TransferNameHead extends BaseComponent {
    num:eui.BitmapLabel;
    constructor(){
        super();
        this.skinName = `Trans`;
    }

    updateModel(info:TransferModel){
        if (info.index) {
            this.visible = true;
            this.num.text = info.index+"";
        } else {
            this.visible = false;
        }
    }
}