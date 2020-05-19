/*
    file: src/game/module/pfactivity/view/AwakeWin.ts
    date: 2019-1-3
    author: solace
    descript: 玩吧添加桌面功能
*/

class AddDeskWin extends BaseEuiView {
    private bgClose:eui.Rect;
    private closeBtn:eui.Button;
    private focusBtn:eui.Button;
    private reward:eui.List;
    private rewState:boolean = false; // 可领奖状态,false:不可领，true:可领

    constructor(){
        super();
        this.skinName = `AddToDesktopSkin`;
    }

    open(){
        this.addTouchEvent(this.bgClose, this.onTap);
        this.addTouchEvent(this.closeBtn, this.onTap);
        this.addTouchEvent(this.focusBtn, this.onTap);
        this.observe(Invite.ins().postAddDeskGift,this.btnState);
        this.initList();
    }

    private initList(){
        let award = GlobalConfig.DeskGiftConf.awards;
        this.reward.itemRenderer = ItemBase;
        this.reward.dataProvider = new eui.ArrayCollection(award);

        this.btnState();
    }

    private btnState() {
        this.rewState = (Invite.ins().wanbaAddDeskState==1 && Invite.ins().wanbaAddDeskReward==0);

        if (this.rewState) {
            this.focusBtn.label = "领取奖励";
        }
        else {
            this.focusBtn.label = "立即添加";
        }
    }

    private onTap(e:egret.TouchEvent){
        let tar = e.currentTarget;
        switch (tar) {
            case this.bgClose:
            case this.closeBtn:
                ViewManager.ins().close(this);
                break;
            case this.focusBtn:
                if (this.rewState) {
                    Invite.ins().sendAddDeskGift();
                }
                else {
                    // 玩吧添加到桌面
                    if (window["showShortcut"] && LocationProperty.pf=="wanba") {
                        window["showShortcut"]((code)=>{});
                    }
                    Invite.ins().wanbaAddDeskState = 1;
                }
                
                ViewManager.ins().close(this);
                break;
        }
    }

}

ViewManager.ins().reg(AddDeskWin, LayerManager.UI_Popup);