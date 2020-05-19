class DressItemRenderer extends eui.ItemRenderer {
	public imgIcon: eui.Image;
	public imageName: eui.Label;
	public timelabel: eui.Label;
	public selectImage: eui.Image;
	public huanhuaImage: eui.Image;
	public redPoint0: eui.Image;

	constructor() {
		super();
		this.skinName = "DressItemSkin";
	}

	public dataChanged(): void {
		let config: DressItemInfo = this.data;
		if (config == null) return;
		this.redPoint0.visible = false;
		let id: number = config.zhuanban.cost["itemId"];
		this.imgIcon.source = id + "_png";
		if (config.isUser) {
			this.timelabel.visible = true;
		} else {
			this.timelabel.visible = false;
			let num: number = config.zhuanban.cost["num"];
			if (UserBag.ins().getItemCountById(0, id) >= num) {
				if (config.zhuanban.pos == 3 && Actor.level <= 16)
					this.redPoint0.visible = false;
				else
					this.redPoint0.visible = true;
			}
		}
		this.imageName.text = config.zhuanban.name;
		if (config.isDress)
			this.huanhuaImage.visible = true;
		else
			this.huanhuaImage.visible = false;
		if (config.timer == 0)
			this.timelabel.textFlow = new egret.HtmlTextParser().parser(StringUtils.addColor("永久", 0x35e62d));
		else if (config.timer > 0)
			this.timelabel.text = this.updateTimer(config.timer)
		else
			this.timelabel.visible = false;
	}

	private updateTimer(timer: number): string {
		let str: string = "";
		let endTimer: number = (DateUtils.formatMiniDateTime(timer) - GameServer.serverTime) / 1000;
		if (endTimer >= 0) str = DateUtils.getFormatBySecond(endTimer, 5, 2)
		return str;
	}

	public set selected(value: boolean) {
		this.selectImage.visible = value;
	}
}