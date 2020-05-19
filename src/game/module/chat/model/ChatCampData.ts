/**
 * Created by MPeter on 2018/3/17.
 * 阵营聊天信息
 */
class ChatCampData extends ChatDataBase {
	/**聊天类型，1阵营聊天，2所有人聊天*/
	// public type: number;
	/**服务器ID*/
	public servId: number;
	/**名字*/
	public name: string;
	/**聊天内容*/
	public content: string;

	public constructor() {
		super();
	}

	public readData(bytes: GameByteArray = null) {
		this.type = bytes.readShort();
		this.servId = bytes.readInt();
		this.name = bytes.readString();
		this.content = bytes.readString();
	}

}
