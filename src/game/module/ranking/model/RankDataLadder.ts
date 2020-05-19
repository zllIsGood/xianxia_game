/**
 * 王者排行榜数据类型
 */
class RankDataLadder extends RankDataBase{
	public challgeLevel: number;
	public challgeId: number;
	public winNum: number;
	public job:number;
	public sex:number;

	public constructor() {
		super();
	}

	public parser(bytes:GameByteArray, items:string[])
	{
		this.id = bytes.readInt();
		this.player = bytes.readString();
		this.challgeLevel = bytes.readInt();
		this.challgeId = bytes.readInt();
		this.winNum = bytes.readInt();
		this.job = bytes.readByte();
		this.sex = bytes.readByte();
		this.sex = this.job == JobConst.ZhanShi ? 0 : 1;
	}
}