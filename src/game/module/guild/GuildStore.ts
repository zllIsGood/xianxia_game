/**
 * 仙盟商店数据
 */
class GuildStore extends BaseSystem {

	public guildStoreLv: number = 0;//仙盟商店等级
	public guildStoreNum: number = 0;//仙盟商店已使用次数

	private _recordInfoAry: GuildStoreRecordInfo[] = [];//抽奖记录

	private _guildStoreItemData: GuildStoreItemData[] = [];//箱子数据

	private _recordInfo: GuildStoreRecordInfo;//开箱记录

	public constructor() {
		super();

		this.sysId = PackageID.GuildStore;
		this.regNetMsg(1, this.postGuildStoreInfo);
		this.regNetMsg(2, this.postGuildStoreBoxInfo);
		this.regNetMsg(3, this.postGuildStoreBox);
	}

	public static ins(): GuildStore {
		return super.ins() as GuildStore;
	}

	/**抽奖记录 GuildStoreRecordInfo*/
	public getRecordInfoAry(index: number = -1): any {
		return index == -1 ? this._recordInfoAry : this._recordInfoAry[index];
	}

	/**箱子数据 GuildStoreItemData*/
	public getGuildStoreItemData(index: number = -1): any {
		return index == -1 ? this._guildStoreItemData : this._guildStoreItemData[index];
	}

	//仙盟商店信息
	public postGuildStoreInfo(bytes: GameByteArray): void {
		this.guildStoreLv = bytes.readByte();
		this.guildStoreNum = bytes.readByte();
	}

	//仙盟宝箱记录
	public postGuildStoreBoxInfo(bytes: GameByteArray): void {
		let num: number = bytes.readByte();
		for (let i: number = 0; i < num; i++) {
			let info: GuildStoreRecordInfo = new GuildStoreRecordInfo();
			info.times = bytes.readInt();
			info.roleName = bytes.readString();
			info.itemId = bytes.readInt();
			if (this._recordInfoAry.length >= 50)
				this._recordInfoAry.pop();
			this._recordInfoAry.unshift(info);
		}
	}

	//仙盟宝箱结果
	public postGuildStoreBox(bytes: GameByteArray): void {
		let num: number = bytes.readByte();
		this._guildStoreItemData = [];
		for (let i: number = 0; i < num; i++) {
			let info: GuildStoreItemData = new GuildStoreItemData();
			info.itemId = bytes.readInt();
			info.num = bytes.readInt();
			this._guildStoreItemData.push(info);
		}
		this.guildStoreNum -= 1;
	}

	//添加宝箱记录
	private doGuildStoreAddBoxInfo(bytes: GameByteArray): void {
		this._recordInfo = new GuildStoreRecordInfo();
		this._recordInfo.roleName = bytes.readString();
		this._recordInfo.itemId = bytes.readInt();
	}

	//获取仙盟商店信息
	public getGuildStoreInfo(): void {
		this.sendBaseProto(1);
	}

	//请求开箱记录
	public sendGuildStoreBoxInfo(): void {
		let bytes: GameByteArray = this.getBytes(2);
		if (this._recordInfoAry == null || this._recordInfoAry.length == 0) {
			bytes.writeInt(0);
		} else {
			bytes.writeInt(this.getRecordInfoAry(0).times);
		}
		this.sendToServer(bytes);
	}

	//发送开箱请求
	public sendGuildStoreBox(): void {
		this.sendBaseProto(3);
	}
}

namespace GameSystem {
	export let  guildstore = GuildStore.ins.bind(GuildStore);
}