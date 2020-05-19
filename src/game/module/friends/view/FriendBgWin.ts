class FriendBgWin extends BaseEuiView {
	public constructor() {
		super();
		this.skinName = `FriendsWinSkin`; 
		this.isTopLevel = true;
		this.tab.dataProvider = this.viewStack;
		// this.setSkinPart(`friendChatPanel`, new FriendChatPanel());
		// this.setSkinPart(`friendPanel`, new FriendListPanel());
		// this.setSkinPart(`friendAppListPanel`, new FriendsAppListWin());
		// this.setSkinPart(`blackListPanel`, new BlackListWin());
		// this.setSkinPart(`mailPanel`, new MailWin());
	}

	private viewStack: eui.ViewStack;
	private tab: eui.TabBar;
	private blackListPanel: BlackListWin;
	private friendChatPanel: FriendChatPanel;
	private friendAppListPanel: FriendsAppListWin;
	private friendPanel: FriendListPanel;
	private mailPanel: MailWin;
	private btnClose: eui.Button;
	private applyRedPoint: eui.Image;
	private mailRedPoint: eui.Image;

	public open(...param: any[]) {
		let index = param[0] ? param[0] : 0;
		let chatIndex = 0;
		if (index == 0) {
			chatIndex = param[1] ? param[1] : 0;
		}
		this.viewStack.selectedIndex = index;
		this.addTouchEvent(this.btnClose, this.onTap);
		this.addChangeEvent(this.tab, this.onTap);
		Friends.ins().sendFriendsList();
		this.friendPanel.open();
		this.friendChatPanel.open(chatIndex);
		this.friendAppListPanel.open();
		this.blackListPanel.open();
		this.mailPanel.open();
		this.updateRedPoint();

		this.observe(Friends.ins().postFriendChange, this.updateRedPoint);
		this.observe(UserMail.ins().postMailDetail, this.updateRedPoint);
		this.observe(UserMail.ins().postMailData, this.updateRedPoint);
	}

	public close() {
		super.close();

		this.friendPanel.close();
		this.friendChatPanel.close();
		this.friendAppListPanel.close();
		this.blackListPanel.close();
		this.mailPanel.close();
	}

	/** 未读邮件提示红点 */
	private onShowdMailPoint(): void {
		if (UserMail.ins().mailData) {
			this.mailRedPoint.visible = UserMail.ins().getUnreadMail() > 0;
		} else {
			this.mailRedPoint.visible = false;
		}
	}

	private updateRedPoint() {
		this.applyRedPoint.visible = Friends.ins().appList.length > 0;
		this.onShowdMailPoint();
	}

	private onTap(e: egret.Event) {
		switch (e.target) {
			case this.btnClose:
				ViewManager.ins().close(this);
				break;
			case this.tab:
				break;
		}
	}
}

ViewManager.ins().reg(FriendBgWin, LayerManager.UI_Popup);