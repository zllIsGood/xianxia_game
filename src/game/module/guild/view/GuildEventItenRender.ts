class GuildEventItenRender extends BaseItemRender {

	private info: eui.Label;

	public constructor() {
		super();
		this.skinName = "GuildEventItemSkin";
	}
	protected dataChanged(): void {
		if (typeof this.data == 'string') {
			let str: string = this.data;
			if (str && str != "")
				this.info.textFlow = new egret.HtmlTextParser().parser(str);
		}
	}
}