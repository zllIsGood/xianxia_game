class FriendHeadItem extends BaseItemRender {
	public constructor() {
		super();
	}

	public redPoint: eui.Image;
	private img_userIcon: eui.Image;
	private label_name: eui.Label;
	private imgBg: eui.Image;
	protected dataChanged() {
		let data = this.data as FriendData;
		this.label_name.text = data.name;
		this.img_userIcon.source = `head_${data.job}${data.sex}`;
		// this.imgBg.source = ChatListItemRenderer.HEAD_BG[data.sex];
	}

	public setRedPointState(isVisible: boolean = false) {
		this.redPoint.visible = isVisible;
	}
}