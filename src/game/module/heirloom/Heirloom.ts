/**
 * 诛仙装备
 */
class Heirloom extends BaseSystem {

	public static UNGET = 0;//不可领取

	public static CANGET = 1;//可领取

	public static ISNGET = 2;//已领取

	/** 寻宝次数 */
	public huntTimes: number = 0;

	/** 寻宝宝箱信息 */
	public huntBoxInfo: number[] = [];

	/** 寻宝祝福值 */
	public huntHope: number = 0;

	/** 寻宝免费次数 */
	public huntFreeTimes: number = 0;

	/** 寻宝记录 */
	public huntRecords = [];

	public constructor() {
		super();
		this.sysId = PackageID.Heirloom;

		this.regNetMsg(1, this.postHeirloomInfo);
		this.regNetMsg(4, this.doHuntBack); //诛仙寻宝结果
		this.regNetMsg(5, this.postHuntRecord); //诛仙寻宝记录
		this.regNetMsg(7, this.postHuntBoxInfo); //诛仙寻宝奖励信息
	}

	public static ins(): Heirloom {
		return super.ins() as Heirloom;
	}

	public checkRedPoint(): boolean {
		//开服三天后才检测红点
		// if( GameServer.serverOpenDay < 2 ){
		// 	return false;
		// }

		// if (GameLogic.IS_OPEN_SHIELD) return false;

		if (UserZs.ins().lv < 3) {
			return false;
		}

		let len: number = SubRoles.ins().subRolesLen;
		let isShow = false;
		for (let i = 0; i < len; i++) {
			let curRole: Role = SubRoles.ins().getSubRoleByIndex(i);
			for (let j = 0; j < 8; j++) {
				let info: HeirloomInfo = curRole.heirloom.getInfoBySolt(j);
				let config: HeirloomEquipFireConfig | HeirloomEquipConfig;
				//已激活
				if (info.lv) {
					// continue;
					config = GlobalConfig.HeirloomEquipConfig[info.slot][info.lv];
				} else {
					config = GlobalConfig.HeirloomEquipFireConfig[j + 1];
				}
				let costItemLen: number = 0;
				let need: number = 0;
				if (config) {
					let expend: { id: number, count: number } = config.expend;
					if (!expend) {
						continue;
					}
					let itemData: ItemData = UserBag.ins().getBagItemById(expend.id);
					costItemLen = itemData ? itemData.count : 0;
					need = expend.count;
					if (costItemLen >= need) {
						isShow = true;
						break;
					}
				}
			}
			if (isShow)
				break;

		}

		return isShow;
	}

	//客户端请求服务器处理
	//============================================================================================
	/**
	 * 请求合成
	 * 55-1
	 * */
	public sendHeirloomAdd(slot: number): void {
		let bytes: GameByteArray = this.getBytes(1);
		bytes.writeByte(slot);
		this.sendToServer(bytes);
	}
	/**
	 * 请求激活
	 * 55-2
	 * */
	public sendHeirloomAct(roleId: number, slot: number): void {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeByte(roleId);
		bytes.writeByte(slot);
		this.sendToServer(bytes);
	}
	/**
	 * 请求升级
	 * 55-3
	 * */
	public upRequest: boolean = false;
	public sendHeirloomUpLevel(roleId: number, slot: number): void {
		let bytes: GameByteArray = this.getBytes(3);
		bytes.writeByte(roleId);
		bytes.writeByte(slot);
		this.upRequest = true;
		this.sendToServer(bytes);
	}

	//服务器数据下发处理
	//============================================================================================
	/**
	 * 下发诛仙装备信息变化 只发送改变的部位
	 * 55-1
	 * */
	public postHeirloomInfo(bytes: GameByteArray): void {
		let roleId: number = bytes.readUnsignedByte();
		let solt: number = bytes.readUnsignedByte();
		let lv: number = bytes.readUnsignedByte();
		let role: Role = SubRoles.ins().getSubRoleByIndex(roleId);
		if (role) {
			role.heirloom.update(solt, lv);
		}
	}

	// /**name 55-x*/
	// public send(): void {
	// 	this.sendBaseProto(x);
	// }

	/**
	 * 55-4
	 * 诛仙寻宝
	 * 0表示寻宝一次，1寻宝10次
	 * 
	 */
	public sendHunt(times: number): void {
		let bytes: GameByteArray = this.getBytes(4);
		bytes.writeByte(times);
		this.sendToServer(bytes);
	}

	/**
	 * 55-5
	 * 诛仙寻宝记录
	 * 
	 */
	public sendHuntRecord(): void {
		this.sendBaseProto(5);
	}

	/**
	 * 55-6
	 * 领取抽奖奖励
	 * 
	 */
	public sendHuntAward(index: number): void {
		let bytes: GameByteArray = this.getBytes(6);
		bytes.writeInt(index);
		this.sendToServer(bytes);
	}

	private doHuntBack(bytes: GameByteArray): void {
		let type = bytes.readUnsignedByte();
		let num = bytes.readUnsignedByte();
		let arr = [];
		for (let i = 0; i < num; i++)
			arr[i] = [bytes.readInt(), bytes.readUnsignedByte()];

		if (ViewManager.ins().getView(HuntResultWin))
			this.postHuntResult(type, arr, 2);
		else {
			ViewManager.ins().open(HuntResultWin, type, arr, 2);
			this.postHuntResult(type, arr, 2);
		}
	}

	public postHuntResult(...params): any[] {
		return params;
	}

	/**
	 * 寻宝记录更新
	 * 
	*/
	public postHuntRecord(bytes: GameByteArray): void {
		this.huntRecords = []
		var num: number = bytes.readUnsignedByte();

		for (let i: number = 0; i < num; i++)
			this.huntRecords[i] = [bytes.readString(), bytes.readInt()];

		this.huntRecords.reverse();
	}

	public postHuntBoxInfo(bytes: GameByteArray): void {
		let state: number = bytes.readInt();
		this.huntTimes = bytes.readInt();
		this.huntHope = bytes.readInt();
		this.huntFreeTimes = bytes.readShort();

		let config: HeirloomTreasureRewardConfig;
		var i: number = 0;
		for (var k in GlobalConfig.HeirloomTreasureRewardConfig) {
			config = GlobalConfig.HeirloomTreasureRewardConfig[k];
			this.huntBoxInfo[i] = ((state >> config.id) & 1) ? Heirloom.ISNGET : (this.huntTimes >= config.needTime ? Heirloom.CANGET : Heirloom.UNGET);
			i++;
		}
	}

	/**是否有可领取宝箱和免费寻宝次数*/
	public getIsGetBox() {
		return this.huntBoxInfo.indexOf(Heirloom.CANGET) != -1 || this.huntFreeTimes > 0;
	}

	/**
	 * 诛仙寻宝是否开启
	*/
	public isHeirloomHuntOpen(): boolean {
		return UserZs.ins().lv >= GlobalConfig.HeirloomTreasureConfig.openZSlevel
			&& GameServer.serverOpenDay >= GlobalConfig.HeirloomTreasureConfig.openDay;
	}

}
namespace GameSystem {
	export let  heirloom = Heirloom.ins.bind(Heirloom);
}