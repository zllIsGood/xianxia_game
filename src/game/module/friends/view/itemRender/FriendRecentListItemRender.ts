class FriendRecentListItemRender extends BaseItemRender {
	public label_name: eui.Label;
	public label_lastChat: eui.Label;
	public img_userIcon: eui.Image;
	public redPoint: eui.Image;



	public constructor() {
		super();
	}

	public childrenCreated(): void {
		super.childrenCreated();
	}

	public dataChanged(): void {
		super.dataChanged();

		let data: FriendData = this.data;
		this.label_name.text = data.name +
			"(" + (data.zs > 0 ? data.zs + "转" : "") + data.lv + "级)";
		this.label_lastChat.text = data.lastMsg;

		// this.img_userIcon.source = `head_${data.job}${data.sex}`;
		this.img_userIcon.source = `head_${data.job}${data.sex}` + (data.online == 1 ? "" : "b");

		this.redPoint.visible = Friends.ins().newMsg[data.id];

		// if (data.online == 1) {
		// 	this.label_name.filters = this.label_lastChat.filters = this.img_userIcon.filters = [];
		// } else {
		// 	let colorMatrix: number[] = [0.3, 0.6, 0, 0, 0, 0.3, 0.6, 0, 0, 0, 0.3, 0.6, 0, 0, 0, 0, 0, 0, 1, 0];
		// 	this.label_name.filters = this.label_lastChat.filters = this.img_userIcon.filters = [new egret.ColorMatrixFilter(colorMatrix)];
		// }
	}
}