class ChatWin extends BaseEuiView {

	/** 窗口展开时高度 */
	public static BIG_HEIGHT: number = 850;
	/** 窗口收起时高度 */
	public static LITTLE_HEIGHT: number = 370;

	public winGroup: eui.Group;
	public upBtn: eui.Button;
	public closeBtn0: eui.Button;
	public chatList: eui.List;
	public chatInput: eui.EditableText;
	public sendBtn: eui.Button;
	public tab: eui.TabBar;
	public barList: eui.Scroller;
	public input: eui.TextInput;
	public sendBtn0: eui.Button;
	public allReceiveBtn: eui.Button;

	private redPoint2:eui.Image;

	private cruIndex: number = 0;
	private defaultText: string;

	private dataList: eui.ArrayCollection = new eui.ArrayCollection();

	private fistOpenGuild: boolean = true;

	private oldChangle: number;

	private faceBtn: eui.Button;

	/** 界面是否展开 */
	private isStretch: boolean = false;
	
	constructor() {
		super();
		this.isTopLevel = true;
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "ChatSkin";

		this.defaultText = "点击输入咨询内容";

		this.chatInput.maxChars = 30;
		this.input.maxChars = 100;

		let arr: string[] = ["综合", "世界", "仙盟", "系统"];
		this.tab.dataProvider = new eui.ArrayCollection(arr);
		this.chatList.touchEnabled = false;

		this.cruIndex = 0;
	}

	public open(...param: any[]): void {

		let world: string = KFBossSys.ins().isKFBossBattle? "跨服":"世界";
		this.tab.dataProvider = new eui.ArrayCollection(["综合", world, "仙盟", "系统"]);

		if (this.input.text.length == 0) {
			this.input.text = this.defaultText;
			this.input.textColor = 0x6C6C6C;
		}
		else
			this.input.textColor = 0xDFD1B5;

		this.addTouchEvent(this.faceBtn, this.onTap);
		this.addTouchEvent(this.chatList, this.onListTap);
		this.addTouchEvent(this.upBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.sendBtn, this.onTap);
		this.addTouchEvent(this.allReceiveBtn, this.onTap);
		this.observe(Chat.ins().postNewChatMsg, this.getNewOne);
		this.chatInput.addEventListener(egret.FocusEvent.FOCUS_IN, this.textInOn, this);
		this.observe(Chat.ins().postSendInfoSuccess, this.textInOn);
		this.addChangeEvent(this.tab, this.selectIndexChange);
		this.addChangingEvent(this.tab, this.checkIsOpen);
		this.addTouchEvent(this.sendBtn0, this.onTap);
		this.input.addEventListener(egret.FocusEvent.FOCUS_IN, this.updateInput, this);
		this.observe(Guild.ins().postGetNewGuildMessage, this.getNewOneGuild);
		this.observe(Guild.ins().postAllGuildMessage, this.updataList);
		this.observe(UserMail.ins().postMailDetail, this.setOpenMail);
		this.observe(UserMail.ins().postMailData, this.onSendMail);
		this.observe(Guild.ins().postQuitGuild,this.updateMsgRedPoint);
		this.addTouchEvent(this.chatList, this.onSendMail);

		//如果上次打开的是仙盟，退出了仙盟则默认打开综合
		if(this.cruIndex == 2 && !Guild.ins().guildID) {
			this.cruIndex = 0;
		} else if(this.cruIndex > 2 ) {
			this.cruIndex = 0;
		}
		this.backSelect(this.cruIndex);
		this.selectIndexChange(null);
		this.addDataProviderEvent();
	}

	public destoryView(): void {
	}

	private addDataProviderEvent() {
		if (this.chatList.dataProvider) {
			this.chatList.dataProvider.addEventListener(eui.CollectionEvent.COLLECTION_CHANGE, this.listDataChange, this);
		}
	}

	private removeDataProviderEvent() {
		if (this.chatList.dataProvider) {
			this.chatList.dataProvider.removeEventListener(eui.CollectionEvent.COLLECTION_CHANGE, this.listDataChange, this);
		}
	}

	private updateInput(): void {
		if (this.input.text == this.defaultText) {
			this.input.text = "";
			this.input.textColor = 0xDFD1B5;
		}
	}

	private checkIsOpen(e: egret.Event) {
		let tab = e.target;
		if (tab.selectedIndex == 2 && !Guild.ins().guildID) {
			UserTips.ins().showTips("请先加入仙盟");
			e.preventDefault();
			// this.cruIndex = this.oldChangle;
			// this.updataList(true);
			return;
		}
	}

