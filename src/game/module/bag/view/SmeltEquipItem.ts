/**
 * 熔炼装备格子
 */
class SmeltEquipItem extends ItemBase {
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
			let type = ItemConfig.getType(this.itemConfig);
			let job = ItemConfig.getJob(this.itemConfig);
			if (type == 4) {
				this.nameTxt.text = this.itemConfig.name;
			}
			else {
				let curType = this.itemConfig ? ItemConfig.getSubType(this.itemConfig) : -1;

				if (curType == ForgeConst.EQUIP_POS_TO_SUB[EquipPos.DZI]) {
					this.nameTxt.text = this.itemConfig.name;
				} else {
					this.nameTxt.text = isNaN(this.itemConfig.zsLevel) ? ("lv." + (this.itemConfig.level || 1)) : (this.itemConfig.zsLevel + "转");
				}
				if (UserBag.fitleEquip.indexOf(this.itemConfig.id) != -1) {
					this.nameTxt.text = "无级别";
				}
			}
			this.itemIcon.imgJob.source = (type == 0 || type == 4) && job && this.itemIcon.imgJob.visible ? `common1_profession${job}` : '';
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
		// this.itemIcon.imgIcon.source = "bag_03";
		this.itemIcon.imgJob.source = null;
	}
}
