/**
 * 入口Main文件
 */

class Main extends eui.UILayer {

	protected createChildren(): void {
		super.createChildren();

		egret.Logger.logLevel = egret.Logger.ALL;

		LocationProperty.init();
		
		if (LocationProperty.isWeChatMode) {
			platform.init(WxTool.onShow, WxTool.onHide);
			LocationProperty.pf = platform.getPt() as string;
			HYDefine.init();
		}
		
		let soundMgr = SoundManager.ins();
		egret.lifecycle.onPause = function () {
			soundMgr.setEffectOn(false);
		}

		egret.lifecycle.onResume = function () {
			soundMgr.setEffectOn(SysSetting.ins().getBool(SysSetting.SOUND_EFFECT));
		}

		// 设置跨域访问资源
		egret.ImageLoader.crossOrigin = "anonymous";

		HYTransport.init();

		HYTransport.showStatusBar(true);
		

		if (LocationProperty.isVivoMode) {
			let loadingView = new EgretLoading();
			window["EgretLoadingView"] = loadingView;
			this.addChild(loadingView);
		}

		// 注入自定义的素材解析器
		this.stage.registerImplementation("eui.IAssetAdapter", new AssetAdapter());
		this.stage.registerImplementation("eui.IThemeAdapter", new ThemeAdapter());

		if (LocationProperty.isWeChatMode) {
			RES.setMaxLoadingThread(2);
		} else if (DeviceUtils.IsNative) {
			RES.setMaxLoadingThread(4);
		} else {
			RES.setMaxLoadingThread(8);
		}

		//适配方式
		if (DeviceUtils.IsPC) {
			// StageUtils.ins().setScaleMode(egret.StageScaleMode.SHOW_ALL);
			StageUtils.ins().getStage().orientation = egret.OrientationMode.AUTO;
		}
		// if (navigator.userAgent.indexOf("iPad") != -1) {
		// 	StageUtils.ins().getStage().orientation = egret.OrientationMode.AUTO;
		// }

		this.runGame().catch(e => {
			console.log(e);
		})
	}
	
	private onGetComplete(e: egret.Event) {
		console.log(e);
	}

	private async runGame() {
		FixUtil.fixAll();		
		
		if (!LocationProperty.isNotNativeMode){
			GameApp.ins().sdkLogin();
		}

		if ((LocationProperty.isWeChatMode || LocationProperty.isVivoMode) && !DEBUG) {

			if (LocationProperty.isWeChatMode) {
				// 先读本地 for wxgame
				let localFileJson = "inner.res.json";
				await RES.loadConfig("resource/" + localFileJson, "resource/");
			}

			let serverList = await platform.login(); 
			LocationProperty.openID = serverList.openId;
			LocationProperty.v = serverList.v;
			HYTransport.dispatchEvent("HY_TP_SRVLIST", serverList);
		}  

		// 华为小游戏
		if (LocationProperty.isHuaweiMode) {
			hw_gameLogin({"appid":"100535857","forceLogin":"1"}, (data) => {
				LocationProperty.openID = data.openId;
				LocationProperty.v = data.v;
				HYTransport.dispatchEvent("HY_TP_SRVLIST", data);
			});
		}

		// 上报胡莱平台开始加载
		ReportData.getIns().hoolaiReportGameInfo(1);

		await ResVersionManager.ins().loadConfig();
		
		loadingText("加载资源配置", 60);
		platform.setLoadingProgress("加载资源配置...",1,5);
		let resFileJson = "default.res.json";
		await RES.loadConfig(`${RES_RESOURCE}` + resFileJson, `${RES_RESOURCE}`);

		//console.log('load theme');
		// loadingText("加载皮肤配置", 70);
		// platform.setLoadingProgress("加载皮肤配置...",2,5);
		// await this.loadTheme();
	
		// TODO 内部还需要进一步拆分
		await GameApp.ins().load();

        HYTransport.send2Native(HYTransportCode.HY_TP_LOADED);
		
	}

	private loadTheme() {
        return new Promise((resolve, reject) => {
            // load skin theme configuration file, you can manually modify the file. And replace the default skin.
            // 加载皮肤主题配置文件,可以手动修改这个文件。替换默认皮肤。
            let theme = new eui.Theme(`${RES_RESOURCE}gameEui.json`, this.stage);
            theme.addEventListener(eui.UIEvent.COMPLETE, () => {
                resolve();
            }, this);

        });
    }


	public static closesocket(): void {
		GameSocket.ins().close();
	}
}