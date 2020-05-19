class FriendChatPanel extends BaseComponent {

	public constructor() {
		super();
		this.name = `最近`;
		// this.skinName = `FriendChatSkin`;
	}

	protected childrenCreated() {
		
		this.init();
	}

	public init() {
		this.listFriend.dataProvider = null;
		this.listChat.dataProvider = null;
		this.listFriend.itemRenderer = FriendHeadItem;
		this.listChat.itemRenderer = FriendsChatItemRender;

	}

	private listFriend: eui.List;
	private listChat: eui.List;
	private input: eui.EditableText;
	private btnSend: eui.Button;
	private faceBtn: eui.Image;
	private scroller: eui.Scroller;
	private selectedIndex:number;
	private isFirstLoad: boolean = true;

	public open(...param: any[]) {
		Friends.ins().sendFriendsList();
		Friends.ins().sendRecentList();
		this.listFriend.selectedIndex = this.selectedIndex =param[0] ? param[0] : 0;
		this.addChangeEvent(this.listFriend, this.onChange);
		this.addTouchEvent(this.btnSend, this.onTap);
		this.addTouchEvent(this.faceBtn, this.onTap);
		this.observe(Friends.ins().postFriendChange, this.updateView);
		this.observe(Friends.ins().postChatToFriend, this.updateView);
		this.addTouchEvent(this.listChat, this.onListTap);
		this.onChange();
	}

	public close() {
		this.removeTouchEvent(this.listChat, this.onListTap);
		WatcherUtil.removeFromArrayCollection(this.listChat.dataProvider as eui.ArrayCollection);
		WatcherUtil.removeFromArrayCollection(this.listFriend.dataProvider as eui.ArrayCollection);
		this.listFriend.dataProvider = null;
		this.listChat.dataProvider = null;
		this.$onClose();
	}

	private onListTap() {
		let selectedItem = this.listChat.selectedItem;
		if (selectedItem && selectedItem instanceof ChatData) {
			let str: string = (selectedItem as ChatData).msg;
			if (str && str.indexOf("|E:") >= 0)
				this.onLink(str);
		}
	}

	/** 超链接处理 */
	private onLink(str: string): void {
		//`|E:1,f,2&U:&T:快速加入`
		let index: number = str.indexOf("|E:");
		str = str.slice(index + 3, Number.MAX_VALUE);
		let list: string[];
		if (str.indexOf(",") >= 0)
			list = str.split(",");
		else if (str.indexOf("*") >= 0)
			list = str.split("*");

		if (!list || list.length <= 0)
			return;

		switch (list[0]) {
			case "1": //打开组队副本房间	
				UserFb.ins().sendEnterTFRoom(+list[1]);
				break;
		}
	}

	private updateView() {

		this.listFriend.dataProvider = Friends.ins().friendsList;
			
		// this.listFriend.selectedIndex = this.selectedIndex;
		let data = this.listFriend.selectedItem as FriendData;
		if (data) {
			this.currentState = `chat`;
			let idx: number = Friends.ins().indexOfFriendList(data.id);
			// 这句代码打开会导致切换好友聊天时界面不会被刷新
			// if (this.listChat.dataProvider) {
			// 	WatcherUtil.removeFromArrayCollection(this.listChat.dataProvider as eui.ArrayCollection);
			// }
			this.listChat.dataProvider = Friends.ins().friendsList.getItemAt(idx).acMsg;

			//修复私聊聊天信息不会置底bug
			this.scroller.viewport.validateNow();
			if (this.scroller.viewport.contentHeight > this.scroller.height) {
				this.scroller.viewport.scrollV = this.scroller.viewport.contentHeight - this.scroller.height;
			}
		} else {
			this.currentState = `nofriend`;
		}

	}

	private onChange() {
		this.updateView();
		let data = this.listFriend.selectedItem;
		if (data)
			Friends.ins().sendRecentChat(data.id);
	}

	private onTap(e: egret.Event) {
		switch (e.target) {
			case this.faceBtn:
				ViewManager.ins().open(ChatEmojiWin, this.input);
				break;
			case this.btnSend:
				let data = this.listFriend.selectedItem as FriendData;
				if (!data)
					return;
				if (Actor.level < GlobalConfig.FriendLimit.chatLv) {
					UserTips.ins().showTips(GlobalConfig.FriendLimit.chatLv + "级开放");
				} else if (this.input.text.length > GlobalConfig.FriendLimit.contentLimit) {
					UserTips.ins().showTips("你说的话太长了");
				} else if (this.input.text.length > 0) {
					Friends.ins().sendChat(data.id, this.input.text + "");
					this.input.text = "";
				}
				break;
		}
	}
}