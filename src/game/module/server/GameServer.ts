class GameServer extends BaseSystem{
	/** 服务器id */
	public static serverID: number;
	/**服务器开服第几天 0是第一天 以此类推*/
	public static serverOpenDay: number;

	/** 服务器当前时间点(不会即时，一般情况调用serverTime) 毫秒 1970年开始*/
	public static _serverTime: number;
	/** 服务器开服的当前时间0点 秒 2010年开始*/
	public static _serverZeroTime: number;
	/** 服务器合服的当前时间0点 秒 2010年开始*/
	public static _serverHeZeroTime: number;
	/** 第N次合服 */
	public static _hefuCount: number;
	/**是否开启连服*/
	public static isOpenLF: boolean;

	public static ins(): GameServer {
		return super.ins() as GameServer;
	}

	public constructor() {
		super();
		this.sysId = PackageID.Default;

		this.regNetMsg(23, this.doGetOpenServer);
		this.regNetMsg(14, this.doServerTime);
	}

	/** 获取服务器当前时间从1970年开始的(即时) */
	public static get serverTime(): number {
		return GameServer._serverTime + egret.getTimer();
	}
	public static setServerTime(t: number) {
		GameServer._serverTime = DateUtils.formatMiniDateTime(t) - egret.getTimer();
	}

	private doGetOpenServer(bytes: GameByteArray): void {
		GameServer.serverOpenDay = bytes.readInt();
		GameServer._serverZeroTime = bytes.readInt();
		GameServer._serverHeZeroTime = bytes.readInt();
		GameServer._hefuCount = bytes.readInt();
		GameServer.isOpenLF = bytes.readBoolean();
	}

	public postServerOpenDay():void
	{
		
	}

	/**
	 * 处理服务器时间
	 * 0-14
	 * @param bytes
	 */
	private doServerTime(bytes: GameByteArray): void {
		GameServer.setServerTime(bytes.readUnsignedInt());
	}
}

namespace GameSystem {
	export let  gameServer = GameServer.ins.bind(GameServer);
}
