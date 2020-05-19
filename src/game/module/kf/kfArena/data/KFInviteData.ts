/**
 * 跨服竞技场邀请人数据
 */
class KFInviteData {
	public roleId: number;
	public name: string;
	public power: number;
	public score: number;
	public winRate: number;

	public parse(bytes: GameByteArray): void {
		this.roleId = bytes.readInt();
		this.name = bytes.readString();
		this.power = bytes.readInt();
		this.score = bytes.readInt();
		this.winRate = bytes.readInt() / 100 >> 0;
	}
}


enum KFInviteType{
	/**好友*/
	Friend = 0,
		/**帮派*/
	Guild = 1
}