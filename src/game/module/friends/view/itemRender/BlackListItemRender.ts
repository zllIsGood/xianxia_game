class BlackListItemRender extends BaseItemRender {
	public img_userIcon: eui.Image;
	public label_name: eui.Label;
	public btn_delete: eui.Button;
	private labelGuild: eui.Label;
	private headBg: eui.Image;
	public constructor() {
		super();
	}

	public childrenCreated(): void {
		super.childrenCreated();
		

		this.init();
	}

	public init() {
		this.btn_delete.addEventListener(egret.TouchEvent.TOUCH_TAP, (e) => {
			Friends.ins().sendDelete(4, this.data.id);
			e.stopPropagation();
			e.stopImmediatePropagation();
		}, this)

		this.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
			if (this.data)
				ViewManager.ins().open(PlayerTipsWin, this.data);
		}, this);

	}

	public dataChanged(): void {
		super.dataChanged();

		let data: FriendData = this.data;
		this.label_name.text = data.name + "(" + (data.zs > 0 ? data.zs + "转" : "") + data.lv + "级)";

		this.img_userIcon.source = `head_${data.job}${data.sex}` + (data.online == 1 ? "" : "b");
		this.labelGuild.text = data.guildName;
		// if (data.online == 1) {
		// 	this.label_name.filters = this.img_userIcon.filters = [];
		// } else {
		// 	let colorMatrix: number[] = [0.3, 0.6, 0, 0, 0, 0.3, 0.6, 0, 0, 0, 0.3, 0.6, 0, 0, 0, 0, 0, 0, 1, 0];
		// 	this.label_name.filters = this.img_userIcon.filters = [new egret.ColorMatrixFilter(colorMatrix)];
		// }
		// this.headBg.source = ChatListItemRenderer.HEAD_BG[data.sex];
	}
}