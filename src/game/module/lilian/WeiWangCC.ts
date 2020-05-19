class WeiWangCC extends BaseSystem {

	/** 可以找回的威望值 */
	private _weiWangBack: number = 0;
	public constructor() {
		super();

		this.sysId = PackageID.WeiWang;
		this.regNetMsg(1, this.postWeiWangBack);

	}

	public static ins(): WeiWangCC {
		return super.ins() as WeiWangCC;
	}

	/**
	 * 66-1
	 * 可以找回的威望变更
	 * 
	*/
	public postWeiWangBack(bytes: GameByteArray): void {
		this._weiWangBack = bytes.readInt();
	}

	/** 获得可以找回的威望值 */
	public get weiWangBack(): number {
		return this._weiWangBack;
	}

	/**
	 * 66-2
	 * 找回威望
	*/
	public sendFindWeiWang(): void {
		this.sendBaseProto(2);
	}

	/** 获得威望配置 
	 * @param wei:number 威望值
	*/
	public getWeiWangCfg(wei: number): PrestigeLevel {
		let len: number = Object.keys(GlobalConfig.PrestigeLevel).length;
		for (let i: number = 1; i <= len; i++) {
			if (wei < GlobalConfig.PrestigeLevel[i].exp)
				return GlobalConfig.PrestigeLevel[i - 1];
		}

		return GlobalConfig.PrestigeLevel[wei ? len : 1];
	}

	/** 威望系统是否开启 */
	public get isOpen(): boolean {
		return (Actor.level >= GlobalConfig.PrestigeBase.openLevel
			&& GameServer.serverOpenDay >= GlobalConfig.PrestigeBase.openDay - 1);
	}
}

namespace GameSystem {
	export let  weiWang = WeiWangCC.ins.bind(WeiWangCC);
}
