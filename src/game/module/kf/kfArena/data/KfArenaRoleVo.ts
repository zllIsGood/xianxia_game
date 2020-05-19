/**
 * 跨服竞技场玩家信息
 * @author yuyaolong
 * 
 */
class KfArenaRoleVo {

	public roleID: number;

	public roleName: string;

	public job: number;

	public sex: number;

	public cloth: number;

	public weapon: number;

	public wingLv: number;

	public wingState: number;

	public pos1: number;

	public pos2: number;

	public pos3: number;

	public zs: number;

	public lv: number;

	public isonline: boolean;

	public duanLevel: number;

	public score: number;

	public curMonth: kfArenaMark = new kfArenaMark();

	public history: kfArenaMark = new kfArenaMark();

	public power: number = 0;

	public winRate: number = 0;

	public serverId: number;

	public constructor() {
	}

	public parse(bytes: GameByteArray): void {
		this.roleID = bytes.readInt();
		this.serverId = bytes.readInt();
		this.isonline = bytes.readInt() != 0;
		this.duanLevel = bytes.readInt();
		this.score = bytes.readInt();
		this.curMonth.parse(bytes);
		this.history.parse(bytes);
		this.power = bytes.readInt();
		this.winRate = bytes.readInt()/100 >> 0;
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
		this.zs = bytes.readInt();
		this.lv = bytes.readInt();
	}

	/** 是否为队长*/
	public isLeader(): boolean {
		return KfArenaSys.ins().leaderID == this.roleID;
	}
}

class kfArenaMark {
	public win: number;
	public fail: number;
	public ping: number;

	public parse(bytes: GameByteArray): void {
		this.win = bytes.readInt();
		this.ping = bytes.readInt();
		this.fail = bytes.readInt();
	}
}