class KfArenaDuanItemRender extends BaseItemRender {
	public dwName: eui.BitmapLabel;
	private reward: eui.List;
	private dwImg: eui.Image;
	private background: eui.Image;

	public constructor() {
		super();
	}

	public childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}




	public init() {
		
		this.reward.itemRenderer = ItemBase;

	}

	public dataChanged(): void {
		if (!this.data) return;
		let itemData = this.data;// as CrossArenaMetalAward;
		this.dwImg.source = `${itemData.icon}`;
		this.dwName.text = `${itemData.name}`;
		this.background.source = `${itemData.background}`;
		this.reward.dataProvider = new eui.ArrayCollection(itemData.award);
	}
}