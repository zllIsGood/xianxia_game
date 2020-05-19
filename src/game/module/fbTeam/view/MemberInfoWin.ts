/**
 * 组队副本玩家信息
 * @author wanghengshuai
 * 
 */
class MemberInfoWin extends BaseEuiView{
	
	public imgHead:eui.Image;
	public imgBg:eui.Image;
	public labelName:eui.Label;
	public labelGuild:eui.Label;
	public labelLv:eui.Label;
	public btnInfo:eui.Button;
	public btnRemove:eui.Button;
	public closeBtn:eui.Rect;

	private _data:TeamFuBenRoleVo;

	public constructor() {
		super();
		this.skinName = "memberInfoSkin";
		this.isTopLevel = true;
	}

	public open(...args:any[]):void
	{
		this._data = args[0];

		this.addTouchEvent(this, this.onTouch);
		this.observe(UserReadPlayer.ins().postPlayerResult, this.openOtherPlayerView);

		this.update();
	}

	public close():void
	{
	}

	private update():void
	{
		this.imgBg.source = ChatListItemRenderer.HEAD_BG[this._data.sex];
		this.imgHead.source = `head_${this._data.job}${this._data.sex}`;
		this.labelName.text = this._data.roleName;
		this.labelLv.text = (this._data.zs ? this._data.zs + "级" : "") +  this._data.lv + "级";
		this.btnRemove.visible = UserFb.ins().isTFCaptain;
		this.labelGuild.text = this._data.gh;
	}

	private onTouch(e:egret.TouchEvent):void
	{
		switch(e.target)
		{
			case this.btnInfo:
				UserReadPlayer.ins().sendFindPlayer(this._data.roleID);
				break;
			case this.btnRemove:
				UserFb.ins().sendOutTFRoom(this._data.roleID);
				ViewManager.ins().close(this);
				break;
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
		}
	}

	/**
	 * 查看角色界面
	 */
	private openOtherPlayerView(otherPlayerData) {
		ViewManager.ins().open(TeamFBCheckRoleWin, otherPlayerData);
	}
}

ViewManager.ins().reg(MemberInfoWin, LayerManager.UI_Popup);