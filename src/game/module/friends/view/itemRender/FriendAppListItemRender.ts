class FriendAppListItemRender extends BaseItemRender {
	public img_userIcon: eui.Image;
	public label_name: eui.Label;
	public btn_yes: eui.Button;
	public btn_no: eui.Button;
	public labelGuild: eui.Label;
	private headBg: eui.Image;
	public constructor() {
		super();
		this.skinName = `FriendsAppListItemSkin`;
	}

	public childrenCreated(): void {
		super.childrenCreated();

		this.init();	
	}
	

	public init() {
		
		this.btn_yes.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTapYes, this)

		this.btn_no.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTapNo, this)

		this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
	}

	private onTapYes(e: egret.TouchEvent) {
		Friends.ins().sendAgreeApp(this.data.id, 1);
		e.stopPropagation();
		e.stopImmediatePropagation();
	}

	private onTapNo(e: egret.TouchEvent) {
		Friends.ins().sendAgreeApp(this.data.id, 0);
		e.stopPropagation();
		e.stopImmediatePropagation();
	}

	private onTap() {
		if (this.data)
			ViewManager.ins().open(PlayerTipsWin, this.data);
	}

	public dataChanged(): void {
		super.dataChanged();

		let data: FriendData = this.data;
		this.label_name.text = data.name + "(" + (data.zs > 0 ? data.zs + "转" : "") + data.lv + "级)";
		//this.label_power.text = "战斗力:" + data.power;

		this.img_userIcon.source = `head_${data.job}${data.sex}`;
		this.labelGuild.text = data.guildName;

		// this.headBg.source = ChatListItemRenderer.HEAD_BG[data.sex];
	}
}