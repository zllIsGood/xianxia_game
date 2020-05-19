/**
 * 跨服竞技场邀请界面
 * @author yuyaolong
 *
 */
class KfArenaInviteWin extends BaseEuiView {
	//public friendBtn: eui.Button;
	//public teamBtn: eui.Button;
	private listView: eui.List;
	public closeBtn0: eui.Button;
	private worldInvite: eui.Label;
	private listArray: eui.ArrayCollection;
	public friendList: FriendData[] = [];
	public guildList: GuildMemberInfo[] = [];
	private noPlayer: eui.Label;
	private type: number = 0;
	public cdTime: number = 30;
	public tab: eui.TabBar;

	public constructor() {
		super();
		this.skinName = "kfInviteSkin";
		this.isTopLevel = true;
		this.listView.itemRenderer = kfArenaMemberItemRender;
		this.worldInvite.textFlow = (new egret.HtmlTextParser).parser("<u>" + this.worldInvite.text + "</u>");
		this.listArray = new eui.ArrayCollection();
		this.listView.dataProvider = this.listArray;
		this.tab.itemRenderer = KfArenaBtn;
		this.updateTabRedPt();
	}

	public open(...args: any[]): void {
		this.tab.selectedIndex = 0;
		this.addTouchEvent(this.closeBtn0, this.onTouch);
		this.addTouchEvent(this.worldInvite, this.onTouch);
		this.addTouchEvent(this.tab, this.onTabClick);
		this.observe(KfArenaSys.ins().postKfArenaGuilds, this.updateGuild);
		this.type = KFInviteType.Friend;
		KfArenaSys.ins().sendGuilds(0);
		KfArenaSys.ins().sendGuilds(1);
	}

	private updateGuild(type: number): void {
		switch (type) {
			case KFInviteType.Friend:
				this.friendList = KfArenaSys.ins().getDataList(type);
				break;
			case KFInviteType.Guild:
				this.guildList = KfArenaSys.ins().getDataList(type);
				break;
		}
		this.setType(this.type);
	}

	/**切换选项卡*/
	public onTabClick(e: egret.Event = null): void {
		this.setType(this.tab.selectedIndex)
	}

	private updateTabRedPt(): void {
		this.tab.dataProvider = new ArrayCollection(["好  友","帮  派"]);
	}

	private onTouch(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.closeBtn0:
				ViewManager.ins().close(this);
				break;
			case this.worldInvite:
				let time = egret.getTimer();
				let cd = (KfArenaSys.ins().worldTimeCd - time) / 1000 >> 0;
				if (cd > 0) {
					UserTips.ins().showTips(`${cd}秒后可再次世界邀请`);
				}
				else {
					KfArenaSys.ins().worldTimeCd = time + this.cdTime * 1000;
					KfArenaSys.ins().sendWorldInvite();
					UserTips.ins().showTips(`邀请发送成功`);
				}
				break;
		}
	}

	private setType(type: number): void {
		this.type = type;
		switch (type) {
			case KFInviteType.Friend:
				this.listArray.source = this.friendList;
				this.noPlayer.visible = this.friendList.length == 0;
				break;
			case KFInviteType.Guild:
				this.listArray.source = this.guildList;
				this.noPlayer.visible = this.guildList.length == 0;
				break;
		}
	}
}

ViewManager.ins().reg(KfArenaInviteWin, LayerManager.UI_Popup);