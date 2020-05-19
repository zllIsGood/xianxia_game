/**
 * 组队副本好友邀请界面
 * @author wanghengshuai
 * 
 */
class FriendListWin extends BaseEuiView{
	
	public closeBtn:eui.Rect;
	public scroll:eui.Scroller;
	public list:eui.List;

	private _collect:ArrayCollection;

	private _des:string;

	public constructor() {
		super();
		this.skinName = "friendListSkin";
		this.isTopLevel = true;
	}

	public childrenCreated():void
	{
		super.childrenCreated();

		this.list.itemRenderer = FriendItemRender;
	}

	public open(...args:any[]):void
	{
		this._des = args[0];

		this.addTouchEvent(this, this.onTouch);
		this.addTouchEvent(this.list, this.onListTap);
		this.observe(Friends.ins().postFriendChange, this.update, this);
		this.update();
	}

	public close():void
	{
	}

	private update():void
	{
		if (!this._collect)
		{
			this._collect = new ArrayCollection();
			this.list.dataProvider = this._collect;
		}

		this._collect.source = Friends.ins().friendsList.source;
	}

	private onTouch(e:egret.TouchEvent):void
	{
		switch (e.target)
		{
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
		}
	}

	private onListTap(e:egret.TouchEvent):void
	{
		let selectedItem:FriendData = this.list.selectedItem;
		if (selectedItem){
			Friends.ins().sendChat(selectedItem.id, this._des);
			UserTips.ins().showTips(`成功发出邀请`);
		}
	}
}

ViewManager.ins().reg(FriendListWin, LayerManager.UI_Popup);