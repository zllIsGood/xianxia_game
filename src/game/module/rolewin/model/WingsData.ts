/**
 *
 * @author
 *
 */
class WingsData {

	public lv: number;	   //等级

	public exp: number;		 //当前经验

	public openStatus: number = 0;	//是否激活（0未，1已）

	public clearTime: number = 0;

	public equipdata: EquipsData[];//翅膀装备
	public aptitudeDan:number = 0; //资质丹
	public flyUpDan:number = 0; //飞升丹

	/**通过索引获取翅膀装备 */
	public getEquipByIndex(index: number): EquipsData {
		return this.equipdata[index];
	}

	public get equipsLen(): number {
		return this.equipdata.length;
	}

	public parser(bytes: GameByteArray): void {
		this.parserBoost(bytes);
		this.parserOpenStatus(bytes);
		this.parserClearTime(bytes);
		this.parserDans(bytes);
	}

	public parserBoost(bytes: GameByteArray): void {
		this.lv = bytes.readInt();
		this.exp = bytes.readUnsignedInt();
	}

	public parserOpenStatus(bytes: GameByteArray): void {
		this.openStatus = bytes.readInt();
	}

	public parserClearTime(bytes: GameByteArray): void {
		this.clearTime = bytes.readUnsignedInt();
	}

	/** 飞升丹和资质丹 */
	public parserDans(bytes:GameByteArray):void
	{
		this.aptitudeDan = bytes.readShort();
		this.flyUpDan = bytes.readShort();
	}

	public parserWingEqupip(bytes: GameByteArray): void {
		this.equipdata = [];
		let equip: EquipsData;
		for (let i: number = 0; i < 4; i++) {
			equip = new EquipsData();
			equip.parser(bytes);
			this.equipdata.push(equip);
		}
	}

	public getImgSource(): string {
		if (this.lv > Wing.WingMaxLv || this.lv < 0) return "wing00_png";
		return GlobalConfig.WingLevelConfig[this.lv].appearance + "_png";
	}

	public static getWingAllLevel(): number {
		let sumlevel = 0;
		let len: number = SubRoles.ins().subRolesLen;
		for (let i = 0; i < len; i++) {
			let data: WingsData = SubRoles.ins().getSubRoleByIndex(i).wingsData;
			sumlevel += data.lv;
			if (data.openStatus)//已激活要+1处理一下
				sumlevel += 1;

		}
		return sumlevel;
	}
}