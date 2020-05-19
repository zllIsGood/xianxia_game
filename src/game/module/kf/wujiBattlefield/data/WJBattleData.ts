/**
 * Created by MPeter on 2017/12/4.
 * 跨服副本-无极战场-数据对象
 */
class WJBattleData {
	/**服务器ID */
	public servId: number;
	/**玩家名字 */
	public playerName: string;
	/**阵营ID */
	public camp: number;
	/**击杀次数 */
	public killNum: number;
	/**被击杀次数 */
	public killedNum: number;
	/**助攻次数 */
	public assistsNum: number;
	/**采旗次数 */
	public collectFlagNum: number;
	/**是否1血（首杀）  1是 0否*/
	public isFirstKiller: number = 0;
	/**是否MVP   1是 0否*/
	public isMVP: number = 0;

	/**是否为结果数据 */
	public isResult: boolean = false;

	public constructor() {
	}
	/**读取结果数据 */
	public readResultData(bytes: GameByteArray): void {
		this.servId = bytes.readInt();
		this.playerName = bytes.readString();
		this.camp = bytes.readInt();
		this.killNum = bytes.readInt();
		this.killedNum = bytes.readInt();
		this.assistsNum = bytes.readInt();
		this.collectFlagNum = bytes.readInt();
		this.isFirstKiller = bytes.readByte();
		this.isMVP = bytes.readByte();
	}
	/**读取普通查看数据 */
	public readViewData(bytes: GameByteArray): void {
		this.servId = bytes.readInt();
		this.playerName = bytes.readString();
		this.camp = bytes.readInt();
		this.killNum = bytes.readInt();
		this.killedNum = bytes.readInt();
		this.assistsNum = bytes.readInt();
		this.collectFlagNum = bytes.readInt();
		this.isFirstKiller = bytes.readByte();
	}
	/**读取自己的战绩数据 */
	public readMyData(bytes: GameByteArray): void {
		this.killNum = bytes.readInt();
		this.killedNum = bytes.readInt();
		this.assistsNum = bytes.readInt();
		this.collectFlagNum = bytes.readInt();
	}
}

/** 无极战场阵营类型*/
enum WJCampType {
	/**我方阵营 */
    ME = 100,
	/**敌方阵营 */
	ENEMY = 200,
}