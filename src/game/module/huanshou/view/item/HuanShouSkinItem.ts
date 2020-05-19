class HuanShouSkinItem extends BaseItemRender {
	private icon: eui.Image;
	private select: eui.Image;
	private state: eui.Image;
	private label: eui.BitmapLabel;
	private redPoint: eui.Image;

	public constructor() {
		super();
		this.skinName = `ZhanlingZBItemSkin`;
	}

	public dataChanged(): void {

		let config = this.data as HuanShouSkinConf;
		if (!config) return;
		let zlData: HSSkinData = UserHuanShou.ins().skinList[config.skinId];
		let level = zlData ? zlData.talentLv : 0;
		this.icon.source = config.icon;

		let isOpen: boolean = zlData != undefined;
		let isHuanhua: boolean = isOpen && UserHuanShou.ins().skinChangeId == config.skinId;
		this.state.source = isHuanhua ? `com_tag_yichuzhan_png` : isOpen ? `` : `pet_mask_head`;
		this.label.text = level + "";
		this.label.visible = isOpen;

		let b = HuanShouRedPoint.ins().skinListRed[config.skinId] || HuanShouRedPoint.ins().skinListTalentRed[config.skinId];
		this.redPoint.visible = b;
	}

	public setSelect(v: boolean) {
		this.select.visible = v;
	}
}