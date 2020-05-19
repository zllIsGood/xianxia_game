/**
 * 天仙皮肤列表控件
 */
class ZhanLingSkinItem extends BaseItemRender {
	private icon: eui.Image;
	private select: eui.Image;
	private state: eui.Image;
	private label: eui.BitmapLabel;
	private redPoint: eui.Image;

	constructor() {
		super();
		this.skinName = 'ZhanlingZBItemSkin';

	}

	protected childrenCreated(): void {
		super.childrenCreated();
	}

	protected dataChanged(): void {
		if (!this.data)return;
		let id = this.data.id;
		let config: ZhanLingBase = GlobalConfig.ZhanLingBase[id];
		if (!config)return;
		let level = ZhanLingModel.ins().getZhanLingDataByLevel(id);
		this.icon.source = config.icon;
		let activated = ZhanLingModel.ins().getZhanLingDataById(id) ? true : false;
		let huanhuaed = ZhanLingModel.ins().ZhanLingSkinId == id;
		this.state.source = huanhuaed ? `pet_mask_yihuanhua` : activated ? `` : `pet_mask_head`;
		this.select.visible = false;
		this.label.text = level + "";
		this.label.visible = activated;
		let b = ZhanLingModel.ins().isUpGradeByStar(id) || ZhanLingModel.ins().isHintNum(id);
		if (!b) {
			b = ZhanLingModel.ins().isUpGradeByTalent(id);
		}
		this.redPoint.visible = b;
	}

	public destruct(): void {

	}

	public setSelect(v: boolean) {
		this.select.visible = v;
	}
}