	private selectIndexChange(e: egret.Event): void {
		this.oldChangle = this.cruIndex;
		this.cruIndex = this.tab.selectedIndex;
	
		if (this.cruIndex == 2 && this.fistOpenGuild) {
			this.fistOpenGuild = false;
			Guild.ins().sendAllGuildMessage();
		}
		this.updataList(true);
		this.refushBar();
		
	}
	private backSelect(id: number): void {
		this.tab.selectedIndex = id;
		this.refushBar(200);
	}

	/** 点击请求一个邮件详情 */
	private onSendMail(e: egret.TouchEvent): void {
		if (!e) return;
		if (this.cruIndex == 5) {
			let item: MailItem = e.target.parent as MailItem;
			if (item) {
				let mailData: MailData = item.data as MailData;
				if (mailData) {
					UserMail.ins().sendMailContentData(mailData.handle);
				}
			}
		}
	}

	/** 更新邮件状态 */
	private setOpenMail(mailData: MailData): void {
		if (this.cruIndex == 5) {
			for (let i: number = 0; i < this.chatList.numChildren; i++) {
				let item: MailItem = this.chatList.getChildAt(i) as MailItem;
				if ((item.data as MailData).handle == mailData.handle) {
					item.data = mailData;
					break;
				}
			}
		}
	}



	/** 更新list列表 */
	private updataList(barChange: boolean = false): void {
		switch (this.cruIndex) {
			case 0: //综合
				this.currentState = 'all';
				this.removeDataProviderEvent();
				this.chatList.dataProvider = null;
				this.chatList.itemRendererSkinName = `ChatItemSkin3`;
				this.chatList.itemRenderer = ChatListItemRenderer3;
				this.chatList.dataProvider = Chat.ins().chatListData2;
				this.addDataProviderEvent();
				break;
			case 1: //世界
				this.currentState = 'world';
				this.removeDataProviderEvent();
				this.chatList.dataProvider = null;
				// if (!this.isStretch) {
				// 	this.chatList.itemRendererSkinName = `ChatItemSkin`;
				// } else {
				// 	this.chatList.itemRendererSkinName = `ChatHeadItemSkin`;
				// }
				this.chatList.itemRendererSkinName = `ChatItemSkin`;
				this.chatList.dataProvider = Chat.ins().chatListData;
				this.chatList.itemRenderer = ChatListItemRenderer;
				this.addDataProviderEvent();
				break;
			case 2: //仙盟
				this.currentState = 'guild';
				this.removeDataProviderEvent();
				this.chatList.dataProvider = null;
				// if (!this.isStretch) {
				// 	this.chatList.itemRendererSkinName = `ChatGuildItemSkin`;
				// } else {
				// 	this.chatList.itemRendererSkinName = `ChatHeadItemSkin`;
				// }
				this.chatList.itemRendererSkinName = `ChatGuildItemSkin`;
				this.chatList.itemRenderer = ChatGuildItemRender;
				this.chatList.dataProvider = Guild.ins().guildMessageInfoData;
				this.addDataProviderEvent();
				break;
			case 3: //系统
				this.currentState = 'sys';
				this.removeDataProviderEvent();
				this.chatList.itemRenderer = ChatSystemItemRenderer;
				this.chatList.dataProvider = Chat.ins().systemListData;
				this.addDataProviderEvent();
				break;
			case 4: //客服
				this.currentState = 'customService';
				this.removeDataProviderEvent();
				break;
			// case 4: //邮件
			// 	this.chatList.itemRenderer = MailItem;
			// 	// this.dataList.source = UserMail.ins().mailData;
			// 	this.chatList.dataProvider = UserMail.ins().mailListData;
			// 	this.currentState = 'mail';
			// 	break;
		}
		// this.chatList.validateNow();
		this.chatList.dataProviderRefreshed();
		this.listDataChange();
		this.updateMsgRedPoint();
	}

	private updateMsgRedPoint() {
		//跨服中不显示红点
		if (KFServerSys.ins().isKF) {
			this.redPoint2.visible = false;
			return;
		}
		if (this.tab.selectedIndex == 2) {
			Guild.ins().hasNewMsg = false;
		}
		this.redPoint2.visible = Guild.ins().hasNewMsg;
	}

	private getNewOne(msg: any): void {
		if (Friends.ins().indexOfBlackList(msg.id) != -1) return;
		this.refushBar();
		this.updateMsgRedPoint();
	}

	private getNewOneGuild(msg: any): void {
		if (Friends.ins().indexOfBlackList(msg.id) != -1) return;
		this.refushBar();
	}

	private listDataChange(): void {
		if (this.cruIndex != 4) {
			if (this.cruIndex == 5)
				this.refushBarListTop();
			else
				this.refushBar();
		}
	}

	private refushBar(timer:number = 150): void {
		// TimerManager.ins().remove(this.refushBarList, this);
		TimerManager.ins().doTimer(timer, 1, this.refushBarList, this);
	}

