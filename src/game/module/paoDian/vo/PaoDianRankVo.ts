/** 泡点排行数据 */
class PaoDianRankVo {

	/** 名次 */
	public rank:number;

	/** 玩家名字 */
	public roleName:string;

	/** 仙盟名字 */
	public unionName:string;

	/** 总神兵经验 */
	public shenBingExp:number;

	/** 总玉佩碎片数量 */
	public jadeChips:number;

	public constructor(bytes:GameByteArray) 
	{
		this.rank = bytes.readShort();
		this.roleName = bytes.readString();
		this.unionName = bytes.readString();
		this.shenBingExp = bytes.readInt();
		this.jadeChips = bytes.readInt();
	}
}