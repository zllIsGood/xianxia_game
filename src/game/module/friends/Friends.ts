class Friends extends BaseSystem {
	public friendsList: eui.ArrayCollection = new eui.ArrayCollection();
	public recentList: eui.ArrayCollection = new eui.ArrayCollection();
	public appList: eui.ArrayCollection = new eui.ArrayCollection();
	public blackList: eui.ArrayCollection = new eui.ArrayCollection();
	public static MAXNUM: number = 100;
	public static CLOSS_FRIEND_LIST_BUTTON: string = "CLOSS_FRIEND_LIST_BUTTON"

	public constructor() {
		super();
		this.sysId = PackageID.Friends;
		this.regNetMsg(7, this.doAddListMsg);
		this.regNetMsg(3, this.doAppList);
		this.regNetMsg(4, this.doBlackList);
		this.regNetMsg(13, this.doChatAdd);
		this.regNetMsg(1, this.doFriendsList);
		this.regNetMsg(10, this.doFriendsStateChange);
		this.regNetMsg(14, this.doRecentChatList);
		this.regNetMsg(9, this.doRemoveListMsg);
		this.regNetMsg(2, this.doRencentList);
		this.regNetMsg(11, this.doSendResult);
	}


	public static ins(): Friends {
		return super.ins() as Friends;
	}

	protected initLogin() {
		this.sendAppList();
	}

	private isDebug = false;

	private log(msg: string): void {
		if (this.isDebug)
			debug.log(msg)
	}

	/**请求好友列表
	 * 47 - 1
	 */
	public sendFriendsList(): void {
		let bytes: GameByteArray = this.getBytes(1);
		this.sendToServer(bytes);
	}

	/**请求最近联系人
	 * 47 - 2
	 */
	public sendRecentList(): void {
		let bytes: GameByteArray = this.getBytes(2);
		this.sendToServer(bytes);
	}

	/**请求申请列表
	 * 47 - 3
	 */
	public sendAppList(): void {
		let bytes: GameByteArray = this.getBytes(3);
		this.sendToServer(bytes);
	}

	/**请求黑名单
	 * 47 - 4
	 */
	public sendBlackList(): void {
		let bytes: GameByteArray = this.getBytes(4);
		this.sendToServer(bytes);
	}

	/**加好友
	 * 47 - 5
	 * 如果为角色id为0，则根据角色名字来加好友
	 */
	public sendAddFriend(userId: number, userName: string): void {
		if (Actor.level < GlobalConfig.FriendLimit.chatLv) {
			UserTips.ins().showTips(GlobalConfig.FriendLimit.chatLv + "级开放功能");
			return;
		}
		if (this.indexOfBlackList(userId) != -1) {
			UserTips.ins().showTips("不能添加黑名单中的用户为好友");
			return;
		}
		for (let value of this.blackList.source) {
			let fd: FriendData = value;
			if (fd.name == userName) {
				UserTips.ins().showTips("不能添加黑名单中的用户为好友");
				return;
			}
		}
		let bytes: GameByteArray = this.getBytes(5);
		bytes.writeInt(userId);
		bytes.writeString(userName)
		this.sendToServer(bytes);
	}

	/**加黑名单
	 * 47 - 6
	 * 如果为角色id为0，则根据角色名字来加
	 */
	public sendAddBlackList(userId: number, userName: string): void {
		if (Actor.level < GlobalConfig.FriendLimit.chatLv) {
			UserTips.ins().showTips(GlobalConfig.FriendLimit.chatLv + "级开放功能");
			return;
		}
		let bytes: GameByteArray = this.getBytes(6);
		bytes.writeInt(userId);
		bytes.writeString(userName)
		this.sendToServer(bytes);
	}

	/**
	 * 同意好友
	 * 47 - 8
	 * agree: 0拒绝1同意
	 */
	public sendAgreeApp(userId: number, agree: number): void {
		let bytes: GameByteArray = this.getBytes(8);
		bytes.writeInt(userId);
		bytes.writeByte(agree);
		this.sendToServer(bytes);
	}

	/**
	 * 删除
	 * 47 - 9
	 * type: 1好友 2最近联系 3申请 4黑名单
	 */
	public sendDelete(type: number, userId: number): void {
		let bytes: GameByteArray = this.getBytes(9);
		bytes.writeByte(type);
		bytes.writeInt(userId);
		this.sendToServer(bytes);
	}

	/**
	 * 私聊
	 * 47 - 11
	 */
	public sendChat(userId: number, str: string): void {
		let bytes: GameByteArray = this.getBytes(11);
		bytes.writeInt(userId);
		bytes.writeString(str);
		this.sendToServer(bytes);


		ReportData.getIns().reportChat(str, 1);
	}

	/**
	 * 请求最近私聊内容
	 * 47 - 14
	 */
	public sendRecentChat(userId: number): void {
		let bytes: GameByteArray = this.getBytes(14);
		bytes.writeInt(userId);
		this.sendToServer(bytes);
	}

	//-------------------------------------以下是接收下推的处理方法-------------------------------------------------------//

	/** 处理下推好友列表
	 * 47 - 1
	 */
	public doFriendsList(bytes: GameByteArray): void {
		this.paserList(1, bytes);
		this.postFriendChange();
	}

	/** 处理下推最近列表
	 * 47 - 2
	 */
	public doRencentList(bytes: GameByteArray): void {
		this.paserList(2, bytes);
		this.postFriendChange();
	}

	/** 处理下推申请列表
	 * 47 - 3
	 */
	public doAppList(bytes: GameByteArray): void {
		this.paserList(3, bytes);
		this.postFriendChange();
	}

	/** 处理下推黑名单列表
	 * 47 - 4
	 */
	public doBlackList(bytes: GameByteArray): void {
		this.paserList(4, bytes);
		this.postFriendChange();
	}

	/** 好友 申请 黑名单新增信息处理
	 * 47 - 7
	 */
	public doAddListMsg(bytes: GameByteArray): void {
		let type: number = bytes.readByte();
		this.paserAddData(type, bytes);
		this.postFriendChange();
	}

	/** 好友 申请 黑名单移除信息处理
	 * 47 - 9
	 */
	public doRemoveListMsg(bytes: GameByteArray): void {
		let type: number = bytes.readByte();
		let userId: number = bytes.readInt();
		this.paserRemoveData(type, userId);
		this.postFriendChange();
	}

	/** 好友离线上线通知
	 * 47 - 10
	 */
	public doFriendsStateChange(bytes: GameByteArray): void {
		let userId: number = bytes.readUnsignedInt();
		let online: number = bytes.readByte();
		this.paserOnlineChange(userId, online);
		this.postFriendChange();
	}

	/** 消息发送结果
	 * 47 - 11
	 */
	public doSendResult(bytes: GameByteArray): void {
		let result: number = bytes.readByte();
		if (result != 0) {
			let userId: number = bytes.readUnsignedInt();
			let date: number = bytes.readInt();
			let msg: string = bytes.readString();
			this.paserChatMsg(1, userId, date, msg);
		}
		this.postFriendChange();
	}

	/** 下推私聊
	 * 47 - 13
	 */
	public doChatAdd(bytes: GameByteArray): void {
		let userId: number = bytes.readUnsignedInt();
		let date: number = bytes.readInt();
		let msg: string = bytes.readString();

		this.paserChatMsg(0, userId, date, msg);
		// MessageCenter.dispatch(MessagerEvent.FRIEND_CHANGE,userId);
		this.postFriendChange();
	}

	/** 下推最近私聊列表
	 * 47 - 14
	 *
	 */
	public doRecentChatList(bytes: GameByteArray): void {
		this.paserRecentMsg(bytes);
		this.postFriendChange();
	}

	///////////////////////////////////////////////////派发消息/////////////////////////////////////////////////////
	/*派发好友变更变更*/
	public postFriendChange(): number {
		// debug.log("ss");
		return 0;
	}

	/*派发关闭好友列表*/
	public postCloseFriendList(): void {
	}

	/*派发私聊*/
	public postChatToFriend(friendId: number): number {
		return friendId;
	}

	/**聊天记录 key 玩家id value 聊天数据集 */
	public chatList = {};
	public newMsg = {};

	public indexOfFriendList(userId: number): number {
		let rtn: number = -1;
		for (let i = 0; i < this.friendsList.length; i++) {
			let fd: FriendData = this.friendsList.getItemAt(i);
			if (fd && fd.id == userId) {
				rtn = i;
				break;
			}
		}
		return rtn;
	}

	public indexOfBlackList(userId: number): number {
		let rtn: number = -1;
		for (let i = 0; i < this.blackList.length; i++) {
			let fd: FriendData = this.blackList.getItemAt(i);
			if (fd && fd.id == userId) {
				rtn = i;
				break;
			}
		}
		return rtn;
	}

	public indexOfRecentList(userId: number): number {
		let rtn: number = -1;
		for (let i = 0; i < this.recentList.length; i++) {
			let fd: FriendData = this.recentList.getItemAt(i);
			if (fd && fd.id == userId) {
				rtn = i;
				break;
			}
		}
		return rtn;
	}

	public indexOfAppList(userId: number): number {
		let rtn: number = -1;
		for (let i = 0; i < this.appList.length; i++) {
			let fd: FriendData = this.appList.getItemAt(i);
			if (fd && fd.id == userId) {
				rtn = i;
				break;
			}
		}
		return rtn;
	}

	public sortRecentList(): void {
		// let source = this.recentList.source;

		// source.sort(function (a: FriendData, b: FriendData) {
		// 	return b.lastMsgDate - a.lastMsgDate;
		// });

		// this.recentList.replaceAll(source)
	}

	public sortFriendList(): void {
		let source = this.friendsList.source;
		let sourceOnline = [];
		let sourceOffline = [];
		source.forEach(function (element) {
			if ((element as FriendData).online == 1) {
				sourceOnline.push(element);
			} else {
				sourceOffline.push(element);
			}
		})
		sourceOnline.sort(function (a: FriendData, b: FriendData) {
			if (b.zs != a.zs) return (b.zs - a.zs);
			return (b.lv - a.lv);
		});
		sourceOffline.sort(function (a: FriendData, b: FriendData) {
			if (b.zs != a.zs) return (b.zs - a.zs);
			return (b.lv - a.lv);
		});
		source = sourceOnline.concat(sourceOffline);
		this.friendsList.replaceAll(source)
	}

	public sortAppList(): void {
		let source = this.appList.source;

		source.sort(function (a: FriendData, b: FriendData) {

			return b.power - a.power;
		});

		this.appList.replaceAll(source)
	}

	/**解析推送列表
	 * type: 1.好友  2最近 3申请 4黑名单
	 */
	public paserList(type: number, bytes: GameByteArray): void {
		let source = [];
		let len: number = bytes.readInt();
		for (let i = 0; i < len; i++) {
			let fd: FriendData = new FriendData(type, bytes);
			source.push(fd);
		}
		switch (type) {
			case 1:
				this.friendsList.source = source;
				this.sortFriendList();
				break;
			case 2:
				this.recentList.source = source;
				this.sortRecentList();
				break;
			case 3:
				if (source.length > Friends.MAXNUM) source = source.slice(source.length - Friends.MAXNUM, Friends.MAXNUM)
				this.appList.source = source;
				this.sortAppList();
				break;
			case 4:
				this.blackList.replaceAll(source);
				break;
		}
	}

	/**
	 * 解析推送新增资料
	 * type: 1.好友  2最近 3申请 4黑名单
	 */
	public paserAddData(type: number, bytes: GameByteArray): void {
		let fd: FriendData = new FriendData(type, bytes);
		let listName = ["friendsList", "recentList", "appList", "blackList"][type - 1];
		let idx: number = -1;
		if (type == 1) {
			idx = this.indexOfFriendList(fd.id);
		} else if (type == 2) {
			idx = this.indexOfRecentList(fd.id);
		} else if (type == 3) {
			idx = this.indexOfAppList(fd.id);
		} else if (type == 4) {
			idx = this.indexOfBlackList(fd.id);
			this.paserRemoveData(1, fd.id);
			this.paserRemoveData(2, fd.id);
			this.paserRemoveData(3, fd.id);
			Chat.ins().removeChatWithId(fd.id);
			Guild.ins().removeMsgWithId(fd.id);
		}

		if (this[listName] && type != 2) {
			if (idx > -1) {
				(<eui.ArrayCollection>this[listName]).replaceItemAt(fd, idx);
			} else {
				(<eui.ArrayCollection>this[listName]).addItemAt(fd, 0);
			}
		}

		this.sortFriendList();
		this.sortRecentList();
		this.sortAppList();
	}

	/**
	 * 解析推送移除资料
	 * type: 1.好友  2最近 3申请 4黑名单
	 */
	public paserRemoveData(type: number, userId: number): void {
		let listName = ["friendsList", "recentList", "appList", "blackList"][type - 1];
		let idx: number = -1;

		if (this[listName]) {
			if (type == 1) {
				idx = this.indexOfFriendList(userId);
				this.newMsg[userId] = false;
			} else if (type == 2) {
				idx = this.indexOfRecentList(userId);
				this.newMsg[userId] = false;
			} else if (type == 3) {
				idx = this.indexOfAppList(userId);
			} else if (type == 4) {
				idx = this.indexOfBlackList(userId);
			}
			if (idx > -1) {
				(<eui.ArrayCollection>this[listName]).removeItemAt(idx);
			}
		}
	}

	public currentId: number = -1;

	/**
	 * 解析推送玩家状态变更
	 * @param type: 1.好友  2最近 3申请 4黑名单
	 * @param online: 0离线 1在线
	 */
	public paserOnlineChange(userId: number, online: number): void {
		let idx: number = this.indexOfFriendList(userId);
		if (idx > -1) {
			let fd: FriendData = this.friendsList.getItemAt(idx);
			if (fd.id == userId) {
				fd.online = online;
				if (fd.online == 0) {
					this.friendsList.replaceItemAt(fd, idx);
				} else {
					this.friendsList.removeItemAt(idx);
					this.friendsList.addItemAt(fd, 0);
				}
			}
		}
	}

	/**
	 * 解析私聊
	 * @param type: 发送类型 0：别人发言，1：自身发言
	 * @param userId: 聊天对象的id
	 * @param date: 时间戳，秒为单位
	 * @param msg: 聊天内容
	 */
	public paserChatMsg(type: number, userId: number, date: number, msg: string): void {
		if (this.indexOfBlackList(userId) > -1) {
			return;
		}
		if (type == 0 && this.currentId != userId) {//别人的发言要触发红点
			this.newMsg[userId] = true;
		}

		let idxFriend: number = this.indexOfFriendList(userId);
		if (idxFriend > -1) {
			let fd: FriendData = this.friendsList.getItemAt(idxFriend);//对方
			let md: FriendData = new FriendData(1);//创建一个我自己的资料
			md.id = Actor.actorID;
			md.job = SubRoles.ins().getSubRoleByIndex(0).job;
			md.sex = SubRoles.ins().getSubRoleByIndex(0).sex;
			md.power = Actor.power;

			if (type == 0) {
				fd.addChat(new ChatData(fd, md, date, msg));
			} else if (type == 1) {
				fd.addChat(new ChatData(md, fd, date, msg));
			}
		}

		/**刷新最近联系人 */
		let idxRecent: number = this.indexOfRecentList(userId);

		if (idxRecent > -1) {
			let fd: FriendData = this.recentList.getItemAt(idxRecent);
			fd.lastMsg = msg;
			fd.lastMsgDate = date;
			// if (type == 0) { // 只有是别人发言时, 才需要红点提示
			// 	fd._redPoint = true;	
			// }
			this.recentList.removeItemAt(idxRecent);
			this.recentList.addItemAt(fd, 0)
			this.sortRecentList();
		} else if (idxFriend > -1) {//最近联系人无该id则从好友列表处复制过来
			let fd: FriendData = this.friendsList.getItemAt(idxFriend);
			fd.lastMsg = msg;
			this.recentList.addItemAt(fd, 0);
			this.sortRecentList();
		} else {
			debug.log("有一个不属于最近联系人和好友列表的私聊")
			debug.log("id:" + userId + "/ msg:" + msg)
		}

		this.sortFriendList();
		this.sortRecentList();
		this.sortAppList();
	}

	/**
	 * 解析最近聊天下推
	 */
	public paserRecentMsg(bytes: GameByteArray): void {
		let len: number = bytes.readByte();
		for (let i = 0; i < len; i++) {
			let userId: number = bytes.readByte();
			let date: number = bytes.readInt();
			let msg: string = bytes.readString();

			if (this.indexOfBlackList(userId) == -1) {
				for (let n = 0; i < this.recentList.length; i++) {
					let fd: FriendData = this.recentList.getItemAt(n);
					if (fd.id == userId) {
						fd.lastMsg = msg;
						fd.offLineSec = date;
						break;
					}
				}
			}
		}
	}

	public getFriendIndex(id: number): number {
		let index = 0;
		while (true) {
			let data = this.friendsList.getItemAt(index) as FriendData;
			if (!data)
				return -1;
			if (data.id == id)
				return index;
			index++;
		}
	}
}

namespace GameSystem {
	export let  friends = Friends.ins.bind(Friends);
}