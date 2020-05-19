class ChatMainUI extends BaseEuiView {

	/**聊天tips */
	private chat: ChatTipsView;
	private message: eui.Image;
	private chatList: eui.List;
	private dataList: eui.ArrayCollection;
	private chatGroup: eui.Group;

	private resId: string[] = ["xlt_98", "xlt_99"];
	private fistOpenGuild:boolean = true;
	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "ChatMainSkin";

		this.chatList.itemRenderer = ChatListItemRenderer2;
		this.chatList.itemRendererSkinName = `ChatItemSkin2`;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.message, this.onTap);
		this.addTouchEvent(this.chatList, this.onTap);
		this.observe(Chat.ins().postSysChatMsg, this.getNewNotice);
		this.observe(Chat.ins().postNewChatMsg, this.updateNewChatMsg);
		this.observe(GameLogic.ins().postEnterMap, this.checkShow);
		this.observe(UserTask.ins().postUpdteTaskTrace, this.updateTipShow);
		this.dataList = new eui.ArrayCollection([]);
		this.updataList();
		this.updateTipShow();
		this.setChatTipShow(Chat.ins().isShowTip);
		this.checkShow();
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.message:
			case this.chatList: {
				ViewManager.ins().open(ChatWin);
				break;
			}
		}
	}

	private getNewNotice(msg: ChatSystemData): void {
		if (msg.type == 7) {
			if (!this.chat) {
				this.chat = new ChatTipsView();
				this.chat.y = this.message.y + 12;
				this.chat.x = this.message.x + 50;
			}
			if (!this.chat.parent) {
				this.addChildAt(this.chat, 0);
			}
			this.chat.setData(msg);
		}  else if (msg.type == 3) {
			this.updataList();
		}
	}

	private updateNewChatMsg() {
		if(this.fistOpenGuild) {
			this.fistOpenGuild = false;
			if(Guild.ins().guildID) {
				Guild.ins().sendAllGuildMessage();
			}
		}
		this.updataList();
	}


	private updataList(): void {
		this.dataList.source = Chat.ins().chatListTip2.concat();
		this.chatList.dataProvider = this.dataList;
	}

	public checkShow(): void {
		let fbID: number = GameMap.fbType;
		this.updataLayer(fbID != 0);
		this.updataList()
	}

	/**
	 * 更新主界面显示布局
	 * @param value    是否在副本中
	 */
	public updataLayer(value: boolean): void {
		// if (value)
			this.chatGroup.bottom = 76;
		// else
		// 	this.chatGroup.bottom = 137;
	}

	/** 设置聊天信息显示/隐藏 */
	public setChatTipShow(value: boolean): void {
		this.chatList.visible = true;
	}

	/** 更新聊天tip显示状态 */
	private updateTipShow(): void {
		let boo: boolean = true;
		this.setChatTipShow(boo);
	}

}
ViewManager.ins().reg(ChatMainUI, LayerManager.UI_Popup);
