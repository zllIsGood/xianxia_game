
class WxTool {

    static isBg: boolean = false;

    public static onShow(option) {

        console.log(option);
        
        // 收藏有礼
        let collectGiftFlag = Setting.ins().getValue(ClientSet.collectGifBtn);

        let enter: boolean = (option.scene == 1104);

        if (collectGiftFlag == CollectGiftOption.clicked && enter) {
            Setting.ins().setValue(ClientSet.collectGifBtn, CollectGiftOption.enterBg);
            Invite.ins().postCollectGift();
        }

        let showTimestamp = window['showTimestamp'];
        let hideTimestamp = window['hideTimestamp'];
        
        let time = hideTimestamp - showTimestamp;
        // console.log(`showTimestamp: ${showTimestamp}, hideTimestamp:  ${hideTimestamp}, time:${time}`);
        if (time > 10 && WxTool.isBg) {

            if (LocationProperty.openID && 
                LocationProperty.password &&
                LocationProperty.srvid &&
                LocationProperty.serverIP &&
                LocationProperty.serverPort) {
             
                    platform.reLogin().then(() => {
                        RoleMgr.ins().reset();
                        GameSocket.ins().close();
                        GameSocket.ins().newSocket();
                        RoleMgr.ins().connectServer();
                        WxTool.isBg = false;
                    });
            }
        }

        window['showTimestamp'] = Date.parse(`${new Date()}`) / 1000;
    }

    public static onHide() {

        // console.log('进入后台');
        
        let hideTimestamp = Date.parse(`${new Date()}`) / 1000;
        window['hideTimestamp'] = hideTimestamp;
        // console.log(`showTimestamp: ${window['showTimestamp']}, hideTimestamp:  ${window['hideTimestamp']}`);
        WxTool.isBg = true;
    }

    public static isCheck(): boolean {
        
        if (window['isCheck'] == 0) {
            return false;
        } else {
            return true;
        }
    }

    /** 是否打开充值 */
    public static shouldRecharge(): boolean { 

        if (platform.isIphone()) {
            return false; 
        }
        return true;
    }

}