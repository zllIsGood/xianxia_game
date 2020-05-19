/**
 * PublicBossInfo
 */
class PublicBossInfo {


	/** boss编号 */
	public id: number;
	/** 血量百分比 */
	public hp: number;
	/** 挑战中的人数 */
	public people: number;
	/** 复活时间 毫秒*/
	public reliveTime: number;
	/** 是否挑战中 */
	public challengeing: boolean;

	parser(bytes: GameByteArray) {
		this.id = bytes.readInt();
		this.hp = bytes.readShort();
		this.people = bytes.readShort();
		this.reliveTime = bytes.readInt() * 1000 + egret.getTimer();
		this.challengeing = bytes.readBoolean();
	}

	/** 是否死亡 */
	get isDie(): boolean {
		return (this.reliveTime - egret.getTimer()) / 1000 > 0;
	}
}