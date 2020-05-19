/**
 * Created by hrz on 2017/11/23.
 */

class GuildChangeNameView extends BaseEuiView {
    private bgClose:eui.Rect;
    private closeBtn:eui.Button;
    private input:eui.EditableText;
    private sureBtn:eui.Button;
    constructor(){
        super();
        this.skinName = `guildNameChange`;
    }

    open() {
        this.addTouchEvent(this.sureBtn, this.onTap);
        this.addTouchEvent(this.closeBtn, this.onTap);
        this.addTouchEvent(this.bgClose, this.onTap);
    }

    private onTap(e:egret.TouchEvent) {
        let tar = e.currentTarget;
        switch (tar) {
            case this.bgClose:
            case this.closeBtn:
                ViewManager.ins().close(this);
                break;
            case this.sureBtn:
                this.onChangeName();
                break;
        }
    }

    private onChangeName() {
        if (this.input.text == "")
            UserTips.ins().showTips("请输入仙盟名字");
        else {
            Guild.ins().sendGuildChangeName(this.input.text);

            ViewManager.ins().close(this);
        }
    }
}

ViewManager.ins().reg(GuildChangeNameView, LayerManager.UI_Popup);