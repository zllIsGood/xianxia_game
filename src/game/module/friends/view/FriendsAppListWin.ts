/**
 * 好友申请列表窗口
 */
class FriendsAppListWin extends BaseComponent {
	public img_title: eui.Image;
	public closeBtn0: eui.Button;
	public closeBtn: eui.Button;
	public list_appList: eui.List;
	public btn_allYes: eui.Button;
	public btn_allNo: eui.Button;

	public group_shenqing: eui.Group;
	private panelList:FriendData[]= [];

	constructor(){
		super();
		this.name = `申请`;
		// this.skinName = "FriendsAppListWinSkin";

	}


	public open(...param: any[]): void {
		// for (let k in this) {
		// 	if (this[k] instanceof eui.Button && !this[k].hasEventListener(egret.TouchEvent.TOUCH_TAP)) {
		// 		this.addTouchEvent((<eui.Button>this[k]), this.onTap);
		// 	}
		// }
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.btn_allNo, this.onTap);
		this.addTouchEvent(this.btn_allYes, this.onTap);

		this.list_appList.itemRenderer = FriendAppListItemRender;
		this.list_appList.dataProvider = Friends.ins().appList;

		this.observe(Friends.ins().postFriendChange, this.updateView);

		this.updateView();
		this.panelList = Friends.ins().appList.source;
	}

	public onTap(evt: egret.TouchEvent): void {
		switch (evt.target) {
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(FriendsAppListWin);
				break;
			case this.btn_allYes:
				// let source: FriendData[] = Friends.ins().appList.source;
				for (let item of this.panelList) {
					Friends.ins().sendAgreeApp(item.id, 1);
				}
				break;
			case this.btn_allNo:
				// let source: FriendData[] = Friends.ins().appList.source;
				for (let item of this.panelList) {
					Friends.ins().sendAgreeApp(item.id, 0);
				}
				break;
		}
	}

	public updateView(): void {
		if (this.group_shenqing) this.group_shenqing.visible = (Friends.ins().appList.length == 0);
	}
}

ViewManager.ins().reg(FriendsAppListWin, LayerManager.UI_Main);