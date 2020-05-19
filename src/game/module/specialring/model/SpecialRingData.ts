class SpecialRingData {
	public id: number = 0;
	public level: number = 0;
	public exp: number = 0;
	public fight: number = 0;
	public order: number = 0;
	public isUnLock: number = 0;
	constructor() {
	}

	public parser(bytes: GameByteArray): void {
		this.id = bytes.readShort();
		this.level = bytes.readShort();
		this.exp = bytes.readInt();
		this.fight = bytes.readByte();
		this.isUnLock = bytes.readByte();
		this.order = GlobalConfig.ActorExRingConfig[this.id].order;
	}
}