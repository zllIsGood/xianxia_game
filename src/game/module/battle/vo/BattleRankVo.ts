class BattleRankVo {

	public rank:number;

	public camp:number;

	public roleName:string;

	public unionName:string;

	public score:number;

	public parse(bytes:GameByteArray):void
	{
		this.rank = bytes.readShort();
		this.camp = bytes.readShort();
		this.roleName = bytes.readString();
		this.unionName = bytes.readString();
		this.score = bytes.readInt();
	}
}