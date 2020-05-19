/*
    file: src/game/login/LoginView.ts
    date: 2018-9-10
    author: solace
    descript: 登录界面
*/

class LoginView extends BaseEuiView {
    /** 控件 */
    private btnEnter: eui.Button;
    private gpServer: eui.Group;
    private lbDefaultSrv: eui.Label;
    private gpAccount: eui.Group;
    private account: eui.EditableText;
    private notice: eui.Button;

    private selectSrvData: any;
    private imageLoad: eui.Image;

    constructor() {
        super();
        this.skinName = "WxSelectServerSkin";
    }

    public initUI(): void {
        super.initUI();



        this.gpServer.touchEnabled = LocationProperty.isNotNativeMode;
        this.btnEnter.touchEnabled = LocationProperty.isNotNativeMode;
        this.gpServer.visible = LocationProperty.isNotNativeMode;
        this.btnEnter.visible = LocationProperty.isNotNativeMode;
        this.gpAccount.visible = LocationProperty.isNotNativeMode;

        if (LocationProperty.weiduanSrvList) {
            this.showServerListUI(LocationProperty.weiduanSrvList);
        }
    }

    public open(...param: any[]): void {
        if (!LocationProperty.isNotNativeMode) {
            HYTransport.addNativeEventListener("HY_TP_SRVLIST",this.tpSrvList,this);
            HYTransport.addNativeEventListener("HY_TP_SDKLOGIN",this.tpSdkLogin,this);
            HYTransport.addNativeEventListener("HY_TP_SDKLOUTOUT",this.tpLogout,this);
            HYTransport.addNativeEventListener("HY_TP_ENTERGAME",this.tpEnter,this);
        }
        else {
            // this.chooseServer({name:'测试服',server_id:'1',route_ip:'139.199.59.117',route_port:'8010',server_status:'1'});
            this.chooseServer({name:'内网服',server_id:'1',route_ip:'192.168.1.7',route_port:'8010',server_status:'1'});
            // this.chooseServer({name:'航龙',server_id:'44',route_ip:'192.168.1.48',route_port:'8010',server_status:'1'});
            // this.chooseServer({name:'测试服',server_id:'60010',route_ip:'s1ftznh5.hulai.com',route_port:'10012',server_status:'1'});
        }

        this.addTouchEvent(this.btnEnter,this.loginCallBack);
        this.addTouchEvent(this.gpServer,function () {
            ViewManager.ins().open(LoginServerListView);
        });
        this.addTouchEvent(this.notice,function () {
            ViewManager.ins().open(LoginNoticeView);
        });

        // 从OC获取服务器列表
        HYTransport.send2Native(HYTransportCode.HY_TP_SRVLIST);

        // 个别平台添加资质
        if (LocationProperty.isHuaweiMode) {
            let beianLabel = new eui.Label();
            beianLabel.text = `抵制不良游戏，拒绝盗版游戏。注意自我保护，谨防受骗上当。\n适度游戏益脑，沉迷游戏伤身。合理安排时间，享受健康生活。\n备案号：文网游备字〔2015〕Ｍ-RPG 0781 号。\n著作权人：互爱互动（北京）科技有限公司。\n软著登记号：2015SR024500。出版单位：互爱互动（北京）科技有限公司。\n批准文号：新广出审[2015]796号。出版物号：ISBN 978-7-89988-380-8。\n发行商：重庆策娱科技有限公司`;
            beianLabel.textColor = 0xffffff;
            beianLabel.size = 14;
            beianLabel.lineSpacing = 4;
            beianLabel.width = StageUtils.ins().getWidth() - 20;
            beianLabel.x = 10;
            beianLabel.y = StageUtils.ins().getHeight() - 150;
            beianLabel.textAlign = egret.HorizontalAlign.CENTER;
            this.addChildAt(beianLabel, 999);
        }
    }

