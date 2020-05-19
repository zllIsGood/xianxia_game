class HsSkillBookListItem extends BaseItemRender {
	private itemList: eui.List;
	private titleImg: eui.Image;

	public constructor() {
		super();
		this.skinName = `huanShouManualListSkin`;

		this.itemList.itemRenderer = SkillPrevieItem;
	}

	protected dataChanged(): void {

		let conf: HuanShouPreviewConfig = <HuanShouPreviewConfig>this.data;
		this.titleImg.source = conf.des;
		this.itemList.dataProvider = new eui.ArrayCollection(conf.ids);

	}
}