/**
 * 组队副本玩家信息
 * @author wanghengshuai
 * 
 */
class TeamFuBenRoleVo {
	
	public roleID:number;

	/** 1.队长,2.协助,3.同伙 */
	public position:number;

	public roleName:string;

	public job:number;

	public sex:number;

	public cloth:number;

	public weapon:number;

	public wingLv:number;

	public wingState:number;

	public pos1:number;

	public pos2:number;

	public pos3:number;

	public pos4:number;

	public zs:number;

	public lv:number;

	public gh:string;

	public constructor() {
	}

	public parse(bytes:GameByteArray):void
	{
		this.roleID = bytes.readInt();
		this.position = bytes.readByte();
		this.roleName = bytes.readString();
		this.job = bytes.readByte();
		this.sex = bytes.readByte();
		this.cloth = bytes.readInt();
		this.weapon = bytes.readInt();
		this.wingLv = bytes.readInt();
		this.wingState = bytes.readByte();
		this.pos1 = bytes.readInt();
		this.pos2 = bytes.readInt();
		this.pos3 = bytes.readInt();
		this.pos4 = bytes.readInt();
		this.zs = bytes.readInt();
		this.lv = bytes.readInt();
		this.gh = bytes.readString();
	}
}