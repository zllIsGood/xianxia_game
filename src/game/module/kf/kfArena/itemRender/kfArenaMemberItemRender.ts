class kfArenaMemberItemRender extends BaseItemRender {
	public nameLab: eui.Label;
	public powerLab: eui.Label;
	public scoreLab: eui.Label;
	public winRateLab: eui.Label;
	public inviteBtn: eui.Button;
	private face: eui.Image;
	private vipTitle: eui.Image;
	private itemData: GuildMemberInfo;

	public constructor() {
		super();
	}

	public childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}


	

	public init() {
		
		this.itemData = new GuildMemberInfo();
		this.inviteBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);

	}

	public dataChanged(): void {
		if (this.data instanceof GuildMemberInfo) {
			this.itemData = this.data;
		}
		if (!this.data) return;
		this.nameLab.text = this.itemData.name;
		this.powerLab.text = `战力：${CommonUtils.overLengthChange(this.itemData.attack)}`;
		this.scoreLab.text = `积分：${this.itemData.score}`;
		this.winRateLab.text = `胜率：${this.itemData.winRate}%`;
		this.face.source = `head_${this.itemData.job}${this.itemData.sex}`;
		this.vipTitle.visible = this.itemData.vipLevel != 0;
	}

	private onTap(e: egret.TouchEvent) {
		KfArenaSys.ins().sendInvite(this.itemData.roleID);
	}

	public destruct(): void {
		this.inviteBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
	}
}