class Vip3MWin extends BaseEuiView {
    private roleSelect:RoleSelectPanel;
    private powerPanel:PowerPanel;
    // private gift0:ItemBase;
    // private power0:PowerPanel;

    private pay:eui.Button;
    private mcGroup:eui.Group;
    private mc:MovieClip;
    private closeBtn:eui.Button;
    public closeBtn0: eui.Button;
    constructor(){
        super();
        this.skinName = `Vip3Skin`;
    }

    protected childrenCreated(){
        super.childrenCreated();
    }
    public close(...param: any[]): void {
        this.removeTouchEvent(this.pay,this.onTouchBtn);
        this.removeTouchEvent(this.closeBtn,this.onTouchBtn);
        this.removeTouchEvent(this.closeBtn0,this.onTouchBtn);
        // for( let i = 0; i < 3;i++ ){
        //     this.removeTouchEvent(this[`gift${i}`], this.onClick);
        // }
    }
    public open(...param: any[]) {
        let playPunView = ViewManager.ins().getView(PlayFunView) as PlayFunView;
        if (playPunView) {
            playPunView.preVip = playPunView.vip.visible = false;
        }
        this.addTouchEvent(this.pay, this.onTouchBtn);
        this.addTouchEvent(this.closeBtn, this.onTouchBtn);
        this.addTouchEvent(this.closeBtn0, this.onTouchBtn);
        // for( let i = 0; i < 3;i++ ){
        //     this.addTouchEvent(this[`gift${i}`], this.onClick);
        // }
        let vipIndex:number = param[0];
        this.init(vipIndex);
    }
    private init(vipIndex:number){
        let vconfig:VipConfig = GlobalConfig.VipConfig[vipIndex];
        for( let i = 0; i < 3;i++ ){
            this[`gift${i}`].data  = vconfig.awards[i+1].id;
            let power = this.getPower(vconfig.awards[i+1].id,i);
            this[`power${i}`].setPower(power);
        }

        //this.pay.label = UserVip.ins().lv < 3?"充值":"领取";
        let rdata: RechargeData = Recharge.ins().getRechargeData(0);
        if( rdata && rdata.num == 2 ) {
            if( UserVip.ins().lv >= 5 ) {
                //已经领取完首冲奖励，并且达到vip5，按钮变为"领取奖励"
                this.pay.icon = "lqjl_p1_json.lqjl_btn_lingqujiangli";
            }
        }

        this.setIconEff();
    }
    private setIconEff(){
        if( !this.mc )
            this.mc = new MovieClip;
        if( !this.mc.parent )
            this.mcGroup.addChild(this.mc);
        this.mc.playFile(RES_DIR_EFF + `mabi`, -1);
        let power:number = 0;
        let ringConfig:ExRing0Config = GlobalConfig.ExRing0Config[1];
        power = UserBag.getAttrPower(ringConfig.attrAward);
        power += ringConfig.power;
        this.powerPanel.setPower(power);
    }
    private getPower(id:number,pos:number){
        let power:number = 0;
        let config = GlobalConfig.EquipConfig[id];
        if( !config )
            return power;

        let transfrom = [
            'hp',  //2
            'atk',  //4
            'def',  //5
            'res',  //6
        ];
        let totalAttr: AttributeData[] = [];
        let idx:number = 0;
        FOR:
        for( let k in config ){
            for( let i in transfrom ){
                if( transfrom[i] == k && config[k] ){
                    let value = config[k];
                    if (value == undefined || value == 0) continue;
                    let type = Role.getAttrTypeByName(k);
                    let attrs: AttributeData = new AttributeData;
                    let attrStr = "";
                    attrStr += AttributeData.getAttrStrByType(type) + ":";
                    attrStr += config[k];
                    attrs.type = type;
                    attrs.value = config[k];

                    totalAttr.push(attrs);
                    if( !idx )
                        this[`at${pos}`].text = attrStr;
                    else if( idx == 1 )
                        this[`att${pos}`].text = attrStr;
                    idx++;
                    if( idx >1 )
                        break FOR;

                }
            }
        }

        power = Math.floor(UserBag.getAttrPower(totalAttr));

        return power;
    }

    // private onClick(e:egret.TouchEvent) {
    //     for( let i = 0; i < 3;i++ ){
    //         if( e.currentTarget == this[`gift${i}`] ){
    //             // this[`gift${i}`].data;
    //         }
    //     }
    // }
    public destoryView(): void {
        this.roleSelect.destructor();
    }

    private onTouchBtn(e: egret.TouchEvent): void {
        switch (e.target){
            case this.pay:
                this.onBtn();
                break;
            case this.closeBtn:
            case this.closeBtn0:
                ViewManager.ins().close(this);
                break;
        }
    }
    private onBtn(){
        let rdata: RechargeData = Recharge.ins().getRechargeData(0);
        if( !rdata ) {
            ViewManager.ins().open(Recharge1Win);
        } else if( rdata.num == 0 || rdata.num == 1 ) {
            //未首冲或未领取首冲奖励，打开首冲界面
            ViewManager.ins().open(Recharge1Win);
        } else if( rdata.num == 2 ) {
            if( UserVip.ins().lv < 5 ) {
                ViewManager.ins().open(ChargeFirstWin);
            } else {
                //领取完首冲奖励，并且vip等级达到5，打开vip界面
                ViewManager.ins().open(VipWin);
            }
        }

        ViewManager.ins().close(this);
    }


}

ViewManager.ins().reg(Vip3MWin, LayerManager.UI_Popup);