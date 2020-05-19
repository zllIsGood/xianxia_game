class ComMCardWin extends BaseView {
    btn1: eui.Button
    btn2: eui.Button
    btn3: eui.Button
    select1: eui.Image
    select2: eui.Image
    select3: eui.Image
    buy1: eui.Group
    buy2: eui.Group
    buy3: eui.Group
    viewStack: eui.ViewStack

    index


    constructor() {
        super();
        this.skinName = "ComMCardWinSkin";
        this.viewStack.addChild(new ComMCardPanel())
        this.viewStack.addChild(new MonthCardWin())
        this.viewStack.addChild(new FranchiseWin())
    }

    public open(...param: any[]): void {
        this.observe(Recharge.ins().postGetMonthDay, this.upState);
        this.observe(Recharge.ins().postFranchiseInfo, this.upState);
        this.addTouchEvent(this.btn1, this.onTap);
        this.addTouchEvent(this.btn2, this.onTap);
        this.addTouchEvent(this.btn3, this.onTap);
        this.addTouchEvent(this.buy1, this.onTap);
        this.addTouchEvent(this.buy2, this.onTap);
        this.addTouchEvent(this.buy3, this.onTap);
        this.update(0)
        this.upState()
    }

    upState() {
        if (Recharge.ins().monthDay > 0) {
            this.btn2.label = "已购买";
            this.btn2.touchEnabled = false;
        } else {
            //TODO:档位需要同步
            //微信小游戏档位
            if (LocationProperty.isWeChatMode) {
                this.btn2.label = "￥25";
            }
            this.btn2.touchEnabled = true;
        }

        if (Recharge.ins().franchise > 0) {
            if (!Recharge.ins().franchiseget) {
                this.btn3.label = "已领取";
                this.btn3.currentState = "disabled";
                this.btn3.touchEnabled = false;
            }
            else {
                this.btn3.currentState = "up";
                this.btn3.touchEnabled = true;
                this.btn3.label = "领取奖励";
            }
        }

        if (Recharge.ins().isMC) {
            this.btn1.label = '已购买'
        }
    }

    update(index: number) {
        if (this.index == null) {
            this.index = index;
            this['select' + (this.index + 1)].visible = true
            this.viewStack.selectedIndex = index
            var view = this.viewStack.getChildAt(this.index)
            view['open']();
        }
        else if (this.index != index) {
            var view = this.viewStack.getChildAt(this.index)
            this['select' + (this.index + 1)].visible = false
            view['close']();

            this.index = index;
            this.viewStack.selectedIndex = index
            var view = this.viewStack.getChildAt(this.index)
            this['select' + (this.index + 1)].visible = true
            view['open']();
        }
    }

    public close(...param: any[]): void {
        this.removeObserve();
        var view = this.viewStack.getChildAt(this.index)
        view['close']();
    }

    private onTap(e: egret.TouchEvent): void {
        switch (e.currentTarget) {
            case this.btn1:
                if (this.btn1.label != "已购买") {
                    //玩家如果单独买了月卡/特权月卡，则不能再去打包购买
                    if (Recharge.ins().monthDay > 0 || Recharge.ins().franchise > 0) {
                        UserTips.ins().showTips('|C:0xF3311E&T:只能同时购买2个月卡才能享受优惠')
                    }
                    else {
                        var rechargeid = Recharge.ins().getComMCardRechargeId();
                        if (rechargeid) {
                            Recharge.ins().showReCharge(rechargeid);
                        }
                    }
                }
                break;
            case this.btn2:
                if (this.btn2.label != "已购买") {
                    var rechargeid = Recharge.ins().getMonthCardRechargeId();
                    if (rechargeid) {
                        Recharge.ins().showReCharge(rechargeid);
                    }
                }
                break;
            case this.btn3:
                if (this.btn3.label != "领取奖励") {
                    let rechargeid = Recharge.ins().getFranciseRechargeId();
                    if (rechargeid) {
                        Recharge.ins().showReCharge(rechargeid);
                    }
                }
                else
                    Recharge.ins().sendGetFranchise();
                break;
            case this.buy1:
                this.update(0)
                break;
            case this.buy2:
                this.update(1)
                break;
            case this.buy3:
                this.update(2)
                break;
        }
    }

}
