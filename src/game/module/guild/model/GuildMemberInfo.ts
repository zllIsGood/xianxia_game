class GuildMemberInfo {

	public roleID: number;
	public name: string;
	public office: number;
	public job: number;
	public sex: number;
	public vipLevel: number;
	public monthCard: number;
	/**当日贡献 */
	public curContribution: number;
	/**历史贡献 */
	public contribution: number;
	public attack: number;
	public downTime: number;
	public level: number = 0;
	public zsLevel: number = 0;
	/** 天梯积分*/
	public score: number;
	/** 胜率*/
	public winRate: number;
	/** 跨服竞技场剩余次数*/
	public KfArenaCount: number;
	/** 是否加入跨服竞技场队伍*/
	public isJoinkfArena: boolean;

	public constructor() {
	}

	public parse(bytes: GameByteArray): void {
		this.roleID = bytes.readInt();
		this.vipLevel = bytes.readInt();
		this.attack = bytes.readInt();
		this.sex = bytes.readUnsignedByte();
		this.job = bytes.readUnsignedByte();
		this.name = bytes.readString();
		this.zsLevel = bytes.readInt();
		this.score = bytes.readInt();
		this.winRate = bytes.readInt() / 100 >> 0;
		this.KfArenaCount = bytes.readUnsignedByte();
		this.isJoinkfArena = bytes.readUnsignedByte() == 1;
	}

	public copyData(tData: GuildMemberInfo): void {
		for (let key in tData) {
			this[key] = tData[key];
		}

	}
}