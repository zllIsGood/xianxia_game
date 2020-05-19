/**
 * 收藏有礼
 * Author: Ade
 */

enum CollectGiftOption {
    // 收藏有礼按钮, 0从未点击, 1点击过, 2点击过并且返回后台, 3领取过
    never        = 0,
    clicked      = 1,
    enterBg      = 2,
    receiveAward = 3
}
class CollectGiftRule extends RuleIconBase {

    constructor(t: egret.DisplayObjectContainer) {
        super(t);

        this.updateMessage = [];

        let collectGiftFlag = Setting.ins().getValue(ClientSet.collectGifBtn);
        if (collectGiftFlag < CollectGiftOption.enterBg) {
            Setting.ins().setValue(ClientSet.collectGifBtn, CollectGiftOption.never);
        }
    }

    checkShowIcon(): boolean {
        
        if (OpenSystem.ins().checkSysOpen(SystemType.COLLECTGIFT) && LocationProperty.isWeChatMode) {   
            let collectGiftFlag = this.getCollectGiftFlag();
            return (collectGiftFlag != CollectGiftOption.receiveAward);
        } else {
            return false;
        }
        // return true;
    }

    checkShowRedPoint(): number {
        
        // 已经点击过, 并且显示出来收藏引导界面, 那就显示红点
        let collectGiftFlag = this.getCollectGiftFlag();
        if (collectGiftFlag == CollectGiftOption.enterBg) {
            return 1;
        } else {
            return 0;
        }
    }

    tapExecute(): void {
        let collectGiftFlag = this.getCollectGiftFlag();
        ViewManager.ins().open(CollectGiftWin, collectGiftFlag);
    }

    getCollectGiftFlag(): number {
        return Setting.ins().getValue(ClientSet.collectGifBtn)
    }

}