/**
 * 组队副本结算玩家信息(协助者)
 * @author wanghengshuai
 *
 */
class AssistantHeadItemRender extends BaseItemRender {

	public imgHead: eui.Image;
	public imgBg: eui.Image;
	public Name: eui.Label;
	public charm: eui.Label;

	public constructor() {
		super();
		this.skinName = "assistantHeadSkin";
	}

	public childrenCreated(): void {
		super.childrenCreated();
	}

	public dataChanged(): void {
		//{vo:helpList[i], id:this._configID}
		this.Name.text = this.data.vo.roleName;
		this.imgBg.source = ChatListItemRenderer.HEAD_BG[this.data.vo.sex];
		this.imgHead.source = `head_${this.data.vo.job}${this.data.vo.sex}`;
		this.charm.text = `魅力值 +${GlobalConfig.TeamFuBenConfig[this.data.id].chiv}`;
	}
}