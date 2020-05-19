class ChatInfoData extends ChatDataBase {
	public type: number = 0;
	public id: number = 0;
	public name: string = "";
	public servId:number = 0;
	public job: number = 0;
	public sex: number = 0;
	public vip: number = 0;
	public monthCard: number = 0;
	public ladderLevel: number = 0;
	public pointId: number = 0;
	public str: string = "";
	public isFirst: number = 0;
	public zsLevel: number = 0;
	public lv: number = 0;
	public guild: string = ``;
	public titleId:number = 0;
	public constructor(bytes: GameByteArray = null) {
		super();
		if (bytes) {
			this.type = bytes.readByte();
			this.id = bytes.readUnsignedInt();
			this.name = bytes.readString();
			this.job = bytes.readByte();
			this.sex = bytes.readByte();
			this.sex = this.job == JobConst.ZhanShi ? 0 : 1;
			this.vip = bytes.readByte();
			this.monthCard = bytes.readByte();
			this.ladderLevel = bytes.readByte();
			this.isFirst = bytes.readByte();
			this.zsLevel = bytes.readUnsignedByte();
			this.lv = bytes.readShort();
			this.guild = bytes.readString();
			this.pointId = bytes.readUnsignedInt();
			this.str = bytes.readString();
			this.servId = bytes.readInt();
		}
	}
}