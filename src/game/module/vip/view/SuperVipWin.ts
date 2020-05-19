/**
 * Created by hrz on 2017/11/9.
 */

class SuperVipWin extends BaseEuiView {
    private qqtxt:eui.Label;
    private pey:eui.Button;
    private closeBtn:eui.Button;
    private bgClose:eui.Rect;

    private nopay0:eui.Group;
    private nopay1:eui.Group;

    private copy:eui.Button;
    private pay0:eui.Group;

    private cond0:eui.Label;
    private cond1:eui.Label;
    private cond2:eui.Label;
    constructor(){
        super();
        this.skinName = `gsvipSkin`;
    }

    open() {
        this.addTouchEvent(this.closeBtn, this.onTap);
        this.addTouchEvent(this.bgClose, this.onTap);
        this.addTouchEvent(this.pey, this.onTap);
        this.addTouchEvent(this.copy, this.onTap);

        this.observe(UserVip.ins().postSuperVipInfo, this.initView);

        UserVip.ins().sendGetSuperVipInfo();

        this.initView();
    }

    private initView(){
        if (UserVip.ins().getSuperVipState()) {
            this.qqtxt.text = UserVip.ins().superVipData ? `${UserVip.ins().superVipData.data.qq}` : "";
            this.nopay0.visible = false;
            this.nopay1.visible = false;
            this.copy.visible = true;
            this.pay0.visible = true;
        } else {
            this.qqtxt.text = `??????`;
            this.nopay0.visible = true;
            this.nopay1.visible = true;
            this.copy.visible = false;
            this.pay0.visible = false;
        }

        if (UserVip.ins().superVip) {
            for (let id in GlobalConfig.SuperVipConfig) {
                let i = +id - 1;
                let config = GlobalConfig.SuperVipConfig[id];
                this[`cond${i}`].text = `(${UserVip.ins().superVip[i]||0}/${config.money})`;
            }
        }
    }

    private onTap(e:egret.TouchEvent) {
        let tar = e.currentTarget;
        switch (tar) {
            case this.closeBtn:
            case this.bgClose:
                ViewManager.ins().close(this);
                break;
            case this.pey:
                let rdata:RechargeData = Recharge.ins().getRechargeData(0);
                if(!rdata || rdata.num != 2 ){
                    ViewManager.ins().open(Recharge1Win);
                }else{
                    ViewManager.ins().open(ChargeFirstWin);
                }
                ViewManager.ins().close(this);
                break;
            case this.copy:
                if(window.prompt) {
                    if(DeviceUtils.IsMobile)
                        window.prompt(`请长按链接复制QQ：`,UserVip.ins().superVipData.data.qq+"");
                    else
                        window.prompt(`请复制QQ：`,UserVip.ins().superVipData.data.qq+"");
                }
                break;
        }
    }
}

ViewManager.ins().reg(SuperVipWin, LayerManager.UI_Popup);