    public close(...param: any[]): void {
        if (this.imageLoad) {
            egret.Tween.removeTweens(this.imageLoad);
        }
        if (!LocationProperty.isNotNativeMode) {
            HYTransport.removeNativeEventListener("HY_TP_SRVLIST",this.tpSrvList,this);
            HYTransport.removeNativeEventListener("HY_TP_SDKLOGIN",this.tpSdkLogin,this);
            HYTransport.removeNativeEventListener("HY_TP_SDKLOUTOUT",this.tpLogout,this);
            HYTransport.removeNativeEventListener("HY_TP_ENTERGAME",this.tpEnter,this);
        }
    }

    public playUIEff(...param: any[]): void {
    }

    public chooseServer(srvData: any): void {
        this.selectSrvData = srvData;

        this.lbDefaultSrv.text = this.selectSrvData.name;

        if (!LocationProperty.isNotNativeMode) {
            // 通知OC层选服
            HYTransport.send2Native(HYTransportCode.HY_TP_SRVCHOOSE,{
                serverId:this.selectSrvData.server_id.toString(),
            });
        }
    }

    private loginCallBack(): void{
        if (LocationProperty.isNotNativeMode) {
            LocationProperty.openID = 'test'+this.account.text;
            LocationProperty.srvid = this.selectSrvData.server_id;
            LocationProperty.serverIP = this.selectSrvData.route_ip;
            LocationProperty.serverPort = this.selectSrvData.route_port;
            RoleMgr.ins().connectServer();
            
        }
        else {
            if (LocationProperty.isWeChatMode || LocationProperty.isVivoMode) {
                platform.gameLogin(this.selectSrvData.server_id).then((data) => {
                    HYTransport.dispatchEvent("HY_TP_ENTERGAME", data);
                })
                
            }
            else if (LocationProperty.isHuaweiMode) { // 华为小游戏
                hw_enterGame(this.selectSrvData.server_id, (data) => {
                    HYTransport.dispatchEvent("HY_TP_ENTERGAME", data);
                });
            }
            else {   
                HYTransport.send2Native(HYTransportCode.HY_TP_ENTERGAME);
            }
        } 

        this.btnEnter.touchEnabled = false;
        this.gpServer.touchEnabled = false;

        this.imageLoad = new eui.Image();
        this.imageLoad.source = RES_DIR+"load_Reel.png";
        this.imageLoad.anchorOffsetX = 50;
        this.imageLoad.anchorOffsetY = 50;
        this.imageLoad.x = this.width/2;
        this.imageLoad.y = this.height/2;
        this.addChildAt(this.imageLoad,999);
        egret.Tween.get(this.imageLoad,{loop:true}).to({rotation:-360},1000);
    }

    // private changeAccount(): void {
    //     HYTransport.send2Native(HYTransportCode.HY_TP_SDKLOUTOUT);
    // }

    private tpSrvList (e:egret.Event) {
        // LocationProperty.weiduanSrvList
        // console.log(e.data);
        this.showServerListUI(e.data);
    }
    private showServerListUI(srvListData: any) {
        if (srvListData.lastserver.default_server) {
            this.chooseServer(srvListData.lastserver.default_server);
        }
        this.gpServer.touchEnabled = true;
        this.btnEnter.touchEnabled = true;
        this.gpServer.visible = true;
        this.btnEnter.visible = true;
    }

    private tpSdkLogin (e:egret.Event) {
        
    }
    private tpEnter (e:egret.Event) {
        LocationProperty.openID = LocationProperty.openID;
        LocationProperty.password = LocationProperty.password;
        LocationProperty.srvid = LocationProperty.srvid;
        LocationProperty.serverIP = LocationProperty.serverIP;
        LocationProperty.serverPort = LocationProperty.serverPort;
        RoleMgr.ins().connectServer();
    }    
    private tpLogout (e:egret.Event) {
        egret.log('SDK退出登录');
        // 登录SDK
        HYTransport.send2Native(HYTransportCode.HY_TP_SDKLOGIN,{
            isIos:0
        });
    }
}
ViewManager.ins().reg(LoginView, LayerManager.UI_Main);
