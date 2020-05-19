/**
 * 组队副本好友邀请子项
 * @author wanghengshuai
 * 
 */
class FriendItemRender extends BaseItemRender{
	
	public labelName:eui.Label;
	public labelGuild:eui.Label;
	public labelLv:eui.Label;
	public imgHead:eui.Image;
	public imgBg:eui.Image;
	public inviteBtn:eui.Button;

	public constructor() {
		super();
		this.skinName = "friendItemSkin";
	}

	public dataChanged():void
	{
		//FriendData
		this.labelName.text = this.data.name;
		this.imgBg.source = ChatListItemRenderer.HEAD_BG[this.data.sex];
		this.imgHead.source = `head_${this.data.job}${this.data.sex}`;
		this.labelGuild.text = this.data.guildName ? this.data.guildName : "";
		this.labelLv.text = (this.data.zs ? this.data.zs + "级" : "") +  this.data.lv + "级";
	}
}