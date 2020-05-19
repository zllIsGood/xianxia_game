/**
 * 熔炼装备格子
 */
class BookUpItem extends ItemBase {
	private mc: MovieClip;

	constructor() {
		super();
		this.touchChildren = false;

	}

	protected childrenCreated(): void {
		super.childrenCreated();

		this.init();
	}

	public init() {
	
		this.mc = new MovieClip;
		this.mc.x = 45;
		this.mc.y = 40;
	}

	protected dataChanged(): void {
		this.clear();
		if (this.data instanceof ItemData) {
			this.itemConfig = this.data.itemConfig;
			this.itemIcon.setData(this.itemConfig);
			if (this.itemConfig == null)return;

			let type = ItemConfig.getType(this.itemConfig);
			let job = ItemConfig.getJob(this.itemConfig);
			if (type == 4) {
				this.nameTxt.text = this.itemConfig.name;
			}
			else {
				// if (this.itemConfig.subType == ForgeConst.EQUIP_POS_TO_SUB[EquipPos.DZI]) {
				// this.nameTxt.text = this.itemConfig.name;
				// } else
				// this.nameTxt.text = this.itemConfig.zsLevel > 0 ? (this.itemConfig.zsLevel + "转") : ("lv." + this.itemConfig.level);
			}
			this.itemIcon.imgJob.source = (type == 0 || type == 4) && job && this.itemIcon.imgJob.visible ? `job${job}Item` : '';
		}
	}

	public onClick() {
	}

	public playEff(): void {
		if (this.data) {
			this.mc.playFile(RES_DIR_EFF + "litboom", 1);
			this.addChild(this.mc);
		}
	}

	protected clear(): void {
		super.clear();
		this.itemIcon.imgJob.source = null;
	}
}