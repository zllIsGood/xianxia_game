class HuanShouEquipItem extends BaseComponent {
	private itemIcon: ItemIcon;
	// private bless: eui.Image;
	private lvBg: eui.Image;
	private lv: eui.Image;
	private count: eui.Label;

	private equipName: eui.Label;
	private redPoint: eui.Group;

	private selectIcon: eui.Image;

	private itemConfig: ItemConfig;

	constructor() {
		super();
		this.skinName = `huanShouEquipItemSkin`;
		this.equipName.text = "";
	}

	protected dataChanged(): void {
		this.clear();

		if (!this.data) {
			return;
		}
		this.lvBg.visible = true;
		this.lv.visible = true;

		let ins = UserHuanShou.ins();
		if (this.data instanceof HsEquipData) {
			let equipData = this.data as HsEquipData;
			if (equipData.equipId) {
				this.itemConfig = GlobalConfig.ItemConfig[equipData.equipId];
				let config = ins.getEquipConfById(equipData.equipId);
				if (config) {
					this.lv.source = "hm00" + config.stage;
				} else {
					this.lvBg.visible = false;
					this.lv.visible = false;
				}
				this.setDataByConfig(this.itemConfig);
			} else {
				this.setItemImg("hs_equip" + (equipData.pos)+"_png");
			}
		} else if (this.data instanceof ItemData) {
			//道具数据
			this.itemConfig = this.data.itemConfig;
			let config = ins.getEquipConfById(this.itemConfig.id);
			if (config)
				this.lv.source = "hm00" + config.stage;
			else {
				this.lvBg.visible = false;
				this.lv.visible = false;
			}
			if (!this.itemConfig)
				return;
			this.setDataByConfig(this.itemConfig);
			this.data.count > 1 ? this.setCount(this.data.count + "") : this.setCount("");
		}
	}

	public setDataByConfig(config: ItemConfig): void {
		if (this.itemIcon && typeof this.itemIcon.setData == 'function') {
			this.itemIcon.setData(config);
		}
		if (ItemConfig.getType(config) == 0) {
			let nameStr: string = config.zsLevel > 0 ? (config.zsLevel + "转") : (config.level + `级`);
			//天珠特殊处理名字
			if (ItemConfig.getSubType(config) == 6) {
				nameStr = config.name;
			}
			this.equipName.text = nameStr
		} else {
			this.equipName.text = config.name;
		}

		if (ItemConfig.getType(config) != 0) {
			this.equipName.textColor = ItemBase.QUALITY_COLOR[config.quality];
		}


		// if (this.num != undefined) {
		// 	this.setCount(this.num + "");
		// }
	}

	private setCount(str: string): void {
		if (str.length > 4) {
			let wNum: number = Math.floor(Number(str) / 1000);
			str = wNum / 10 + "万";
		}
		this.count.text = str;
	}

	public setItemImg(str: string): void {
		this.lvBg.visible = false;
		this.lv.visible = false;
		this.itemIcon.imgIcon.source = str;
	}

	public setredPoint(value: boolean): void {
		this.redPoint.visible = value;
	}

	public select(b: boolean): void {
		this.selectIcon.visible = b;
	}

	/**
	 * 清除格子数据
	 */
	protected clear(): void {
		this.lvBg.visible = false;
		this.lv.visible = false;
		this.itemConfig = null;
		this.itemIcon.setData(null);
		this.count.text = "";
		this.equipName.text = "";
		this.equipName.textColor = 0xDFD1B5;
	}
}
