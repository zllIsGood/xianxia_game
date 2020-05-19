class FriendListItemRender extends BaseItemRender {
	public img_userIcon: eui.Image;
	public label_name: eui.Label;
	public label_power: eui.Label;
	public label_lastLogin: eui.Label;
	public btn_bg: eui.Button;
	public group_friend: eui.Group;
	public btn_chat: eui.Button;
	public btn_delete: eui.Button;
	public btn_blackList: eui.Button;
	private labelGuild: eui.Label;
	private headBg: eui.Image;
	public constructor() {
		super();
		this.skinName = `FriendsItemSkin`;
	}

	public childrenCreated(): void {
		super.childrenCreated();

		
		this.init();
	}



	public init() {
		this.btn_delete.visible = false;
		this.btn_chat.visible = true;
		if (!this.hasEventListener(egret.Event.REMOVED_FROM_STAGE)) {
			this.addEventListener(egret.Event.REMOVED_FROM_STAGE, () => {
				MessageCenter.ins().removeAll(this);
			}, this)
		}

		this.btn_chat.addEventListener(egret.TouchEvent.TOUCH_TAP, (e:egret.TouchEvent) => {
			// Friends.ins().postChatToFriend(this.data.id);
			e.stopPropagation();
			e.stopImmediatePropagation();
			let index = Friends.ins().getFriendIndex(this.data.id);
			if (index != -1) {
				ViewManager.ins().close(this);
				ViewManager.ins().open(FriendBgWin, 0, index);
			}
		}, this);
		this.btn_delete.addEventListener(egret.TouchEvent.TOUCH_TAP, (e:egret.TouchEvent) => {
			WarnWin.show(`确定要删除<font color='#f3311e'>${this.data.name}</font>吗?`, () => {
				Friends.ins().sendDelete(1, this.data.id);
			}, this);
			e.stopPropagation();
			e.stopImmediatePropagation();
		}, this);
		this.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
			if (this.data)
				ViewManager.ins().open(PlayerTipsWin, this.data);
		}, this);
		// this.btn_blackList.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
		// 	Friends.ins().sendAddBlackList(this.data.id, this.data.name);
		// }, this);
		// this.btn_bg.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
		// 	Friends.ins().postCloseFriendList()
		// }, this);

	}

	public dataChanged(): void {
		super.dataChanged();

		let data: FriendData = this.data;
		this.label_name.text = data.name + "(" + (data.zs > 0 ? data.zs + "转" : "") + data.lv + "级)";
		this.label_power.text = "战斗力:" + data.power;
		this.labelGuild.text = data.guildName;
		if (data.online == 1) {
			this.label_lastLogin.text = "在线";
			this.label_lastLogin.textColor = 0x27d61a;
			// this.label_name.filters = this.label_power.filters = this.img_userIcon.filters = [];
		} else {
			this.label_lastLogin.text = DateUtils.getFormatBySecond(Math.max(data.offLineSec, 60), 4);
			this.label_lastLogin.textColor = 0xFCFCFC;

			// let colorMatrix: number[] = [0.3, 0.6, 0, 0, 0, 0.3, 0.6, 0, 0, 0, 0.3, 0.6, 0, 0, 0, 0, 0, 0, 1, 0];
			// this.label_name.filters = this.label_power.filters = this.img_userIcon.filters = [new egret.ColorMatrixFilter(colorMatrix)];
		}

		// this.img_userIcon.source = `head_${data.job}${data.sex}`;
		this.img_userIcon.source = `head_${data.job}${data.sex}` + (data.online == 1 ? "" : "b");
		// this.headBg.source = ChatListItemRenderer.HEAD_BG[data.sex];
	}
}