class GuildMessageInfo {
	public type: number;
	public content: string;
	public roleId: number;
	public name: string;
	public job: number;
	public sex: number;
	public vipLevel: number;
	public monthCard: number;
	public office: number;
	public zsLevel: number;
	public lv: number;
	public titleId: number;
	public guildName: string;
	public constructor() {
	}

	public parserMessage(bytes: GameByteArray) {
		this.type = bytes.readUnsignedByte();
		this.content = bytes.readString();
		//仙盟聊天才有一下内容
		if (this.type == 1) {
			this.roleId = bytes.readInt();
			this.name = bytes.readString();
			this.job = bytes.readUnsignedByte();
			this.sex = bytes.readUnsignedByte();
			this.sex = this.job == JobConst.ZhanShi ? 0 : 1;
			this.vipLevel = bytes.readInt();
			this.monthCard = bytes.readUnsignedByte();
			this.office = bytes.readUnsignedByte();
			this.zsLevel = bytes.readUnsignedByte();
			this.lv = bytes.readShort();
			this.guildName = bytes.readString();
		}
	}
}