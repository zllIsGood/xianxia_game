class BookListItem extends BaseItemRender {
	private btnName: eui.Image;
	public isShow: boolean = false;
	public idList;//BookListConfig的idList
	public label: eui.Label;
	public redPoint: eui.Image;

	public constructor() {
		super();
		this.skinName = `TujiandaanniuSkin`;//与属性itemRendererSkinName里边的对应 不一定是文件名(tujiandaanniu)
		this.init();

	}
	protected init(): void {
		this.label.touchEnabled = false;
	}
	public destruct(): void {
	}
	protected dataChanged() {
		let data = this.data as BookListConfig;
		this.label.text = `${data.name}`;
		this.btnName.source = data.icon;
		this.idList = data.idList;
		this.checkRedPoint();
	}

	private checkRedPoint(): void {
		for (let k of this.idList) {
			if (Book.ins().getBookUpRedByListId(k) || Book.ins().getSuitRedPoint(k)) {
				this.redPoint.visible = true;
				return;
			}
		}
		this.redPoint.visible = false;
	}
}