/*
    file: src/game/login/LoginServerListView.ts
    date: 2018-9-10
    author: solace
    descript: 选服界面
*/

class LoginServerListView extends BaseEuiView {
	/** 控件 */
    private serverList: eui.List;
    private lstSrvPart: eui.List;
    private btnClose: eui.Button;

    private selectSrvItem: LoginServerItem;
    private loginServerList: eui.ArrayCollection;

    private currentIndex: number = 0;

    private srvListData: {}[] = [
            // {name:'测试服',server_id:'60010',route_ip:'s1ftznh5.hulai.com',route_port:'10012',server_status:'1'}, // 玩吧体验服
            {name:'测试服',server_id:'1',route_ip:'139.199.59.117',route_port:'8010',server_status:'1'},
            // {name:'内网1',server_id:'1',route_ip:'192.168.1.7',route_port:'8010',server_status:'1'},
            // {name:'外网999',server_id:'999',route_ip:'150.109.56.202',route_port:'9001',server_status:'1'}
        ];

	constructor() {
		super();
		this.skinName = "WxServerListSkin";
	}

	public initUI(): void {
        super.initUI();
        
        this.serverList.useVirtualLayout = false;
        this.serverList.itemRenderer = LoginServerItem;
        this.serverList.addEventListener(eui.ItemTapEvent.ITEM_TAP,this.onItemClick,this);

        this.lstSrvPart.itemRenderer = LoginServerBtnItem;
        this.lstSrvPart.addEventListener(eui.ItemTapEvent.ITEM_TAP,this.handleServerBtnItemTapped,this);
        this.lstSrvPart.dataProvider = new eui.ArrayCollection([{name: "最近登录"}, {name: "1 - 100区"}]);
	}

	public open(...param: any[]): void {
        this.addTouchEvent(this.btnClose,function () {
            this.closeWin();
        })

        this.setSrvList();
	}

    public close(...param: any[]): void {

	}

	public playUIEff(...param: any[]): void {
	}

    private setSrvList(): void {
        this.srvListData = LocationProperty.weiduanSrvList?LocationProperty.weiduanSrvList.lastserver.last_server:this.srvListData;
        // 这里使用Object.create是因为需要用到深拷贝
        this.loginServerList = new eui.ArrayCollection(Object.create(this.srvListData));
        this.serverList.dataProvider = this.loginServerList;
    }

    private onItemClick(e: eui.ItemTapEvent): void{
        // console.log(e.itemRenderer.data);
        this.chooseServer(e.itemRenderer as LoginServerItem);
    }

    private handleServerBtnItemTapped(e: eui.ItemTapEvent): void {

        if (this.currentIndex == 0) {
            this.currentIndex = 1;
            if (LocationProperty.weiduanSrvList.serverlist) {
                this.loginServerList.replaceAll(Object.create(LocationProperty.weiduanSrvList.serverlist));   
            }
        } else {
            this.currentIndex = 0;
            if (this.srvListData) {
                this.loginServerList.replaceAll(Object.create(this.srvListData));   
            }
        }
    }

    private chooseServer(item: LoginServerItem): void {

        if (item.data.server_status == 3) { // 正在维护
            WarnWin.show("\n\n<font color='#f3311e'>系统维护中...</font>", () => {
            }, this, null, null, "sure");
        } else {
            this.selectSrvItem = item;

            let view = ViewManager.ins().getView(LoginView) as LoginView;
            if (view) {
                view.chooseServer(item.data);
            }

            this.closeWin();
        }
    }

}
ViewManager.ins().reg(LoginServerListView, LayerManager.UI_Main);
