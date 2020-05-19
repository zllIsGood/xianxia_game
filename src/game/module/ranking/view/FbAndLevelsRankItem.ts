class FbAndLevelsRankItem extends BaseItemRender {
	// public bg: eui.Image;
	public rank: eui.Label;
	public nameLabel: eui.Label;
	public zhanli: eui.Label;
	public ce: eui.Label;
	public vipImg: eui.Image;
	public vip: eui.Group;
	public monthcard: eui.Image;

	public constructor() {
		super();
		this.skinName = "FbRankItemSkin";
	}

	public open(...param: any[]) {
		this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.openDetail, this);
	}

	public close(): void {
		this.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.openDetail, this);
	}

	protected dataChanged(): void {
		this.rank.text = this.data[RankDataType.DATA_POS] + "";

		this.monthcard.visible = this.data[RankDataType.DATA_MONTH] == 1;
		let vipLevel: number = this.data[RankDataType.DATA_VIP];
		this.vipImg.visible = vipLevel > 0;
		this.vip.removeChildren();
		if (vipLevel > 0)
			this.vip.addChild(BitmapNumber.ins().createNumPic(vipLevel, '5'));

		this.nameLabel.text = this.data[RankDataType.DATA_PLAYER];
		this.zhanli.text = CommonUtils.overLength(this.data[RankDataType.DATA_POWER]);
		this.ce.text = this.data[RankDataType.DATA_COUNT] + "关";
		// this.bg.visible = this.data[RankDataType.DATA_POS] % 2 == 1;
	}

	private openDetail() {
		UserReadPlayer.ins().sendFindPlayer(this.data.playId);
	}
}