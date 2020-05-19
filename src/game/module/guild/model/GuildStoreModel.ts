/*仙盟商店*/
class GuildStoreModel {
	public guildStoreLv: number = 0;//仙盟商店等级
	public guildStoreNum: number;//仙盟商店已使用次数

	public recordInfoAry: GuildStoreRecordInfo[] = [];//抽奖记录

	public guildStoreItemData: GuildStoreItemData[];//箱子数据

	public recordInfo: GuildStoreRecordInfo;//开箱记录

	public recordMax: number = 50;
	public constructor() {
	}

	parserBaseInfo(bytes: GameByteArray): void {
		this.guildStoreLv = bytes.readByte();
		this.guildStoreNum = bytes.readByte();
	}

	parserRecordInfo(bytes: GameByteArray): void {
		let num: number = bytes.readByte();
		let tArray: GuildStoreRecordInfo[] = [];
		let info: GuildStoreRecordInfo;
		if (this.recordInfoAry!=null&&this.recordInfoAry.length>0&&this.recordInfoAry.length+num > this.recordMax)
		{
			let tNum:number = this.recordMax-num>0 ? this.recordMax-num :0;
			this.recordInfoAry.length = tNum;
		}
		for (let i:number = 0; i < num; i++) 
		{
			info = new GuildStoreRecordInfo();
			info.times = bytes.readInt();
			info.roleName = bytes.readString();
			info.itemId = bytes.readInt();
			tArray.push(info);
		}
		this.recordInfoAry = tArray.concat(this.recordInfoAry);
	}

	parserBoxItemInfo(bytes: GameByteArray): void {
		let num: number = bytes.readByte();
		this.guildStoreItemData = [];
		for (let i: number = 0; i < num; i++) {
			let info: GuildStoreItemData = new GuildStoreItemData();
			info.itemId = bytes.readInt();
			info.num = bytes.readInt();
			this.guildStoreItemData.push(info);
		}
	}
	parserRecord(bytes: GameByteArray): void {
		this.recordInfo = new GuildStoreRecordInfo();
		this.recordInfo.roleName = bytes.readString();
		this.recordInfo.itemId = bytes.readInt();
	}
}