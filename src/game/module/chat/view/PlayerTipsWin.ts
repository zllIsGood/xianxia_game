class PlayerTipsWin extends BaseEuiView {
	public constructor() {
		super();
		this.skinName = `PlayerInfoSkin`;
	}

	private data: any;
	private labelName: eui.Label;
	private labelLv: eui.Label;
	private labelGuild: eui.Label;
	private imgBg: eui.Image;
	private imgHead: eui.Image;

	private btnInfo: eui.Button;
	private btnIgnore: eui.Button;
	private btnChat: eui.Button;
	private btnFriend: eui.Button;
	private btnDelete:eui.Button;
	private rect: eui.Rect;

	private sendFlower: eui.Button;

	public open(...param: any[]) {
		this.data = param[0];
		if (!this.data) {
			ViewManager.ins().close(PlayerTipsWin);
			return;
		}
		this.currId = 0;

			this.addTouchEvent(this.btnIgnore, this.onTap);
			this.addTouchEvent(this.btnChat, this.onTap);
			this.addTouchEvent(this.btnFriend, this.onTap);
			this.addTouchEvent(this.btnDelete, this.onTap);
			this.addTouchEvent(this.btnInfo, this.onTap);
			this.addTouchEvent(this.rect, this.onTap);
			this.addTouchEvent(this.sendFlower, this.onTap);
		
		this.observe(UserReadPlayer.ins().postPlayerResult, this.openOtherPlayerView);
		this.initView();
	}

	private onTap(e: egret.Event) {
		let isKF = (this.data.servId!=undefined && this.data.servId != GameServer.serverID);
		switch (e.target) {
			case this.btnChat:
				if(isKF) return;
				let index = Friends.ins().getFriendIndex(this.currId);
				if (index != -1) {
					ViewManager.ins().close(this);
					ViewManager.ins().open(FriendBgWin, 0, index);
				} else {
					UserTips.ins().showTips(`只有好友才能私聊`);
				}
				break;
			case this.btnInfo:
				if(isKF) return;
				UserReadPlayer.ins().sendFindPlayer(this.currId, this.data.name);
				break;
			case this.btnIgnore:
				if(isKF) return;
				Friends.ins().sendAddBlackList(this.currId, this.data.name);
				break;
			case this.btnDelete:
				let num = Friends.ins().getFriendIndex(this.currId);
				if (num != -1) {
					Friends.ins().sendDelete(1, this.data.id);
				} else {
					UserTips.ins().showTips(`不是好友`);
				}
				break;
			case this.btnFriend:
				if(isKF) return;
				Friends.ins().sendAddFriend(this.currId, this.data.name);
				break;
			case this.rect:
				ViewManager.ins().close(PlayerTipsWin);
				break;
			case this.sendFlower:
				let index1 = Friends.ins().getFriendIndex(this.currId);
				if (index1 != -1) {
					ViewManager.ins().close(this);
					ViewManager.ins().open(FlowerUseTipsWin1,this.data,1);
				} else {
					UserTips.ins().showTips(`只有好友才能赠送鲜花`);
				}
				break;
		}
	}

	private currId: number = 0;
	private initView() {
		if(!this.data) return;
		if (this.data instanceof FriendData) {
			let data = this.data as FriendData;
			this.labelName.text = data.name;
			if (data.zs)
				this.labelLv.text = `${data.zs}转${data.lv}级`;
			else
				this.labelLv.text = `${this.data.lv}级`;
			this.labelGuild.text = data.guildName;
			// this.imgBg.source = ChatListItemRenderer.HEAD_BG[data.sex];
			this.imgHead.source = `head_${data.job}${data.sex}`;
			this.currId = data.id;
		} else if (this.data instanceof GuildMemberInfo) {
			this.labelName.text = this.data.name;
			if (this.data.zsLevel)
				this.labelLv.text = `${this.data.zsLevel}转${this.data.level}级`;
			else
				this.labelLv.text = `${this.data.level}级`;
			this.labelGuild.text = Guild.ins().guildName ? Guild.ins().guildName : "";
			// this.imgBg.source = ChatListItemRenderer.HEAD_BG[this.data.sex];
			this.imgHead.source = `head_${this.data.job}${this.data.sex}`;
			this.currId = this.data.roleID;
		} else if (this.data instanceof GuildMessageInfo) {
			this.labelName.text = this.data.name;
			if (this.data.zsLevel)
				this.labelLv.text = `${this.data.zsLevel}转${this.data.lv}级`;
			else
				this.labelLv.text = `${this.data.lv}级`;
			this.labelGuild.text = this.data.guildName;
			// this.imgBg.source = ChatListItemRenderer.HEAD_BG[this.data.sex];
			this.imgHead.source = `head_${this.data.job}${this.data.sex}`;
			this.currId = this.data.roleId;
		} else {
			this.labelName.text = this.data.name;
			if (this.data.zsLevel)
				this.labelLv.text = `${this.data.zsLevel}转${this.data.lv}级`;
			else
				this.labelLv.text = `${this.data.lv}级`;
			this.labelGuild.text = this.data.guild;
			// this.imgBg.source = ChatListItemRenderer.HEAD_BG[this.data.sex];
			this.imgHead.source = `head_${this.data.job}${this.data.sex}`;
			this.currId = this.data.id;
		}

		if(this.data.servId!=undefined && this.data.servId != GameServer.serverID){
			this.btnInfo.currentState = "disabled";
			this.btnFriend.currentState = "disabled";
			this.btnDelete.currentState = "disabled";
			this.btnIgnore.currentState = "disabled";
			this.btnChat.currentState = "disabled";
		}
		
	}


	/**
	 * 查看角色界面
	 */
	private openOtherPlayerView(otherPlayerData) {
		//暂时屏蔽查看他人界面
		ViewManager.ins().close(this);
		ViewManager.ins().close(FriendBgWin);
		let win = <RRoleWin>ViewManager.ins().open(RRoleWin, otherPlayerData);
		if (KFServerSys.ins().isKF) {
			win.hideEx(2);
		}
	}
}

ViewManager.ins().reg(PlayerTipsWin, LayerManager.UI_Popup);