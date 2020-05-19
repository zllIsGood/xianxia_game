class FriendData {
	public type: number;

	public id: number;
	public name: string;
	public online: number;
	public job: number;
	public sex: number;
	public vip: number;
	public lv: number;
	public zs: number;
	/**0为没购买1,为没过期,2为过期 */
	public monthCard: number;
	/**天梯等级 */
	public ladderLv: number;
	/**天梯是不是上周每一 */
	public isLastWeekLadder: number;
	public power: number;
	public guildName:string;
	//------------------根据类型，被数据结构会有以下不同-------------------//
	/**type1 离线时间 秒 */
	private _offLineSec: number = 0;
	private _updateTs: number;

	public set offLineSec(value: number) {
		this._offLineSec = value;
		this._updateTs = Date.now() / 1000;
	}

	public get offLineSec(): number {
		let rtn = 0;
		try {
			let nowTs = Date.now() / 1000;
			rtn = Math.floor(this._offLineSec + (nowTs - this._updateTs));
		} catch (e) {
			debug.log("取好友离线时间失败")
			debug.log(e)
		}
		return rtn;
	}

	/**type3 申请时间 秒*/
	public appDate: number = 0;

	public _redPoint: boolean = false;
	public get redPoint(): boolean {
		let rtn = this._redPoint;
		this._redPoint = false;
		return rtn;
	}

	/**最大信息数量 */
	public msgMaxLen: number = 50;

	/**通用 外部设置的聊天历史 */
	public get acMsg(): eui.ArrayCollection {
		if (Friends.ins().chatList[this.id] == null) {
			Friends.ins().chatList[this.id] = new eui.ArrayCollection();
		}
		return Friends.ins().chatList[this.id];
	};

	public set acMsg(value: eui.ArrayCollection) {
		Friends.ins().chatList[this.id] = value
	}

	/**最后一条聊天内容 */
	public lastMsg: string = "";

	/**最后一条聊天的时间 */
	public lastMsgDate: number = 0;
	public lastMsgData_local: number = 0;

	/**type: 1.好友  2最近 3申请 4黑名单*/
	constructor(type: number, bytes: GameByteArray = null) {
		this.type = type;
		if (bytes) {
			this.id = bytes.readUnsignedInt();
			this.name = bytes.readString();
			this.guildName = bytes.readString();
			this.online = bytes.readUnsignedByte();
			this.job = bytes.readUnsignedByte();
			this.sex = bytes.readUnsignedByte();
			this.sex = this.job == JobConst.ZhanShi ? 0 : 1;
			this.vip = bytes.readUnsignedByte();
			this.lv = bytes.readUnsignedByte();
			this.zs = bytes.readUnsignedByte();
			this.monthCard = bytes.readUnsignedByte();
			this.ladderLv = bytes.readUnsignedByte();
			this.isLastWeekLadder = bytes.readUnsignedByte();
			this.power = bytes.readInt();
			switch (type) {
				case 1:
					let n = bytes.readInt() || 0;
					this.offLineSec = n;
					break;
				case 2:
					this.lastMsgDate = bytes.readInt();
					break;
				case 3:
					let d = bytes.readInt() || 0;
					this.appDate = d;
					break;
				case 4:
					break;
			}
		}
	}

	public addChat(data: ChatData) {
		let self = this;
		this._redPoint = (data.fromActor.id == this.id);

		if (this.acMsg.length == 0) {
			data.showDate = true;
		} else {
			//300秒为一个区间，判断是否显示聊天日期
			for (let i = self.acMsg.length - 1; i >= 0; --i) {
				let oldData: ChatData = self.acMsg.getItemAt(i);
				if (data.date - oldData.date > 300) {
					data.showDate = true;
				}
				if (oldData.showDate) {//如果遇到已经显示日期的聊天，则退出遍历
					break;
				}
			}

		}
		self.acMsg.addItem(data);
		self.lastMsgData_local = Date.now();
		if (self.acMsg.length > this.msgMaxLen) {
			self.acMsg.removeItemAt(0);
		}
	}
}

class ChatData {
	/**写信人*/
	public fromActor: FriendData;
	/**收信人*/
	public toActor: FriendData;
	/**秒为单位的时间戳 */
	public date: number = 0;
	/**对话内容 */
	public msg: string = "";

	public get dateStr(): string {
		let rtn: string = "";
		rtn = DateUtils.getFormatBySecond(DateUtils.formatMiniDateTime(this.date) / 1000, 8);
		rtn = StringUtils.complementByChar(rtn, 16);
		return rtn;
	}

	public showDate: boolean = false;

	/**
	 * 私聊数据结构
	 * @param fromActor 发起对话人
	 * @param toActor 接收对话人
	 * @param date 秒为单位的时间戳
	 * @param msg 对话内容
	 */
	constructor(fromActor: FriendData, toActor: FriendData, date: number, msg: string) {
		this.fromActor = fromActor;
		this.toActor = toActor;

		this.date = date;
		this.msg = msg;
	}
}