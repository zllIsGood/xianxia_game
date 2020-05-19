class Chat extends BaseSystem {

	/** 聊天tip显示状态 */
	public isShowTip: boolean = false;

	//聊天数据
	public chatInterval: number = 5000;
	public charMax: number = 50;
	public canSpeak: boolean = true;
	public UpSpeak: string = "";

	private _chatListData: eui.ArrayCollection;//世界
	private _systemListData: eui.ArrayCollection;
	private _chatListData2: eui.ArrayCollection;//综合

	public constructor() {
		super();
		this.initData();

		this.sysId = PackageID.Chat;

		this.regNetMsg(1, this.doNewChatMsg);
		this.regNetMsg(2, this.doSystemInfo);
		this.regNetMsg(3, this.doIsSendSuccess);
		this.regNetMsg(4, this.doSystemMessage);
	}

	public initData() {
		if (!this._chatListData) this._chatListData = new eui.ArrayCollection();
		if (!this._systemListData) this._systemListData = new eui.ArrayCollection();
		if (!this._chatListData2) this._chatListData2 = new eui.ArrayCollection();
		this._chatListData.removeAll();
		this._systemListData.removeAll();
		this._chatListData2.removeAll();
	}

	public static ins(): Chat {
		return super.ins() as Chat;
	}

	public sendChatInfo(type: number, str: string, pointId: number = 0): void {
		if (str.length <= 0) {
			UserTips.ins().showTips("|C:0xf3311e&T:请输入聊天内容|");
			return;
		}
		if (str.charAt(0) == "@") {
			let bytes: GameByteArray = this.getBytes(0);
			bytes.writeString(str);
			this.sendToServer(bytes);
			return;
		}
		let bytes: GameByteArray = this.getBytes(1);
		bytes.writeByte(type);
		bytes.writeUnsignedInt(pointId);
		bytes.writeString(str);
		this.sendToServer(bytes);

		if (type == 7) {//世界聊天
			ReportData.getIns().reportChat(str, 4);
		}
	}

	/**
	 * 收到新的新的聊天消息
	 * 30-1
	 */
	public doNewChatMsg(bytes: GameByteArray): void {
		let message: ChatInfoData = new ChatInfoData(bytes);
		if (Friends.ins().indexOfBlackList(message.id) == -1) {
			this.insertChatMsg(message);
		}
	}

	public insertChatMsg(message:any): void {
		if (!this._chatListData) {
			this._chatListData = new eui.ArrayCollection();
		}
		if (this._chatListData.length >= this.charMax) {
			let msg  = this._chatListData.removeItemAt(0);
			this.removeAllChatMsg(msg);
		}
		this._chatListData.addItem(message);
		this.insertAllChatMsg(message);

		this.postNewChatMsg(message);
	}

	public insertAllChatMsg(message){
		if (!this._chatListData2) {
			this._chatListData2 = new eui.ArrayCollection();
		}
		this._chatListData2.addItem(message);
	}

	public removeAllChatMsg(message) {
		let index = this._chatListData2.getItemIndex(message);
		if (index >= 0) {
			this._chatListData2.removeItemAt(index);
		}
	}

	/**移除某id的聊天 */
	public removeChatWithId(userId: number): void {
		if (this._chatListData && this._chatListData.length) {
			let source = [];
			for (let i = 0; i < this._chatListData.length; i++) {
				let cData: ChatInfoData = this._chatListData.getItemAt(i);
				if (cData.id != userId) {
					source.push(cData);
				}
			}
			this._chatListData.source = source;
			this._chatListData.refresh();
		}

		// MessageCenter.dispatch(MessagerEvent.GUILD_MESSAGE_UPDATE);
	}

	//派发一条聊天消息
	public postNewChatMsg(message: ChatInfoData | GuildMessageInfo | ChatSystemData): ChatInfoData | GuildMessageInfo | ChatSystemData {
		return message;
	}

	private doSystemInfo(bytes: GameByteArray): void {

	}

	static ERROR_STR = [
		"",
		"消息为空",
		"长度超出限制",
		"频道为空",
		"发言太快",
		"解除禁言时间未到达",
		"未达到80级无法发言",
		"未知错误",
		"没有发言次数",
	];
	private doIsSendSuccess(bytes: GameByteArray): void {
		if (bytes.readBoolean()) {
			this.postSendInfoSuccess();
		}
		let errorCode = bytes.readByte();
		if (errorCode != 0 && errorCode != undefined) {
			UserTips.ins().showCenterTips(Chat.ERROR_STR[errorCode]);
		}
	}

	/**派发新发送消息成功 */
	public postSendInfoSuccess(): void {

	}

	private doSystemMessage(bytes: GameByteArray): void {
		let level: number = bytes.readInt();//玩家的等级，低于这个等级则不显示这个信息 0表示不限制
		let type: number = bytes.readInt();
		let str: string = bytes.readString();
		if (level == 0 || Actor.level >= level) {
			switch (type) {
				case 8:
					UserTips.ins().showCenterTips2(str);
					break;
				case 4:
					ErrorLog.ins().show(str);
					break;
				case 2:
					UserTips.ins().showCenterTips(str);
					break;
				default:
					UserTips.ins().showTips(str);
					break;
			}
		}
	}

	public get chatListData(): eui.ArrayCollection {
		if (!this._chatListData) this._chatListData = new eui.ArrayCollection();
		return this._chatListData;
	}

	public get chatListData2(): eui.ArrayCollection {
		if (!this._chatListData2) this._chatListData2 = new eui.ArrayCollection();
		return this._chatListData2;
	}

	public get chatListTip(): ChatInfoData[] {
		if (!this._chatListData) {
			this._chatListData = new eui.ArrayCollection([]);
		}
		//截取2个末尾数据
		let len: number = this._chatListData.length;
		let start: number;
		let end: number;
		if (len > 2) {
			start = len - 2;
			end = len;
		} else {
			start = 0;
			end = len;
		}
		return this._chatListData.source.slice(start, end);
	}
	//用于主界面聊天频道
	public get chatListTip2(): ChatInfoData[] {
		if (!this._chatListData2) {
			this._chatListData2 = new eui.ArrayCollection([]);
		}
		//截取2个末尾数据
		let len: number = this._chatListData2.length;
		let start: number;
		let end: number;
		if (len > 2) {
			start = len - 2;
			end = len;
		} else {
			start = 0;
			end = len;
		}
		return this._chatListData2.source.slice(start, end);
	}


	public startInterval(): void {
		this.canSpeak = false;
		TimerManager.ins().doTimer(this.chatInterval, 1, this.timeDo, this);
	}

	private timeDo(): void {
		this.canSpeak = true;
	}

	public postSysChatMsg(message: ChatSystemData): ChatSystemData {
		if (this._systemListData.length >= this.charMax) {
			let msg = this._systemListData.removeItemAt(0);
			this.removeAllChatMsg(msg);
		}
		this._systemListData.addItem(message);

		this.insertAllChatMsg(message);
		return message;
	}

	public get systemListData(): eui.ArrayCollection {
		if (!this._systemListData) this._systemListData = new eui.ArrayCollection([]);
		return this._systemListData;
	}

	public checkRepeatString(str: string): boolean {
		let len: number = str.length;
		if (len <= 10) {
			return true;
		}
		let repeatNum: number = 0;
		for (let i = 0; i < len; i++) {
			let strIndex: string = str.charAt(i);
			if (this.UpSpeak.lastIndexOf(strIndex) != -1) {
				++repeatNum;
			}
		}
		if (repeatNum >= 10) {
			UserTips.ins().showTips("|C:0xf3311e&T:输入的内容重复过多|");
			return false;
		}
		return true;
	}
	
	/**获取世界字 */
	public getWorldStr(): string {
		return KFServerSys.ins().isKF || KFBossSys.ins().isKFBossBattle ? `跨服` : `世界`;
	}
}
function gm(str: string): void {
	let bytes: GameByteArray = GameLogic.ins().getBytes(0);
	bytes.writeString(str);
	GameLogic.ins().sendToServer(bytes);
}
namespace GameSystem {
	export let  chat = Chat.ins.bind(Chat);
}