	/** 设置滚动到列表底部 */
	private refushBarList(): void {
		this.barList.viewport.validateNow();
		if (this.barList.viewport.contentHeight > this.barList.height) {
			this.barList.viewport.scrollV = this.barList.viewport.contentHeight - this.barList.height;
		}
		
	}

	/** 设置滚动到列表定部 */
	private refushBarListTop(): void {
		this.barList.viewport.scrollV = 0;
	}

	private textInOn(): void {
		
		if (this.chatInput.text == "点击输入聊天内容") {
			this.chatInput.text = "";	
		}
	}

	private callBack(): void {
		this.input.text = "";
	}

	/** 设置界面展开/收起 */
	private setStretchWin(): void {
		if (this.isStretch) {
			this.isStretch = false;
			this.upBtn.scaleY = 1;
			this.winGroup.height = ChatWin.LITTLE_HEIGHT;
		} else {
			this.isStretch = true;
			this.upBtn.scaleY = -1;
			this.winGroup.height = ChatWin.BIG_HEIGHT;
		}
		this.updataList();
	}

	/** 邮件一键领取 */
	private allReceiveMail(): void {
		let list: number[] = [];
		let mailList: MailData[] = UserMail.ins().getMailByReceive();
		for (let i: number = 0; i < mailList.length; i++) {
			list.push(mailList[i].handle)

		}
		UserMail.ins().sendGetItem(list);
	}

	private onListTap() {
		let selectedItem = this.chatList.selectedItem;
		if (selectedItem && (selectedItem instanceof ChatInfoData || selectedItem instanceof GuildMessageInfo || selectedItem instanceof ChatSystemData)) {
			if (selectedItem instanceof ChatSystemData) {
				let str: string = (selectedItem as ChatSystemData).str;
				if (str && str.indexOf("|E:") >= 0) {
					this.onLink(str);
					return;
				}
			}

			if (selectedItem.lv != undefined)
				ViewManager.ins().open(PlayerTipsWin, selectedItem);
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
				if (!KfArenaSys.ins().checkIsMatching())
					return;
				UserFb.ins().sendEnterTFRoom(+list[1]);
				break;
			case "2": //加入跨服竞技场队伍
				KfArenaSys.ins().sendJoinTeam(+list[1]);
				break;
		}
	}


	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.faceBtn:
				ViewManager.ins().open(ChatEmojiWin, this.chatInput);
				break;
			case this.upBtn://收缩窗口按钮
				this.setStretchWin();
				// this.backSelect(this.cruIndex);
				this.refushBar(200);
				break;
			case this.closeBtn0://关闭按钮
				this.chatInput.text = "点击输入聊天内容";
				ViewManager.ins().close(this);
				break;
			case this.sendBtn://发送聊天按钮
				if (!Chat.ins().canSpeak) {
					UserTips.ins().showTips("|C:0xf3311e&T:发言次数过快|");
					return;
				}
				if (this.chatInput.text == "点击输入聊天内容") {
					UserTips.ins().showTips("|C:0xf3311e&T:请输入聊天内容|");
					return;
				}
				Chat.ins().startInterval();
				//仙盟聊天
				if (this.cruIndex == 2) {
					Guild.ins().sendGuildMessage(this.chatInput.text);
					this.chatInput.text = "";
				}
				else {
					//GM命令
					if (this.chatInput.text.indexOf("@") > -1) {
						GameLogic.ins().sendGMCommad(this.chatInput.text);
						if(this.chatInput.text == "@version")
						{
							WarnWin.show(Version.BUILD_NUMBER, null, this, null, null, "sure");
						}
						else if(this.chatInput.text == "@player")
						{
							PlayerAttrManager.ins().getAttr();
						}
						return;
					}
					//世界聊天
					if (Chat.ins().checkRepeatString(this.chatInput.text)) {
						Chat.ins().sendChatInfo(7, this.chatInput.text);
						Chat.ins().UpSpeak = this.chatInput.text;
						this.chatInput.text = "";
					}
				}
				break;
			case this.sendBtn0://客服按钮
				if (this.input.text.length == 0 || this.input.text == this.defaultText) {
					UserTips.ins().showTips("内容不能为空");
					return;
				}
				//GM命令
				if (this.input.text.indexOf("@") > -1) {
					GameLogic.ins().sendGMCommad(this.input.text);
					return;
				}
				//支付测试，正式版必须把此代码注释调	$xxx
				if (this.input.text.indexOf("$") > -1) {
					let rmb: number = parseInt(this.input.text.slice(1));
					// SDK.pay(0, rmb, "测试");
					return;
				}
				ReportData.getIns().advice(this.input.text, this.callBack, this);
				break;
			// case this.allReceiveBtn://邮件一键领取
			// 	this.allReceiveMail();
			// 	break;
		}
	}
}

ViewManager.ins().reg(ChatWin, LayerManager.UI_Popup);