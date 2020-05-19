/**
 * 组队副本邀请界面
 * @author wanghengshuai
 *
 */
class TeamFbInviteWin extends BaseEuiView {
    public input: eui.EditableText;
    public friendInviteBtn: eui.Button;
    public worldInviteBtn: eui.Button;
    public closeBtn: eui.Rect;
    private _deDes: string = "";

    private _room: number;

    private _configID: number;

    public constructor() {
        super();
        this.skinName = "teamFbInviteSkin";
        this.isTopLevel = true;
    }

    public open(...args: any[]): void {
        this._deDes = args[0];
        this._room = args[1];
        this._configID = args[2];
        this.input.text = this._deDes;
        this.input.maxChars = 40;
        this.addTouchEvent(this, this.onTouch);
    }

    public close(): void {
    }

    private onTouch(e: egret.TouchEvent): void {
        switch (e.target) {
            case this.closeBtn:
                ViewManager.ins().close(this);
                break;
            case this.worldInviteBtn:
                let t: number = UserFb.ins().getTfInviteCD(); 
                if (t > 0) {
                    UserTips.ins().showTips(`${t}秒后才能世界邀请`);
                    return;
                }

                UserFb.ins().sendTfSysInvite(this.getDes() + `|E:1,${UserFb.ins().tfRoomID},&U:&C:${0x00FF00}&T:快速加入`);
                ViewManager.ins().close(this);
                break;
            case this.friendInviteBtn:
                ViewManager.ins().open(FriendListWin, this.getDes() + `|E:1,${UserFb.ins().tfRoomID},&U:&C:${0x00FF00}&T:快速加入`);
                ViewManager.ins().close(this);
                break;
        }
    }

    private getDes(): string {
        let str: string = (!this.input.text ? this._deDes : this.input.text);
        let nameStr: string = `[|C:${0x16B2FF}&T:${Actor.myName}|]`;
        if (str == this._deDes)
            str = str.replace("我", nameStr);
        else
            str = nameStr + str;

        return str;
    }
}

ViewManager.ins().reg(TeamFbInviteWin, LayerManager.UI_Popup);