/**
 * Created by hrz on 2017/7/20.
 */

class SettingView extends BaseEuiView {
    private cbSound: eui.CheckBox;
    private cbShake: eui.CheckBox;
    private cbHeji: eui.CheckBox;
    private bgClose: eui.Rect;
    private accountChange: eui.Button;
    private versionLabel: eui.Label;
    private callus: eui.Button;
    constructor() {
        super();
        this.skinName = `settingskin`;
    }

    open() {
        this.accountChange.visible = LocationProperty.isNativeCheckMode;
        this.versionLabel.text = this.getVerison();
        this.addTouchEvent(this.cbSound, this.onTouch);
        this.addTouchEvent(this.cbShake, this.onTouch);
        this.addTouchEvent(this.cbHeji, this.onTouch);
        this.addTouchEvent(this.bgClose, this.onTouch);
        this.addTouchEvent(this.accountChange, this.onAccountChange);
        this.addTouchEvent(this.callus, this.onCallUs);

        this.callus.visible = LocationProperty.pf=="wanba";

        let setting = SysSetting.ins();
        this.cbSound.selected = setting.getBool(SysSetting.SOUND_EFFECT);
        this.cbShake.selected = setting.getBool(SysSetting.SHAKE_WIN);
        this.cbHeji.selected = setting.getBool(SysSetting.AUTO_HEJI);
    }

    private onTouch(e: egret.TouchEvent) {
        let tar = e.currentTarget;
        let setting = SysSetting.ins();
        if (tar == this.cbSound) {
            setting.setBool(SysSetting.SOUND_EFFECT, tar.selected);
            UserTips.ins().showTips(``);
        } else if (tar == this.cbShake) {
            setting.setBool(SysSetting.SHAKE_WIN, tar.selected);
        } else if (tar == this.cbHeji) {
            setting.setBool(SysSetting.AUTO_HEJI, tar.selected);
        } else if (tar == this.bgClose) {
            ViewManager.ins().close(this);
        }
    }

    private onAccountChange(): void{
        // RoleMgr.ins().reset();
        // Actor.ins().clear();
        // GameSocket.ins().close();
        // GameSocket.ins().newSocket();
        // SceneManager.ins().runScene(LoginScene);
        // Platform.send2Native(HYTransportCode.HY_TP_SDKLOUTOUT);
    }

    private getVerison(): string {

        let parseV = function (str: string): string {
            if (Number(str) >= 10) {
                return str;
            } else {
                return str.split('')[1];
            }
        }

        let v: string = (LocationProperty.v || 10000).toString();
        let vArr = v.split('');
        let fst = vArr[0];
        let sec = parseV(`${vArr[1] + vArr[2]}`);
        let thr = parseV(`${vArr[3] + vArr[4]}`);

        return `V${fst}.${sec}.${thr}|${GameLogic.SERVER_VER}`;
    }

    private onCallUs() {
        ViewManager.ins().open(CallUsWin);
    }
}

ViewManager.ins().reg(SettingView, LayerManager.UI_Popup);