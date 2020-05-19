/**
 *
 * @author
 *
 */
class EquipsData {

	/** 强化等级 */
	public strengthen: number;
	/** 附灵等级*/
	public spiritLv: number;
	/** 星级 */
	public star: number;
	/** 宝石等级 */
	public gem: number;
	/** 对应的带锯 */
	public item: ItemData;
	/**注灵等级**/
	public zhuling: number;
	/** 突破等级(没有这个功能了) */
	public tupo: number;
	/** 开光 */
	public bless: number;
	/** 附灵经验*/
	public spiritExp: number;

	public soulLv: number;
	//------------------保留数值，待后作用-------------------	
	/** 保留数字2 */
	public num2: number;

	public parser(bytes: GameByteArray): void {
		this.strengthen = bytes.readInt();

		this.spiritLv = bytes.readInt();
		this.gem = bytes.readInt();

		this.item = new ItemData;
		this.item.parser(bytes);

		this.zhuling = bytes.readInt();
		this.soulLv = bytes.readInt();
		this.bless = bytes.readInt();
		this.spiritExp = bytes.readInt();
	}
}
