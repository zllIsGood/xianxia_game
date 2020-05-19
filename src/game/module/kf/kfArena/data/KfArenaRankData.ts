/**
 * Created by MPeter on 2018/3/16.
 * 跨服3v3排行数据
 */
class KfArenaRankData {
	/**排名*/
	public rank: number;
	/**玩家ID*/
	public playerId: number;
	/**分数*/
	public score: number;
	/**vip*/
	public vip: number;
	/**玩家名字*/
	public playerName: string;
	/**段位*/
	public dan: number;
	/**服务器ID*/
	public servId: number;


	public constructor(bytes: GameByteArray) {
		this.rank = bytes.readInt();
		this.playerId = bytes.readInt();
		this.score = bytes.readInt();
		this.vip = bytes.readInt();
		this.playerName = bytes.readString();
		this.dan = bytes.readInt();
		this.servId = bytes.readInt();
	}

}
