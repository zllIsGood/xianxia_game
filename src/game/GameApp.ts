/**
 * @author
 */
class GameApp extends BaseClass {
	public classList: {[index:string]: any} = {};
	public preload_load_count: number = 0;

	public constructor() {
		super();
	}

	static ins(): GameApp {
		return super.ins() as GameApp;
	}

	public load(): Promise<any> {
		//console.log('load game');

		return new Promise((resolve,reject) => {
			loadingText("预加载资源", 80);
			ResourceUtils.ins().loadGroup("preload", ()=>{
				if (LocationProperty.isFirstLoad) {
					ResourceUtils.ins().loadGroup("firstLoad", this.loadConfig, this.progress, this);
				}
				else {
					this.loadConfig();
				}
				resolve();
			}, (current,total,res)=>{
				platform.setLoadingProgress(`预加载资源:${Math.ceil(current/total*100)}%`,3,5);
				// console.log(`cur:${current}, total:${total}`);
			}, this);
		});
	}

	// 正式服加载压缩过的config.json
	private loadConfig(): void {
		//console.log('load config');
		let confUrl: string = `${RES_RESOURCE}config/config.json`;
		let isZip = LocationProperty.isZipLoad;
		// isZip = LocationProperty.isWeChatMode?false:isZip; // 小程序版本暂不加载zip
		confUrl = isZip?confUrl+'.cfg':confUrl;
		
		loadingText("加载配置文件", 90);
		platform.setLoadingProgress("加载配置文件...",4,5);
		RES.getResByUrl(confUrl, function (e: any) {
			if (isZip) {
				JSZip.loadAsync(e).then((zip) => {
	                return zip.file("config.json").async("text");
	            }).then((data) => {
					
	            	GlobalConfig.init(JSON.parse(data));
	            	this.complete();
	            });
			}
			else {
				GlobalConfig.init(e);
				this.complete();
			}
		}, this, isZip?RES.ResourceItem.TYPE_BIN:RES.ResourceItem.TYPE_JSON);
	}

	/**
	 * 资源组加载完成
	 */
	private complete(): void {
		//console.log('load complete');
		// 加载system
		this.loadGameSystem();

		loadingText("加载地图配置", 95);
		platform.setLoadingProgress("加载地图配置...",5,5);
		RES.getResByUrl(`${MAP_DIR}maps.json`, (data) => {

			if (Assert(data, `GameApp do complete error: ${MAP_DIR}maps.json cant get data`)) {
				this.complete();
				return;
			}

			if (!LocationProperty.isWeChatMode
				&& !LocationProperty.isHuaweiMode
				&& !LocationProperty.isVivoMode) {
				ReportData.getIns().report('loaded', ReportData.LOAD);
				// 上报胡莱平台加载完成
				ReportData.getIns().hoolaiReportGameInfo(2);
			}
			
			//地图网格初始化
			GameMap.init(data);
			//音乐音效处理
			SoundManager.ins().setEffectOn(true);

			// 区分登录方式
			if ((!LocationProperty.isNotNativeMode || !LocationProperty.openID) && !DEBUG) {
				SceneManager.ins().runScene(LoginScene);
				HYTransport.showWebview();
				platform.showLoginView();
			}
			else{
				RoleMgr.ins().connectServer();
			}

			eui.Label.default_fontFamily = "微软雅黑";

			RoleAI.ins().init();

			GameApp.ins().postPerLoadComplete();

			loadingText("进入游戏", 100);
			if (LocationProperty.isVivoMode && window["EgretLoadingView"]) {
				window["EgretLoadingView"].enterGame();
				window["EgretLoadingView"] = null;
			}
			
			if (window["showLoadingView"]) {
				window["showLoadingView"](false);
			}
		}, this);
	}

	public sdkLogin(): void {
		/**
		 * sdk登录: 
		 * 		1.js->oc,tpcode:HYTransportCode.HY_TP_SDKLOGIN // js通知oc，sdk开始登录
		 * 		2.oc->js,tpcode:HYTransportCode.HY_TP_SRVLIST // oc主动通知js服务器列表，显示服务器选择界面
		 * 		3.js->oc,tpcode:HYTransportCode.HY_TP_SRVCHOOSE // js通知oc选择的服务器ID
		 * 		4.oc->js,tpcode:HYTransportCode.HY_TP_SDKLOGIN // oc通知js，sdk登录完成，可以进入游戏
		 */
		// egret.log('通过微端SDK登录');
		// 获取服务器列表
		HYTransport.addNativeEventListener("HY_TP_SRVLIST",function (e:egret.Event) {
			// egret.log('服务器列表返回');
			// console.log(e.data);
			LocationProperty.weiduanSrvList = e.data;
		},this);
		HYTransport.addNativeEventListener("HY_TP_SDKLOGIN",function (e:egret.Event) {
            // egret.log('SDK登录完成');
			// console.log(e.data);
            LocationProperty.weiduanSdkData = e.data;
        },this);
        HYTransport.addNativeEventListener("HY_TP_ENTERGAME",function (e:egret.Event) {
            // egret.log('通知进入游戏');
			// console.log(e.data);
			LocationProperty.init(e.data.flashUrl);
        },this);
		HYTransport.addNativeEventListener("HY_TP_PAYSUCCESS",function (e:egret.Event) {
            // egret.log('支付成功');
			Recharge.ins().removePayWarn();
        },this);
		HYTransport.addNativeEventListener("HY_TP_PAYFAIL",function (e:egret.Event) {
            // egret.log('支付失败');
			// console.log(e.data.msg);
			Recharge.ins().removePayWarn();
			WarnWin.show("充值失败，请重新充值", function () { }, this);
        },this);

		// 登录SDK
		HYTransport.send2Native(HYTransportCode.HY_TP_SDKLOGIN,{
			isIos:1
		});
	}

	/**
	 * 资源组加载进度
	 */
	private progress(itemsLoaded: number, itemsTotal: number): void {
	}

	public postPerLoadProgress(itemsLoaded: number, itemsTotal: number): number[] {
		return [itemsLoaded, itemsTotal];
	}

	//这里不直接用post是因为有可能组内有加载项失败
	//如果失败可以在这里处理之后在post
	public doPerLoadComplete() {
		this.postPerLoadComplete();
	}

	public postPerLoadComplete() {
	}

	public postLoginInit(): void {
	}

	public postZeroInit(): void {
	}

	private loadGameSystem(): void {
		// console.log('load system');
		for (let i in GameSystem) {
			GameSystem[i]();
		}
	}
}

MessageCenter.compile(GameApp);