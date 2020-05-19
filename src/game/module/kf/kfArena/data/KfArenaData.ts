/**
 * Created by MPeter on 2018/3/14.
 * 跨服3v3战场数据模型
 */
class KfArenaData {
	/**服务器ID*/
	public servId: number;
	/**阵营ID*/
	public campId: number;
	/**玩家ID*/
	public actorid: number;
	/**玩家名字*/
	public playerName: string;
	/**击杀数*/
	public killNum: number = 0;
	/**助攻*/
	public aidNum: number = 0;
	/**采集*/
	public collectNum: number = 0;
	/**该局分数*/
	public curScore: number = 0;
	/**该局获得分数*/
	public curGetScore: number = 0;
	/**该局总分数*/
	public totalScore: number = 0;
	/**竞技积分*/
	public arenaScore: number = 0;

	/**是否首杀*/
	public isFirstKiller: boolean;
	/**是否首采*/
	public isFirstCollect: boolean;
	/**是否MVP*/
	public isMvp: boolean;
	/**是否连胜*/
	public isOnWin: boolean;
	/**是否为逃兵*/
	public isDeserter: boolean;

	public rank: number;

	public constructor(bytes?: GameByteArray) {
		if (bytes) this.readData(bytes);
	}

	private readData(bytes: GameByteArray): void {
		this.servId = bytes.readInt();
		this.campId = bytes.readByte();
		this.actorid = bytes.readInt();
		this.playerName = bytes.readString();
		this.killNum = bytes.readShort();
		this.aidNum = bytes.readShort();
		this.collectNum = bytes.readShort();
		this.curScore = bytes.readShort();
		this.curGetScore = bytes.readShort();
		this.totalScore = bytes.readInt();
		this.arenaScore = bytes.readShort();

		this.isFirstKiller = bytes.readBoolean();
		this.isFirstCollect = bytes.readBoolean();
		this.isMvp = bytes.readBoolean();
		this.isOnWin = bytes.readBoolean();
		this.isDeserter = bytes.readBoolean();
	}

	/*排行数据*/
	public readRankData(bytes: GameByteArray): void {
		this.servId = bytes.readInt();
		this.campId = bytes.readByte();
		this.actorid = bytes.readInt();
		this.playerName = bytes.readString();
		this.killNum = bytes.readShort();
		this.aidNum = bytes.readShort();
		this.collectNum = bytes.readShort();
		this.curScore = bytes.readShort();
		this.totalScore = bytes.readInt();
	}

}
