/**
 * Created by hrz on 2017/9/19.
 */

class RenZhengWin extends BaseEuiView {
    public bgClose: eui.Rect;
    public reward: eui.List;
    public closeBtn: eui.Button;
    public tipGroup: eui.Group;
    public getBtn: eui.Button;

    constructor() {
        super();
        this.skinName = `RenzhengSkin`;
    }

    public open() {
        this.addTouchEvent(this.bgClose, this.onTap);
        this.addTouchEvent(this.closeBtn, this.onTap);
        this.addTouchEvent(this.getBtn, this.onTap);
        this.initList();

        this.observe(PfActivity.ins().postRenZheng, this.onChange, this)


    }

    private onChange() {
        this.getBtn.label = LocationProperty.verify == 0 ? "我要领取" : "领取";
    }

    private initList() {
        let award = GlobalConfig.SDKConfig.renzhengReward;
        this.reward.itemRenderer = ItemBase;
        this.reward.dataProvider = new eui.ArrayCollection(award);
    }

    private onTap(e: egret.TouchEvent) {
        let tar = e.currentTarget;
        switch (tar) {
            case this.bgClose:
            case this.closeBtn:
                ViewManager.ins().close(this);
                break;
            case this.getBtn:
                if (LocationProperty.verify == 0) {
                    // window["userVerify"] && window["userVerify"]();
                    if (window["isAuthenticate"]) {
                        window["isAuthenticate"]((cbData)=>{
                            if (cbData.error == 0) {
                                UserTips.ins().showTips(`实名认证成功`);
                                LocationProperty.verify = 1;
                                PfActivity.ins().postRenZheng(1);
                            }
                        })
                    }
                } else {
                    PfActivity.ins().sendRenzhengGift();
                    ViewManager.ins().close(this);
                }

                
                break;
        }
    }
}

ViewManager.ins().reg(RenZhengWin, LayerManager.UI_Popup);