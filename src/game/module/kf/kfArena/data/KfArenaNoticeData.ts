/**
 * Created by MPeter on 2018/3/15.
 * 跨服3v3竞技场 场景公告数据
 */
class KfArenaNoticeData {
	/**公告类型 1 首采公告 2首杀公告 3连杀公告*/
	public type: number;
	/**服务器ID*/
	public servId: number;
	/**作用者*/
	public name: string

	/**杀人者 服务ID*/
	public killerServId: number;
	/**杀人者 名字*/
	public killerName: string;
	/**死亡者 服务ID*/
	public deadServId: number;
	/**死亡者 名字*/
	public deadName: string;

	/**公告消息*/
	public noticeMsg: string;

	public constructor(bytes: GameByteArray) {
		let type: number = bytes.readShort();
		if (type == 1 || type == 3) {
			this.servId = bytes.readInt();
			this.name = bytes.readString();
		}
		else {
			this.killerServId = bytes.readInt();
			this.killerName = bytes.readString();
			this.deadServId = bytes.readInt();
			this.deadName = bytes.readString();
		}
		this.noticeMsg = bytes.readString();
	}


}
