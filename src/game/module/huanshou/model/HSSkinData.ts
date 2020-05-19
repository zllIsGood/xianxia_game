class HSSkinData {
	public id:number;
	public rank:number = -1;
	public exp:number;
	public talentLv:number;
	public trainCount:number;
	public constructor() {
	}
	public update(bytes: GameByteArray):void {
		this.id = bytes.readInt();
		this.rank = bytes.readInt();
		this.exp = bytes.readInt();
		this.trainCount = bytes.readInt();
		this.talentLv = bytes.readInt();
	}
}