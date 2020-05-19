/**
 * 好友窗口
 */
class FriendsWin extends BaseEuiView {
	public closeBtn0: eui.Button;
	public closeBtn: eui.Button;
	public group_0: eui.Group;
	public list_recent: eui.List;
	public group_1: eui.Group;
	public list_friends: eui.List;
	public btn_add: eui.Button;
	public btn_AskList: eui.Button;
	public btn_blackList: eui.Button;
	public label_num: eui.Label;
	public group_chat: eui.Group;
	public list_chat: eui.List;
	public btn_send: eui.Button;
	public editText_input: eui.EditableText;
	public label_name: eui.Label;
	public tab: eui.TabBar;
	public redPoint0: eui.Image;
	public redPoint1: eui.Image;
	public redPoint2: eui.Image;
	public img_title: eui.Image;
	public scroller_chat: eui.Scroller;

	public group_recent: eui.Group;
	public group_lianxiren: eui.Group;


	public talkWith: number;

	public initUI(): void {
		super.initUI();

		this.skinName = "FriendsWinSkin";
		this.isTopLevel = true;
		let arr: string[] = ["最近", "联系人"];
		this.tab.dataProvider = new eui.ArrayCollection(arr);
	}

	public open(...param: any[]): void {
		// let hashList = [];
		// for (let k in this) {
		// 	if (this[k] instanceof eui.Button && hashList.indexOf(this[k].hashCode) == -1) {
		// 		this.addTouchEvent(this[k], this.onTap);
		// 		hashList.push(this[k].hashCode)
		// 	}
		// }
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.btn_add, this.onTap);
		this.addTouchEvent(this.btn_AskList, this.onTap);
		this.addTouchEvent(this.btn_blackList, this.onTap);
		this.addTouchEvent(this.btn_send, this.onTap);
		this.addChangeEvent(this.tab, this.onTap);

