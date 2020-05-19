/** 威望排行数据 */
class RankDataWeiWang extends RankDataBase{
	
	public level: number;
	public zslevel: number;
	public viplevel: number;
	public monthCard:number;
	public weiWang:number;

	public constructor() {
		super();
	}

	public parser(bytes:GameByteArray, items:string[])
	{
		this.pos = bytes.readShort();
		this.id = bytes.readInt();
		this.player = bytes.readString();
		this.level = bytes.readShort();
		this.zslevel = bytes.readShort();
		this.viplevel = bytes.readShort();
		this.monthCard = bytes.readShort();
		this.weiWang = bytes.readInt();
	}
}