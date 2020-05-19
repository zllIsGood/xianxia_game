/**
 * Created by yangsong on 15-3-25.
 */
class ByteArrayMsgByProtobuf extends ByteArrayMsg {
	private msgClass:any = null;
	private protoConfig:any = null;
	private protoConfigSymmetry:any = null;

	private ProtoFile:any = null;

	public static ProtoConfig: any = null;
	/**
	 * 构造函数
	 */
	public constructor() {
		super();
		this.msgClass = {};
		this.protoConfig = ByteArrayMsgByProtobuf.ProtoConfig;
		this.protoConfigSymmetry = {};
		let keys = Object.keys(this.protoConfig);
		for (let i:number = 0, len = keys.length; i < len; i++) {
			let key = keys[i];
			let value = this.protoConfig[key];
			this.protoConfigSymmetry[value] = key;
		}
	}

	/**
	 * 获取msgID对应的类
	 * @param key
	 * @returns {any}
	 */
	private getMsgClass(key:string):any {
		let cls:any = this.msgClass[key];
		if (cls == null) {
			cls = this.ProtoFile.build(key);
			this.msgClass[key] = cls;
		}
		return cls;
	}

	/**
	 * 获取msgID
	 * @param key
	 * @returns {any}
	 */
	private getMsgID(key:string):number {
		return this.protoConfigSymmetry[key];
	}

	/**
	 * 获取msgKey
	 * @param msgId
	 * @returns {any}
	 */
	private getMsgKey(msgId:number) {
		return this.protoConfig[msgId];
	}

	/**
	 * 消息解析
	 * @param msg
	 */
	public decode(msg:any):any {
		let msgID = msg.readShort();
		let len = msg.readShort();
		if (msg.bytesAvailable >= len) {
			let bytes:egret.ByteArray = new egret.ByteArray();
			msg.readBytes(bytes, 0, len);

			let obj:any = {};
			obj.key = this.getMsgKey(msgID);
			DebugUtils.start("Protobuf Decode");
			obj.body = this.getMsgClass(obj.key).decode(bytes.buffer);
			DebugUtils.stop("Protobuf Decode");
			Log.trace("收到数据：", "[" + msgID + " " + obj.key + "]", obj.body);
			return obj;
		}
		return null;
	}

	/**
	 * 消息封装
	 * @param msg
	 */
	public encode(msg:any):any {
		let msgID = this.getMsgID(msg.key);
		let msgBody = new (this.getMsgClass(msg.key))(msg.body);

		DebugUtils.start("Protobuf Encode");
		let bodyBytes:egret.ByteArray = new egret.ByteArray(msgBody.toArrayBuffer());
		DebugUtils.stop("Protobuf Encode");
		Log.trace("发送数据：", "[" + msgID + " " + msg.key + "]", msg.body);

		let sendMsg:egret.ByteArray = new egret.ByteArray();
		sendMsg.writeShort(msgID);
		sendMsg.writeBytes(bodyBytes);
		return sendMsg;
	}
}