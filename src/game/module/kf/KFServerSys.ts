/**
 * 跨服系统-切换服务器处理
 * @author MPeter
 */
class KFServerSys extends BaseSystem {
	/** 跨服登陆服务器ID*/
	private kfSrvid: number;
	/** 跨服服务器IP*/
	private kfIp: string;//
	/** 跨服服务器端口*/
	private kfPort: number;
	/** 跨服登陆KEY*/
	private kfLoginKey: string;


	/**是否正在连接跨服中 */
	public isLinkingKF: boolean = false;
	/**当前服务器类型 */
	public curServerType: ServerType = ServerType.bsCommSrv;

	public constructor() {
		super();
		this.sysId = PackageID.Login;

		this.regNetMsg(9, this.doSwitchServer);
	}

	public static ins(): KFServerSys {
		return super.ins() as KFServerSys;
	}

	/**连接跨服状态 */
	public linkingKFState(value: boolean): void {
		this.isLinkingKF = value;
		//处理些连接过程中的表现....
		if (value) {
			ViewManager.ins().open(ServerSwitchIngWin);
		}
		else {
			ServerSwitchIngWin.redClose();
		}
	}


	/*
	 *選擇服務器數據
	 */
	private determinSrv(srvId: number, host: string, port: number, loginKey: string, srvType: number): boolean {
		//判断host包含字母时是域名
		let resIndex = host.search("[a-zA-Z]+");
		//与GameSocket的connect方法判断要一致
		let isHttps: boolean = LocationProperty.isWeChatMode || window["paraUrl"].indexOf("https:") != -1;
		
		//host包含字母并且用https链接;host不包含字母并且不用https链接
		if ((resIndex != -1 && isHttps) || (resIndex == -1 && !isHttps)) {
			return true;
		}
		return false;
	}


	/**
	 * 接收切换服务器
	 * 255-9
	 * @param bytes
	 */
	private doSwitchServer(bytes: GameByteArray): void {
		let routeCount = bytes.readInt();
		for (let i = 0;i < routeCount; ++i) {

			//登陆服务器ID
			this.kfSrvid = bytes.readInt();
			//服务器IP
			this.kfIp = bytes.readString();
			//服务器端口
			this.kfPort = bytes.readInt();
			//登陆KEY
			this.kfLoginKey = bytes.readString();
			//登陆服务器类型 
			this.curServerType = bytes.readInt();
			if (this.determinSrv(this.kfSrvid, this.kfIp, this.kfPort, this.kfLoginKey, this.curServerType)) {
				break;
			}
		}

		console.log("255-9  接收连接跨服服务器！ip:" + this.kfIp + " port:" + this.kfPort + "type:" + this.curServerType);

		//开启连接跨服状态
		this.linkingKFState(true);

		//沙城服务器做跨服，收到跨服，立马连接跨服，人多会有问题，所以做延迟2秒再连接
		TimerManager.ins().doTimer(2000, 1, this.connectKFServer, this);
	}


	/**
	 * 开始处理跨服登录
	 * 255-9
	 */	
	public sendKFLogin(): void {
		let bytes: GameByteArray = this.getBytes(9);
		bytes.writeInt(Actor.actorID);
		bytes.writeString(this.kfLoginKey);
		bytes.writeString(LocationProperty.pf);
		this.sendToServer(bytes);
	}

	/**是否为跨服场景 特殊场景都定位跨服*/
	public get isKF(): boolean {
		return this.isKFServ || KFBossSys.ins().isKFBossBattle || KfArenaSys.ins().isKFArena || DevildomSys.ins().isDevildomBattle;
	}

	/**是否为跨服服务器 */
	public get isKFServ(): boolean {
		return this.curServerType > ServerType.bsCommSrv;
		// return this.kfSrvid != LocationProperty.srvid;
	}

	/**
	 * 连接跨服服务器
	 */
	private connectKFServer(): void {
		//先断开服务器
		GameSocket.ins().close();
		GameSocket.ins().newSocket();


		//重新连接服务器
		if (!GameSocket.ins().getSocket().connected) {
			debug.log(`kf connect to ${this.kfIp} ,port: ${this.kfPort}`);
			console.log("重新连接跨服服务器！ip:" + this.kfIp + " port:" + this.kfPort);
			GameSocket.ins().connect(this.kfIp, this.kfPort);
		} else {
			console.log("开始登陆跨服服务器！ip:" + this.kfIp + " port:" + this.kfPort);
			this.sendKFLogin();
		}


		//通知开始跨服
		WJBattlefieldSys.postSwitchServer();

	}

	/**通知关闭socket*/
	public closeSocket(): void {
		//重置回本服
		this.curServerType = ServerType.bsCommSrv;
		this.kfSrvid = LocationProperty.srvid;

	}

	/**假如在跨服战场场景中*/
	public checkIsKFBattle(tips?: string): boolean {
		if (this.isKF && tips) UserTips.ins().showTips(tips);
		return this.isKF;
	}
}


/////////////////////////////////////////////////////////
/**服务器类型 */
enum ServerType {
	/**普通服 */
	bsCommSrv = 0,
		/**战斗服 */
	bsBattleSrv = 1,
		/**主战斗服 */
	bsMainBattleSrv = 2,
		/**连服 */
	bsLianFuSrv = 3
}