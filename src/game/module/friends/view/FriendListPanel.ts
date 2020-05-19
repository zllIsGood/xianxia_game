class FriendListPanel extends BaseComponent {
	public constructor() {
		super();
		this.name = `好友`;
		// this.skinName = `FriendInfoSkin`;
	}

	protected childrenCreated(){
		this.init();	
	}

	public init() {
		this.list.itemRenderer = FriendListItemRender;

	}

	private list: eui.List;
	private btnFind:eui.Button;

	public open() {
		this.updateView();
		this.readMsg();
		this.addTouchEvent(this.btnFind,this.onTap);
	}

	private readMsg() {
		for (let key in Friends.ins().newMsg) {
			Friends.ins().newMsg[key] = false;
		}
	}

	private updateView() {
		this.list.dataProvider = Friends.ins().friendsList;

	}

	private onTap(e: egret.Event) {
		switch(e.target){
			case this.btnFind:
			ViewManager.ins().open(FriendsAddWin);
			break;
		}
	}
}