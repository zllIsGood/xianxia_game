
/**
 * 每日分享
 * Author: Ade
 */

class InviteWin extends BaseEuiView {

    private checkBoxs: eui.CheckBox;

    private sureBtn: eui.Button;

    private closeBtn: eui.Button;

    private bgClose: eui.Rect;

    private item: ItemBase; 

    constructor() {
        super();
        this.skinName = 'inviteSkin';
        this.isTopLevel = true;
    }

    public initUI(): void {
        super.initUI();

    }

    public destoryView(): void {
		super.destoryView();
    }

    public open(...param: any[]): void {

        this.checkBoxs.selected = true;

        let itemData: InviteConf = GlobalConfig.InviteConf;
		this.item.data = itemData.shareAwards[0];
        
        this.addTouchEndEvent(this.sureBtn, this.handleSureBtnTap);
        this.addTouchEndEvent(this.closeBtn, this.handleCloseBtnTap);
        this.addTouchEndEvent(this.bgClose, this.handleCloseBtnTap);
    }
    
    public close(...param: any[]): void {

        this.removeTouchEvent(this.sureBtn, this.handleSureBtnTap);
        this.removeTouchEvent(this.closeBtn, this.handleCloseBtnTap);
        this.removeTouchEvent(this.bgClose, this.handleCloseBtnTap);
    }

    private handleSureBtnTap() {
        
        if (this.checkBoxs.selected) {

            let info = Invite.ins().getInviteInfo();
            
            let title: string = info.word.length > 0 ? info.word[0] : "";
            let img: string = info.pic.length > 0 ? info.pic[0] : "";

            let imgPath: string = `resource/image/share/${img}`;

            // 获取分享图片的版本号信息
            let version = ResVersionManager.ins().getDir(imgPath)

            // 分享字段
            let query = 'act=' + Actor.actorID;

            platform.shareAppMessage(title, query, `${version}/${imgPath}`).then(() => {	
            });
        }
        Setting.ins().setValue(ClientSet.invite, 1);
        Invite.ins().postInvite();
        Invite.ins().sendInviteAwake();
        ViewManager.ins().close(this);
    }

    private handleCloseBtnTap() {

        ViewManager.ins().close(this);
    }

}

ViewManager.ins().reg(InviteWin, LayerManager.UI_Popup);