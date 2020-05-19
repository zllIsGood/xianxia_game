/**
 * 组队副本结算玩家信息
 * @author wanghengshuai
 * 
 */
class ChallengerHeadItemRender extends BaseItemRender{
	
	public imgHead:eui.Image;
	public imgBg:eui.Image;
	public Name:eui.Label;
	
	public constructor() {
		super();
		this.skinName = "challengerHeadSkin";
	}

	public dataChanged():void
	{
		//TeamFuBenRoleVo
		this.Name.text = this.data.roleName;
		this.imgBg.source = ChatListItemRenderer.HEAD_BG[this.data.sex];
		this.imgHead.source = `head_${this.data.job}${this.data.sex}`;
	}
}