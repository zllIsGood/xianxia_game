/**
 *
 */
class TipsGoodEquip extends BaseView {
	public itemName: eui.Label;
	public desc: eui.Label;
	public item: ItemBase;
	public isUsing: boolean;
	public bgMc: MovieClip;

	constructor() {
		super();
		this.skinName = "OrangeEquipNoticeSkin";
		this.isUsing = false;
		this.horizontalCenter = 0;
		// this.verticalCenter = 0;

		// this.bgMc = new MovieClip;
		// this.bgMc.x = 142;
		// this.bgMc.y = 58;
		// this.bgMc.touchEnabled = false;
		// this.addChild(this.bgMc);

	}

	public set data(item: any) {
		// this.bgMc.playFile(RES_DIR_EFF + "tekuangeff", 1, null, false);
		this.item.isShowName(false);
		if (item instanceof ItemData) {
			let q = ItemConfig.getQuality(item.itemConfig);
			this.item.showNum(true);
			this.item.data = item;
			if (q == 4) {
				this.desc.text = "传说物品！";
				this.itemName.visible = true;
			} else if (q == 5) {
				this.desc.text = "传说物品！";
				this.itemName.visible = true;
			}
			if (ItemConfig.getType(item.itemConfig) == 7) {
				this.desc.text = "恭喜获得:"
			}
			this.itemName.text = item.itemConfig.name;
			this.itemName.textColor = ItemBase.QUALITY_COLOR[q];
		}
		else {
			this.desc.text = "恭喜获得:";
			let data = item as TreasureBoxConfig;
			this.item.setItemImg(data.imgClose);
			this.itemName.text = data.name;
			this.itemName.textColor = ItemBase.QUALITY_COLOR[data.quality];
			this.item.showNum(false);
		}
	}


}