		this.list_recent.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onRecentListItemTap, this);

		this.tab.selectedIndex = 0;
		this.onTabBarTouchTap();

		this.list_friends.itemRenderer = FriendListItemRender;
		this.list_friends.dataProvider = Friends.ins().friendsList;
		this.list_recent.itemRenderer = FriendRecentListItemRender;
		this.list_recent.dataProvider = Friends.ins().recentList;

		this.list_chat.itemRenderer = FriendsChatItemRender;

		this.editText_input.maxChars = GlobalConfig.FriendLimit.contentLimit;

		this.observe(Friends.ins().postFriendChange, this.updateView);
		this.observe(Friends.ins().postChatToFriend, this.openChatGroup);
		// this.updateView();
		Friends.ins().sendFriendsList();
	}

	public close(...param: any[]): void {
		// for (let k in this) {
		// 	if (this[k] instanceof eui.Button) {
		// 		this.removeTouchEvent((<eui.Button>this[k]), this.onTap);
		// 	}
		// }
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
		this.removeTouchEvent(this.btn_add, this.onTap);
		this.removeTouchEvent(this.btn_AskList, this.onTap);
		this.removeTouchEvent(this.btn_blackList, this.onTap);
		this.removeTouchEvent(this.btn_send, this.onTap);
		this.list_recent.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.onRecentListItemTap, this);
		this.removeObserve();
		// Friends.ins().currentIdx = -1;
	}

	public onTap(evt: egret.TouchEvent): void {
		switch (evt.target) {
			case this.closeBtn:
			case this.closeBtn0:
				Friends.ins().currentId = -1;
				ViewManager.ins().close(FriendsWin);
				break;
			case this.btn_add:
				ViewManager.ins().open(FriendsAddWin);
				break;
			case this.btn_AskList:
				ViewManager.ins().open(FriendsAppListWin);
				break;
			case this.btn_blackList:
				ViewManager.ins().open(BlackListWin);
				break;
			case this.btn_send:
				if (Actor.level <  GlobalConfig.FriendLimit.chatLv) {
					UserTips.ins().showTips(  GlobalConfig.FriendLimit.chatLv + "级开放");
				} else if (this.editText_input.text.length > GlobalConfig.FriendLimit.contentLimit) {
					UserTips.ins().showTips( "你说的话太长了");
				} else if (this.editText_input.text.length > 0) {
					Friends.ins().sendChat(this.talkWith,this.editText_input.text + "");
					this.editText_input.text = "";
					TimerManager.ins().doTimer(200, 1, this.scrollerChatToBottom, this);
				}
				break;
			case this.tab:
				this.onTabBarTouchTap();
				break;
		}
	}

	public onRecentListItemTap(evt: eui.ItemTapEvent): void {
		let data: FriendData = evt.item;
		if (data && data.id) {
			this.openChatGroup(data.id)
		}
	}

	/** 切换分页 */
	public onTabBarTouchTap(): void {
		if (this.group_recent) this.group_recent.visible = false;
		if (this.group_lianxiren) this.group_lianxiren.visible = false;
		this.list_friends.selectedIndex = -1;
		this.group_0.visible = this.group_1.visible = this.group_chat.visible = false;
		let group: eui.Group = this["group_" + this.tab.selectedIndex];
		if (group) {
			this.img_title.visible = true;
			group.visible = true;
			this.updateView();

			if (this.tab.selectedIndex == 0) {
				Friends.ins().recentList.refresh();
			}

			this.updateTipTab();
			Friends.ins().sortRecentList();
			Friends.ins().sortFriendList();
		}
		Friends.ins().postCloseFriendList();
	}

	/** 私聊内容 */
	public openChatGroup(userId: number): void {
		if (this.group_recent) this.group_recent.visible = false;
		if (this.group_lianxiren) this.group_lianxiren.visible = false;
		let idx: number = Friends.ins().indexOfFriendList(userId);
		if (idx > -1) {
			Friends.ins().currentId = userId;
			let fd: FriendData = Friends.ins().friendsList.getItemAt(idx);
			this.group_0.visible = this.group_1.visible = this.img_title.visible = false;
			this.group_chat.visible = true;
			this.talkWith = fd.id;
			this.label_name.text = fd.name;
			this.list_chat.dataProvider = Friends.ins().friendsList.getItemAt(idx).acMsg;
			delete Friends.ins().newMsg[userId];
		}
		egret.setTimeout(this.scrollerChatToBottom,this,200);
		
	}

	public scrollerChatToBottom(): void {
		if (this.scroller_chat) {
			this.scroller_chat.viewport.scrollV = Math.max(this.scroller_chat.viewport.contentHeight - this.scroller_chat.height,0);
		}
	}

	public updateView(userId: number = null): void {
		this.label_num.text = this.list_friends.dataProvider.length + "/" + GlobalConfig.FriendLimit.friendListLen;
		if (this.redPoint0) {
			this.redPoint0.visible = false;
			if (Object.keys(Friends.ins().newMsg).length > 0) {
				for (let key in Friends.ins().newMsg) {
					let value = Friends.ins().newMsg[key];
					if (value == true) {
						this.redPoint0.visible = true;
						break;
					}
				}
			}
		}
		// if (this.redPoint1 && !this.group_1.visible) 
		this.redPoint1.visible = (Friends.ins().appList.length > 0);
		if (this.redPoint2) this.redPoint2.visible = (Friends.ins().appList.length > 0);

		if (this.group_chat.visible) {
			//列表加载新聊天到渲染需要时间，是异步的，所以延迟刷新一下
			egret.setTimeout(this.scrollerChatToBottom,this,200);
		}
		this.updateTipTab();
	}

	/**
	 * 更新标签
	 * 暂时没有任何消息
	 * 暂时没有添加好友
	 */
	private updateTipTab(): void {
		if (this.group_recent && this.tab.selectedIndex == 0) {
			this.group_recent.visible = (Friends.ins().recentList.length == 0);
		}
		if (this.group_lianxiren && this.tab.selectedIndex == 1) {
			this.group_lianxiren.visible = (Friends.ins().friendsList.length == 0);
		}
	}

}

ViewManager.ins().reg(FriendsWin, LayerManager.UI_Popup);